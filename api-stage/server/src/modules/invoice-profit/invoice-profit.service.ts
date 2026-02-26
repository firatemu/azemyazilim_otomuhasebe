import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

// Transaction içindeki prisma client tipi
type PrismaTransactionClient = Parameters<Parameters<PrismaService['$transaction']>[0]>[0];

@Injectable()
export class InvoiceProfitService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  /**
   * Ürünün güncel maliyetini StockCostHistory'den al
   * @param stokId Stok ID
   * @param tenantId Tenant ID (opsiyonel, tenant kontrolü için)
   * @param prisma Prisma client instance (opsiyonel, transaction için)
   */
  private async getCurrentCost(
    stokId: string,
    tenantId?: string | null,
    prisma?: PrismaTransactionClient,
  ): Promise<number> {
    const db = prisma || this.prisma;
    const currentTenantId = tenantId ?? (await this.tenantResolver.resolveForQuery());

    // Stok üzerinden tenant kontrolü yap
    const stok = await db.stok.findUnique({
      where: { id: stokId },
      select: { tenantId: true },
    });

    if (!stok) {
      console.warn(`Stok bulunamadı: ${stokId}`);
      return 0;
    }

    // Tenant kontrolü: Eğer tenantId varsa ve stok'un tenantId'si farklıysa 0 döndür
    if (currentTenantId && stok.tenantId && stok.tenantId !== currentTenantId) {
      console.warn(
        `Stok tenantId (${stok.tenantId}) mevcut tenantId (${currentTenantId}) ile eşleşmiyor: ${stokId}`,
      );
      return 0;
    }

    const latestCost = await db.stockCostHistory.findFirst({
      where: {
        stokId,
        // Stok üzerinden tenant kontrolü yapıldığı için burada ekstra kontrol gerekmez
      },
      orderBy: { computedAt: 'desc' },
      select: { cost: true },
    });

    return latestCost ? Number(latestCost.cost) : 0;
  }

  /**
   * Fatura için kar hesapla ve kaydet
   * @param faturaId Fatura ID
   * @param userId User ID (opsiyonel)
   * @param prisma Prisma client instance (opsiyonel, transaction için)
   */
  async calculateAndSaveProfit(
    faturaId: string,
    userId?: string,
    prisma?: PrismaTransactionClient,
  ): Promise<void> {
    const db = prisma || this.prisma;
    const tenantId = await this.tenantResolver.resolveForQuery();

    try {
      // Faturayı kalemleriyle birlikte al
      const fatura = await db.fatura.findUnique({
        where: { id: faturaId },
        include: {
          kalemler: {
            include: {
              stok: {
                select: {
                  id: true,
                  tenantId: true,
                },
              },
            },
          },
        },
      });

      if (!fatura) {
        throw new NotFoundException(`Fatura bulunamadı: ${faturaId}`);
      }

      // Sadece SATIS faturaları için kar hesapla
      if (fatura.faturaTipi !== 'SATIS') {
        console.log(
          `Fatura ${faturaId} SATIS tipinde değil (${fatura.faturaTipi}), profit hesaplama atlandı`,
        );
        return;
      }

      // Kalem yoksa profit kaydı oluşturma
      if (!fatura.kalemler || fatura.kalemler.length === 0) {
        console.warn(`Fatura ${faturaId} için kalem bulunamadı, profit hesaplama atlandı`);
        return;
      }

      // Mevcut kar kayıtlarını sil (yeniden hesaplama için)
      // Önce kaç kayıt olduğunu kontrol et
      const existingCount = await db.invoiceProfit.count({
        where: { faturaId },
      });
      
      if (existingCount > 0) {
        console.log(`Fatura ${faturaId} için ${existingCount} mevcut profit kaydı siliniyor...`);
        const deleteResult = await db.invoiceProfit.deleteMany({
          where: { faturaId },
        });
        console.log(`Fatura ${faturaId} için ${deleteResult.count} profit kaydı silindi`);
        
        // Silme işleminden sonra kontrol et
        const remainingCount = await db.invoiceProfit.count({
          where: { faturaId },
        });
        if (remainingCount > 0) {
          console.warn(`Fatura ${faturaId} için ${remainingCount} kayıt hala mevcut, tekrar silme denemesi...`);
          await db.invoiceProfit.deleteMany({
            where: { faturaId },
          });
        }
      }

      let toplamSatisTutari = new Decimal(0);
      let toplamMaliyet = new Decimal(0);
      const profitRecords: Prisma.InvoiceProfitCreateManyInput[] = [];
      const seenKalemIds = new Set<string>(); // Duplicate kalem kontrolü için

      // Her kalem için kar hesapla
      for (const kalem of fatura.kalemler) {
        // Duplicate kalem kontrolü - aynı kalem.id için birden fazla kayıt oluşturma
        if (seenKalemIds.has(kalem.id)) {
          console.warn(
            `Fatura ${faturaId} için duplicate kalem bulundu (kalem.id: ${kalem.id}), atlandı`,
          );
          continue;
        }
        seenKalemIds.add(kalem.id);

        // StokId yoksa bu kalemi atla
        if (!kalem.stokId) {
          console.warn(
            `Fatura ${faturaId} kalem ${kalem.id} için stokId bulunamadı, atlandı`,
          );
          continue;
        }

        // Stok tenant kontrolü
        const stokTenantId = kalem.stok?.tenantId;
        if (tenantId && stokTenantId && stokTenantId !== tenantId) {
          console.warn(
            `Fatura ${faturaId} kalem ${kalem.id} için stok tenantId (${stokTenantId}) mevcut tenantId (${tenantId}) ile eşleşmiyor, atlandı`,
          );
          continue;
        }

        const miktar = kalem.miktar;
        const tutarNet = Number(kalem.tutar || 0);
        const kdvTutar = Number(kalem.kdvTutar || 0);
        const toplamSatisKdvDahil = tutarNet + kdvTutar; // KDV dahil satış tutarı
        const birimFiyatKdvDahil = miktar > 0 ? toplamSatisKdvDahil / miktar : 0;
        const birimMaliyet = await this.getCurrentCost(
          kalem.stokId,
          tenantId,
          db,
        );

        const toplamSatis = new Decimal(toplamSatisKdvDahil);
        const toplamMaliyetKalem = new Decimal(birimMaliyet * miktar);
        const kar = toplamSatis.minus(toplamMaliyetKalem);
        const karOrani =
          toplamMaliyetKalem.gt(0)
            ? kar.dividedBy(toplamMaliyetKalem).times(100)
            : new Decimal(0);

        toplamSatisTutari = toplamSatisTutari.plus(toplamSatis);
        toplamMaliyet = toplamMaliyet.plus(toplamMaliyetKalem);

        // Kalem bazlı kar kaydı (KDV dahil fiyat üzerinden)
        profitRecords.push({
          faturaId,
          faturaKalemiId: kalem.id,
          stokId: kalem.stokId,
          tenantId: tenantId || null,
          miktar,
          birimFiyat: new Decimal(birimFiyatKdvDahil),
          birimMaliyet: new Decimal(birimMaliyet),
          toplamSatisTutari: toplamSatis,
          toplamMaliyet: toplamMaliyetKalem,
          kar,
          karOrani,
        });
      }

      // Fatura bazlı toplam kar kaydı (faturaKalemiId = null)
      const toplamKar = toplamSatisTutari.minus(toplamMaliyet);
      const toplamKarOrani =
        toplamMaliyet.gt(0)
          ? toplamKar.dividedBy(toplamMaliyet).times(100)
          : new Decimal(0);

      // İlk kalemin stokId'sini al (toplam kaydı için referans)
      const firstKalemStokId = fatura.kalemler.find((k) => k.stokId)?.stokId;

      if (!firstKalemStokId) {
        console.warn(
          `Fatura ${faturaId} için geçerli stokId bulunamadı, toplam kaydı oluşturulamadı`,
        );
        // Kalem bazlı kayıtlar varsa onları kaydet
        if (profitRecords.length > 0) {
          await db.invoiceProfit.createMany({
            data: profitRecords,
          });
        }
        return;
      }

      profitRecords.push({
        faturaId,
        faturaKalemiId: null, // Toplam kaydı için null
        stokId: firstKalemStokId, // İlk kalemin stokId'si (sadece referans için)
        tenantId: tenantId || null,
        miktar: fatura.kalemler.reduce((sum, k) => sum + k.miktar, 0),
        birimFiyat: new Decimal(0), // Toplam kaydı için 0
        birimMaliyet: new Decimal(0), // Toplam kaydı için 0
        toplamSatisTutari,
        toplamMaliyet,
        kar: toplamKar,
        karOrani: toplamKarOrani,
      });

      // Tüm kayıtları oluştur (eğer varsa)
      if (profitRecords.length > 0) {
        // Duplicate kontrolü - faturaKalemiId bazlı
        const uniqueRecords = new Map<string, Prisma.InvoiceProfitCreateManyInput>();
        for (const record of profitRecords) {
          const key = record.faturaKalemiId || 'total';
          if (!uniqueRecords.has(key)) {
            uniqueRecords.set(key, record);
          } else {
            console.warn(
              `Fatura ${faturaId} için duplicate profit kaydı bulundu (faturaKalemiId: ${record.faturaKalemiId}), atlanıyor`,
            );
          }
        }

        const finalRecords = Array.from(uniqueRecords.values());
        await db.invoiceProfit.createMany({
          data: finalRecords,
        });
        console.log(
          `Fatura ${faturaId} için ${finalRecords.length} profit kaydı oluşturuldu`,
        );
      } else {
        console.warn(`Fatura ${faturaId} için profit kaydı oluşturulamadı (kalem yok veya geçersiz)`);
      }
    } catch (error: any) {
      console.error(
        `Fatura ${faturaId} için profit hesaplama hatası:`,
        error?.message || error,
        error?.stack,
      );
      throw error;
    }
  }

  /**
   * Fatura karını yeniden hesapla (düzenleme durumunda)
   */
  async recalculateProfit(
    faturaId: string,
    userId?: string,
  ): Promise<void> {
    await this.calculateAndSaveProfit(faturaId, userId);
  }

  /**
   * Fatura bazlı kar bilgisi
   */
  async getProfitByInvoice(faturaId: string) {
    const fatura = await this.prisma.fatura.findUnique({
      where: { id: faturaId },
      include: {
        cari: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
          },
        },
        kalemler: {
          include: {
            stok: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
              },
            },
          },
        },
      },
    });

    if (!fatura) {
      throw new NotFoundException(`Fatura bulunamadı: ${faturaId}`);
    }

    // Fatura toplam kar kaydı (faturaKalemiId = null)
    const toplamKar = await this.prisma.invoiceProfit.findFirst({
      where: {
        faturaId,
        faturaKalemiId: null,
      },
    });

    // Kalem bazlı kar kayıtları
    const kalemKarKayitlari = await this.prisma.invoiceProfit.findMany({
      where: {
        faturaId,
        faturaKalemiId: { not: null },
      },
      include: {
        faturaKalemi: {
          include: {
            stok: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
              },
            },
          },
        },
      },
      orderBy: {
        hesaplamaTarihi: 'asc',
      },
    });

    return {
      fatura: {
        id: fatura.id,
        faturaNo: fatura.faturaNo,
        tarih: fatura.tarih,
        cari: fatura.cari,
        toplamSatisTutari: toplamKar
          ? Number(toplamKar.toplamSatisTutari)
          : 0,
        toplamMaliyet: toplamKar ? Number(toplamKar.toplamMaliyet) : 0,
        toplamKar: toplamKar ? Number(toplamKar.kar) : 0,
        karOrani: toplamKar ? Number(toplamKar.karOrani) : 0,
      },
      kalemler: kalemKarKayitlari.map((kayit) => ({
        id: kayit.id,
        faturaKalemiId: kayit.faturaKalemiId,
        stok: kayit.faturaKalemi?.stok,
        miktar: kayit.miktar,
        birimFiyat: Number(kayit.birimFiyat),
        birimMaliyet: Number(kayit.birimMaliyet),
        toplamSatisTutari: Number(kayit.toplamSatisTutari),
        toplamMaliyet: Number(kayit.toplamMaliyet),
        kar: Number(kayit.kar),
        karOrani: Number(kayit.karOrani),
      })),
    };
  }

  /**
   * Ürün bazlı kar bilgisi
   */
  async getProfitByProduct(filters?: {
    stokId?: string;
    startDate?: Date;
    endDate?: Date;
    tenantId?: string;
  }) {
    const tenantId = filters?.tenantId ?? (await this.tenantResolver.resolveForQuery());

    const where: Prisma.InvoiceProfitWhereInput = {
      faturaKalemiId: { not: null }, // Sadece kalem bazlı kayıtlar
      ...(filters?.stokId && { stokId: filters.stokId }),
      ...(filters?.startDate || filters?.endDate
        ? {
            fatura: {
              tarih: {
                ...(filters?.startDate && { gte: filters.startDate }),
                ...(filters?.endDate && { lte: filters.endDate }),
              },
            },
          }
        : {}),
    };
    
    // TenantId varsa filtre ekle, yoksa ekleme (null tenantId'li kayıtlar da dahil)
    if (tenantId) {
      where.tenantId = tenantId;
    }

    let profitRecords = await this.prisma.invoiceProfit.findMany({
      where,
      include: {
        stok: {
          select: {
            id: true,
            stokKodu: true,
            stokAdi: true,
          },
        },
        fatura: {
          select: {
            id: true,
            faturaNo: true,
            tarih: true,
            cari: {
              select: {
                id: true,
                unvan: true,
              },
            },
          },
        },
      },
      orderBy: {
        fatura: {
          tarih: 'desc',
        },
      },
    });

    // Eğer profit kaydı yoksa, SATIS faturaları için otomatik hesaplama yap
    if (profitRecords.length === 0) {
      console.log('[getProfitByProduct] Profit kaydı bulunamadı, SATIS faturaları için otomatik hesaplama başlatılıyor...');
      
      // SATIS faturalarını bul
      const faturaWhere: Prisma.FaturaWhereInput = {
        faturaTipi: 'SATIS',
        ...(filters?.startDate || filters?.endDate
          ? {
              tarih: {
                ...(filters?.startDate && { gte: filters.startDate }),
                ...(filters?.endDate && { lte: filters.endDate }),
              },
            }
          : {}),
      };
      
      // TenantId varsa filtre ekle
      if (tenantId) {
        faturaWhere.tenantId = tenantId;
      }

      const faturalar = await this.prisma.fatura.findMany({
        where: faturaWhere,
        select: {
          id: true,
        },
        take: 100, // İlk 100 fatura için hesaplama yap (performans için)
      });

      console.log(`[getProfitByProduct] ${faturalar.length} fatura için profit hesaplaması yapılıyor...`);

      // Toplu olarak profit hesapla
      await Promise.allSettled(
        faturalar.map((fatura) =>
          this.calculateAndSaveProfit(fatura.id).catch((err) => {
            console.error(`[getProfitByProduct] Profit hesaplama hatası (fatura ${fatura.id}):`, err);
          })
        )
      );

      // Yeniden sorgula
      profitRecords = await this.prisma.invoiceProfit.findMany({
        where,
        include: {
          stok: {
            select: {
              id: true,
              stokKodu: true,
              stokAdi: true,
            },
          },
          fatura: {
            select: {
              id: true,
              faturaNo: true,
              tarih: true,
              cari: {
                select: {
                  id: true,
                  unvan: true,
                },
              },
            },
          },
        },
        orderBy: {
          fatura: {
            tarih: 'desc',
          },
        },
      });

      console.log(`[getProfitByProduct] ${profitRecords.length} profit kaydı bulundu`);
    }

    // Ürün bazlı toplamlar
    const productMap = new Map<
      string,
      {
        stok: { id: string; stokKodu: string; stokAdi: string };
        toplamMiktar: number;
        toplamSatisTutari: number;
        toplamMaliyet: number;
        toplamKar: number;
        faturalar: Array<{
          faturaId: string;
          faturaNo: string;
          tarih: Date;
          cari: { id: string; unvan: string };
          miktar: number;
          satisTutari: number;
          maliyet: number;
          kar: number;
        }>;
      }
    >();

    for (const record of profitRecords) {
      // Stok null ise bu kaydı atla
      if (!record.stok) {
        continue;
      }

      const stokId = record.stokId;
      if (!productMap.has(stokId)) {
        productMap.set(stokId, {
          stok: record.stok,
          toplamMiktar: 0,
          toplamSatisTutari: 0,
          toplamMaliyet: 0,
          toplamKar: 0,
          faturalar: [],
        });
      }

      const product = productMap.get(stokId)!;
      product.toplamMiktar += record.miktar;
      product.toplamSatisTutari += Number(record.toplamSatisTutari);
      product.toplamMaliyet += Number(record.toplamMaliyet);
      product.toplamKar += Number(record.kar);

      product.faturalar.push({
        faturaId: record.faturaId,
        faturaNo: record.fatura.faturaNo,
        tarih: record.fatura.tarih,
        cari: record.fatura.cari,
        miktar: record.miktar,
        satisTutari: Number(record.toplamSatisTutari),
        maliyet: Number(record.toplamMaliyet),
        kar: Number(record.kar),
      });
    }

    // Map'i array'e çevir ve kar oranını hesapla
    const result = Array.from(productMap.values()).map((product) => ({
      ...product,
      karOrani:
        product.toplamMaliyet > 0
          ? (product.toplamKar / product.toplamMaliyet) * 100
          : 0,
    }));

    return result;
  }

  /**
   * Fatura bazlı karlılık listesi (master-detail için)
   */
  async getProfitList(filters?: {
    startDate?: Date;
    endDate?: Date;
    cariId?: string;
    durum?: string;
    tenantId?: string;
  }) {
    const tenantId = filters?.tenantId ?? (await this.tenantResolver.resolveForQuery());

    const where: Prisma.FaturaWhereInput = {
      faturaTipi: 'SATIS',
      ...(filters?.cariId && { cariId: filters.cariId }),
      ...(filters?.durum && { durum: filters.durum as any }),
      ...(filters?.startDate || filters?.endDate
        ? {
            tarih: {
              ...(filters?.startDate && { gte: filters.startDate }),
              ...(filters?.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
    };
    
    // TenantId varsa filtre ekle, yoksa ekleme (null tenantId'li faturalar da dahil)
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const faturalar = await this.prisma.fatura.findMany({
      where,
      include: {
        cari: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
          },
        },
      },
      orderBy: [
        { tarih: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Her fatura için toplam kar kaydını ayrı sorgu ile al
    const faturaIds = faturalar.map((f) => f.id);
    
    // TenantId null ise filtre eklemeyelim, varsa filtreleyelim
    const profitWhere: Prisma.InvoiceProfitWhereInput = {
      faturaId: { in: faturaIds },
      faturaKalemiId: null, // Sadece toplam kayıtları
    };
    
    // TenantId varsa filtre ekle, yoksa ekleme (null tenantId'li kayıtlar da dahil)
    if (tenantId) {
      profitWhere.tenantId = tenantId;
    }
    
    const toplamKarKayitlari = await this.prisma.invoiceProfit.findMany({
      where: profitWhere,
    });

    const karMap = new Map(
      toplamKarKayitlari.map((k) => [k.faturaId, k]),
    );

    // Profit kaydı olmayan faturalar için otomatik hesaplama yap
    const faturalarWithoutProfit = faturalar.filter((f) => !karMap.has(f.id));
    
    // Toplu olarak profit hesapla (async olarak, hata durumunda sessizce devam et)
    if (faturalarWithoutProfit.length > 0) {
      console.log(`[getProfitList] ${faturalarWithoutProfit.length} fatura için profit hesaplaması yapılıyor...`);
      
      await Promise.allSettled(
        faturalarWithoutProfit.map((fatura) =>
          this.calculateAndSaveProfit(fatura.id).catch((err) => {
            console.error(`[getProfitList] Profit hesaplama hatası (fatura ${fatura.id}):`, err);
          })
        )
      );

      // Yeniden sorgula (tenantId kontrolü ile)
      const yeniProfitWhere: Prisma.InvoiceProfitWhereInput = {
        faturaId: { in: faturaIds },
        faturaKalemiId: null,
      };
      
      if (tenantId) {
        yeniProfitWhere.tenantId = tenantId;
      }
      
      const yeniToplamKarKayitlari = await this.prisma.invoiceProfit.findMany({
        where: yeniProfitWhere,
      });

      yeniToplamKarKayitlari.forEach((k) => {
        karMap.set(k.faturaId, k);
      });
      
      console.log(`[getProfitList] ${yeniToplamKarKayitlari.length} profit kaydı bulundu`);
    }

    return faturalar.map((fatura) => {
      const toplamKar = karMap.get(fatura.id);
      
      return {
        fatura: {
          id: fatura.id,
          faturaNo: fatura.faturaNo,
          tarih: fatura.tarih,
          cari: fatura.cari,
          durum: fatura.durum,
        },
        toplamSatisTutari: toplamKar
          ? Number(toplamKar.toplamSatisTutari)
          : Number(fatura.genelToplam || 0), // KDV dahil (fallback)
        toplamMaliyet: toplamKar ? Number(toplamKar.toplamMaliyet) : 0,
        toplamKar: toplamKar ? Number(toplamKar.kar) : 0,
        karOrani: toplamKar ? Number(toplamKar.karOrani) : 0,
      };
    });
  }

  /**
   * Fatura detay kar bilgileri (master-detail için detay)
   */
  async getProfitDetailByInvoice(faturaId: string) {
    // Önce profit kayıtlarını kontrol et
    let kalemKarKayitlari = await this.prisma.invoiceProfit.findMany({
      where: {
        faturaId,
        faturaKalemiId: { not: null },
      },
      include: {
        faturaKalemi: {
          include: {
            stok: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
              },
            },
          },
        },
      },
      orderBy: {
        hesaplamaTarihi: 'desc', // En yeni kayıtlar önce
      },
    });

    // Eğer profit kaydı yoksa, otomatik olarak hesapla
    // Ancak önce geçerli kayıtları kontrol et
    const hasValidRecords = kalemKarKayitlari.some(
      (k) => k.faturaKalemiId !== null && k.faturaKalemi !== null,
    );

    if (!hasValidRecords) {
      try {
        console.log(`[getProfitDetailByInvoice] Fatura ${faturaId} için geçerli profit kaydı yok, otomatik hesaplama başlatılıyor...`);
        await this.calculateAndSaveProfit(faturaId);
        // Yeniden sorgula
        kalemKarKayitlari = await this.prisma.invoiceProfit.findMany({
          where: {
            faturaId,
            faturaKalemiId: { not: null },
          },
          include: {
            faturaKalemi: {
              include: {
                stok: {
                  select: {
                    id: true,
                    stokKodu: true,
                    stokAdi: true,
                  },
                },
              },
            },
          },
          orderBy: {
            hesaplamaTarihi: 'desc',
          },
        });
        console.log(`[getProfitDetailByInvoice] Fatura ${faturaId} için ${kalemKarKayitlari.length} profit kaydı bulundu`);
      } catch (error) {
        console.error(`Profit hesaplama hatası (fatura ${faturaId}):`, error);
        // Hata durumunda boş array döndür
        return [];
      }
    }

    // Duplicate kayıtları filtrele - her faturaKalemiId için sadece bir kayıt olmalı
    // Eğer duplicate varsa, en yeni kaydı al (güvenlik için)
    const uniqueKalemMap = new Map<string, typeof kalemKarKayitlari[0]>();
    
    for (const kayit of kalemKarKayitlari) {
      // faturaKalemiId null olan kayıtları atla (bunlar toplam kayıtları)
      if (!kayit.faturaKalemiId) {
        continue;
      }
      
      // Eğer bu faturaKalemiId için kayıt yoksa veya mevcut kayıt daha eskiyse, güncelle
      const existing = uniqueKalemMap.get(kayit.faturaKalemiId);
      if (!existing || kayit.hesaplamaTarihi > existing.hesaplamaTarihi) {
        uniqueKalemMap.set(kayit.faturaKalemiId, kayit);
      } else if (existing && kayit.hesaplamaTarihi <= existing.hesaplamaTarihi) {
        // Duplicate kayıt bulundu - bu olmamalı, logla
        console.warn(`[getProfitDetailByInvoice] Duplicate kayıt bulundu (faturaKalemiId: ${kayit.faturaKalemiId}, id: ${kayit.id}), atlanıyor`);
      }
    }

    // Map'ten array'e çevir ve faturaKalemi null olan kayıtları filtrele
    return Array.from(uniqueKalemMap.values())
      .filter((kayit) => kayit.faturaKalemi !== null)
      .sort((a, b) => {
        // Hesaplama tarihine göre sırala (eski kayıtlar önce)
        return a.hesaplamaTarihi.getTime() - b.hesaplamaTarihi.getTime();
      })
      .map((kayit) => ({
        id: kayit.id,
        stok: kayit.faturaKalemi?.stok || null,
        miktar: kayit.miktar,
        birimFiyat: Number(kayit.birimFiyat),
        birimMaliyet: Number(kayit.birimMaliyet),
        toplamSatisTutari: Number(kayit.toplamSatisTutari),
        toplamMaliyet: Number(kayit.toplamMaliyet),
        kar: Number(kayit.kar),
        karOrani: Number(kayit.karOrani),
      }));
  }
}
