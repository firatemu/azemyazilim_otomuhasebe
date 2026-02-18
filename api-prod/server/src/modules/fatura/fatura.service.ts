import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { FaturaDurum, FaturaTipi, Prisma, IrsaliyeKaynakTip, IrsaliyeDurum } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CodeTemplateService } from '../code-template/code-template.service';
import { SatisIrsaliyesiService } from '../satis-irsaliyesi/satis-irsaliyesi.service';
import { InvoiceProfitService } from '../invoice-profit/invoice-profit.service';
import { CostingService } from '../costing/costing.service';
import { SystemParameterService } from '../system-parameter/system-parameter.service';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { UpdateFaturaDto } from './dto/update-fatura.dto';

@Injectable()
export class FaturaService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    private codeTemplateService: CodeTemplateService,
    @Inject(forwardRef(() => SatisIrsaliyesiService))
    private satisIrsaliyesiService: SatisIrsaliyesiService,
    private invoiceProfitService: InvoiceProfitService,
    private costingService: CostingService,
    private systemParameterService: SystemParameterService,
  ) { }

  private async createLog(
    faturaId: string,
    actionType: string,
    userId?: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    await prisma.faturaLog.create({
      data: {
        faturaId,
        userId,
        actionType: actionType as any,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * ALIS faturası için maliyetlendirme servisini çalıştır
   * Fatura içindeki kalemlerin stokId'leri için maliyet hesaplar
   * Parametre kontrolü yapılır - eğer otomatik maliyetlendirme kapalıysa çalışmaz
   */
  private async calculateCostsForInvoiceItems(
    kalemler: Array<{ stokId: string | null }>,
    faturaId: string,
    faturaNo: string,
  ): Promise<void> {
    // Parametre kontrolü - otomatik maliyetlendirme açık mı?
    const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
      'AUTO_COSTING_ON_PURCHASE_INVOICE',
      true, // Varsayılan: true (mevcut davranış)
    );

    if (!autoCostingEnabled) {
      console.log(
        `[FaturaService] Fatura ${faturaNo} (${faturaId}) için otomatik maliyetlendirme kapalı, atlandı`,
      );
      return;
    }

    // Sadece stokId'si olan kalemler için maliyet hesapla
    const stokIds = kalemler
      .map((k) => k.stokId)
      .filter((id): id is string => id !== null && id !== undefined);

    if (stokIds.length === 0) {
      console.log(
        `[FaturaService] Fatura ${faturaNo} (${faturaId}) için maliyetlendirme atlandı - stokId bulunamadı`,
      );
      return;
    }

    // Unique stokId'leri al
    const uniqueStokIds = [...new Set(stokIds)];

    console.log(
      `[FaturaService] Fatura ${faturaNo} (${faturaId}) için ${uniqueStokIds.length} stok için maliyetlendirme başlatılıyor...`,
    );

    // Her stok için maliyet hesapla (async olarak paralel çalıştır)
    const costingPromises = uniqueStokIds.map(async (stokId) => {
      try {
        await this.costingService.calculateWeightedAverageCost(stokId);
        console.log(
          `[FaturaService] Stok ${stokId} için maliyetlendirme tamamlandı`,
        );
      } catch (error: any) {
        // Maliyetlendirme hatası fatura işlemini engellemez, sadece log'lanır
        console.error(
          `[FaturaService] Stok ${stokId} için maliyetlendirme hatası:`,
          {
            stokId,
            faturaId,
            faturaNo,
            error: error?.message || error,
            stack: error?.stack,
          },
        );
      }
    });

    // Tüm maliyetlendirme işlemlerini bekle
    await Promise.allSettled(costingPromises);

    console.log(
      `[FaturaService] Fatura ${faturaNo} (${faturaId}) için maliyetlendirme tamamlandı`,
    );
  }

  async findAll(
    page = 1,
    limit = 50,
    faturaTipi?: FaturaTipi,
    search?: string,
    cariId?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ) {
    try {
      const skip = (page - 1) * limit;
      const tenantId = await this.tenantResolver.resolveForQuery();

      const where: Prisma.FaturaWhereInput = {
        deletedAt: null,
        ...buildTenantWhereClause(tenantId ?? undefined),
      };

      if (faturaTipi) {
        where.faturaTipi = faturaTipi;
      }

      if (cariId) {
        where.cariId = cariId;
      }

      if (search) {
        where.OR = [
          { faturaNo: { contains: search, mode: 'insensitive' } },
          { cari: { unvan: { contains: search, mode: 'insensitive' } } },
          { cari: { cariKodu: { contains: search, mode: 'insensitive' } } },
        ];
      }


      // ✅ Performance optimized query - Using select instead of include
      const [data, total] = await Promise.all([
        this.prisma.fatura.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            faturaNo: true,
            faturaTipi: true,
            tarih: true,
            vade: true,
            toplamTutar: true,
            kdvTutar: true,
            genelToplam: true,
            durum: true,
            odenecekTutar: true,
            odenenTutar: true,
            aciklama: true,
            siparisNo: true,
            efaturaStatus: true,
            createdAt: true,
            updatedAt: true,
            // Relations - optimized selection
            cari: {
              select: {
                id: true,
                cariKodu: true,
                unvan: true,
                tip: true,
              },
            },
            // Only include basic irsaliye info if needed (nested relation removed)
            ...(deliveryNoteId ? {
              irsaliye: {
                select: {
                  id: true,
                  irsaliyeNo: true,
                },
              },
            } : {}),
            createdByUser: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
            // Count instead of full relations - solves N+1 problem
            _count: {
              select: {
                kalemler: true,
                faturaTahsilatlar: true,
                logs: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.fatura.count({ where }),
      ]);


      return {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      console.error('Fatura findAll error:', error);
      throw new BadRequestException(
        `Faturalar yüklenirken hata oluştu: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    const fatura = await this.prisma.fatura.findUnique({
      where: { id },
      include: {
        cari: true,
        irsaliye: {
          select: {
            id: true,
            irsaliyeNo: true,
            kaynakSiparis: {
              select: {
                id: true,
                siparisNo: true,
              },
            },
          },
        },
        kalemler: {
          include: { stok: true },
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        updatedByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        deletedByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        logs: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!fatura) {
      throw new NotFoundException(`Fatura bulunamadı: ${id}`);
    }

    return fatura;
  }

  async create(
    createFaturaDto: CreateFaturaDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { kalemler, siparisId, irsaliyeId, ...faturaData } = createFaturaDto;

    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    // Eğer fatura numarası boşsa veya belirtilmemişse, şablondan otomatik oluştur
    if (!faturaData.faturaNo || faturaData.faturaNo.trim() === '') {
      try {
        if (faturaData.faturaTipi === 'SATIS') {
          faturaData.faturaNo = await this.codeTemplateService.getNextCode('INVOICE_SALES');
        } else if (faturaData.faturaTipi === 'ALIS') {
          faturaData.faturaNo = await this.codeTemplateService.getNextCode('INVOICE_PURCHASE');
        } else {
          // Fallback: Manuel numara oluştur
          const year = new Date().getFullYear();
          const lastFatura = await this.prisma.fatura.findFirst({
            where: {
              faturaTipi: faturaData.faturaTipi,
              ...(tenantId && { tenantId }),
            },
            orderBy: { createdAt: 'desc' },
          });
          const lastNo = lastFatura ? parseInt(lastFatura.faturaNo.split('-')[2] || '0') : 0;
          const newNo = (lastNo + 1).toString().padStart(3, '0');
          faturaData.faturaNo = `SF-${year}-${newNo}`;
        }
      } catch (error: any) {
        // Şablon yoksa veya hata varsa, manuel oluştur
        const year = new Date().getFullYear();
        const lastFatura = await this.prisma.fatura.findFirst({
          where: {
            faturaTipi: faturaData.faturaTipi,
            ...(tenantId && { tenantId }),
          },
          orderBy: { createdAt: 'desc' },
        });
        const lastNo = lastFatura ? parseInt(lastFatura.faturaNo.split('-')[2] || '0') : 0;
        const newNo = (lastNo + 1).toString().padStart(3, '0');
        faturaData.faturaNo = `SF-${year}-${newNo}`;
      }
    }

    // Fatura numarası kontrolü (tenantId ile birlikte unique)
    const existingFatura = await this.prisma.fatura.findFirst({
      where: {
        faturaNo: faturaData.faturaNo,
        ...(tenantId && { tenantId }),
      },
    });

    if (existingFatura) {
      throw new BadRequestException(
        `Bu fatura numarası zaten mevcut: ${faturaData.faturaNo}`,
      );
    }

    // Cari kontrolü
    const cari = await this.prisma.cari.findUnique({
      where: { id: faturaData.cariId },
    });

    if (!cari) {
      throw new NotFoundException(`Cari bulunamadı: ${faturaData.cariId}`);
    }

    // Kalem tutarlarını hesapla
    let toplamTutar = 0;
    let kdvTutar = 0;

    const kalemlerWithCalculations = kalemler.map((kalem) => {
      const birimFiyat = kalem.birimFiyat;
      const tutar = kalem.miktar * birimFiyat;
      const kalemKdv = (tutar * kalem.kdvOrani) / 100;

      toplamTutar += tutar;
      kdvTutar += kalemKdv;

      return {
        ...kalem,
        birimFiyat,
        tutar,
        kdvTutar: kalemKdv,
      };
    });

    const iskonto = faturaData.iskonto || 0;
    toplamTutar -= iskonto;
    const genelToplam = toplamTutar + kdvTutar;

    // Sipariş kontrolü
    let siparis: any = null;
    let siparisHazirliklar: any[] = [];
    if (siparisId) {
      siparis = await this.prisma.siparis.findUnique({
        where: { id: siparisId },
        include: {
          hazirlananlar: {
            include: {
              siparisKalemi: true,
              location: true,
            },
          },
        },
      });

      if (!siparis) {
        throw new NotFoundException(
          `Sipariş bulunamadı: ${siparisId}`,
        );
      }

      if (siparis.durum === 'FATURALANDI') {
        throw new BadRequestException('Sipariş zaten faturalandırılmış');
      }

      siparisHazirliklar = siparis.hazirlananlar;
    }

    // Transaction ile fatura ve kalemleri oluştur
    return this.prisma.$transaction(async (prisma) => {
      // İRSALİYE İŞLEMLERİ
      let deliveryNoteId: string | undefined = undefined;

      // Eğer irsaliyeId varsa, mevcut irsaliye'yi kullan
      if (irsaliyeId) {
        const irsaliye = await prisma.satisIrsaliyesi.findUnique({
          where: { id: irsaliyeId },
          include: {
            kaynakSiparis: {
              select: {
                id: true,
                siparisNo: true,
              },
            },
          },
        });

        if (!irsaliye) {
          throw new NotFoundException(`İrsaliye bulunamadı: ${irsaliyeId}`);
        }

        if (irsaliye.durum === 'FATURALANDI') {
          throw new BadRequestException('Bu irsaliye zaten faturalandırılmış');
        }

        // İrsaliye durumunu FATURALANDI yap
        await prisma.satisIrsaliyesi.update({
          where: { id: irsaliyeId },
          data: { durum: IrsaliyeDurum.FATURALANDI },
        });

        deliveryNoteId = irsaliyeId;

        // Eğer irsaliye bir siparişten oluşturulduysa, sipariş numarasını fatura'ya aktar
        if (irsaliye.kaynakSiparis?.siparisNo && !siparis?.siparisNo) {
          siparis = { ...siparis, siparisNo: irsaliye.kaynakSiparis.siparisNo };
        }
      } else if (faturaData.faturaTipi === 'SATIS') {
        // Eğer SATIS tipindeyse ve irsaliyeId yoksa, otomatik irsaliye oluştur
        // İrsaliye numarası oluştur
        let irsaliyeNo: string;
        try {
          irsaliyeNo = await this.codeTemplateService.getNextCode('DELIVERY_NOTE_SALES');
        } catch (error: any) {
          // Şablon yoksa fallback
          const year = new Date().getFullYear();
          const lastIrsaliye = await prisma.satisIrsaliyesi.findFirst({
            where: { ...(tenantId && { tenantId }) },
            orderBy: { createdAt: 'desc' },
          });
          const lastNoStr = lastIrsaliye?.irsaliyeNo || '';
          const lastNo = lastNoStr ? parseInt(lastNoStr.split('-').pop() || '0') : 0;
          irsaliyeNo = `IRS-${year}-${(lastNo + 1).toString().padStart(6, '0')}`;
        }

        // İrsaliye kalemlerini hazırla (iskonto öncesi toplam tutar için hesaplama)
        const irsaliyeToplamTutar = toplamTutar + (faturaData.iskonto || 0); // İskonto öncesi toplam
        const irsaliyeKalemler = kalemlerWithCalculations.map(k => ({
          stokId: k.stokId,
          miktar: k.miktar,
          birimFiyat: new Decimal(k.birimFiyat),
          kdvOrani: k.kdvOrani,
          tutar: new Decimal(k.tutar),
          kdvTutar: new Decimal(k.kdvTutar),
        }));

        // İrsaliye oluştur
        const irsaliye = await prisma.satisIrsaliyesi.create({
          data: {
            irsaliyeNo,
            irsaliyeTarihi: new Date(faturaData.tarih),
            tenantId,
            cariId: faturaData.cariId,
            depoId: null, // Plan'a göre opsiyonel
            kaynakTip: IrsaliyeKaynakTip.FATURA_OTOMATIK,
            kaynakId: null, // Sipariş yoksa null
            durum: IrsaliyeDurum.FATURALANDI, // Fatura oluşturulduğu için direkt FATURALANDI
            toplamTutar: new Decimal(irsaliyeToplamTutar),
            kdvTutar: new Decimal(kdvTutar),
            genelToplam: new Decimal(genelToplam),
            iskonto: new Decimal(faturaData.iskonto || 0),
            aciklama: faturaData.aciklama || null,
            createdBy: userId,
            kalemler: {
              create: irsaliyeKalemler,
            },
          },
        });

        deliveryNoteId = irsaliye.id;
      }

      const fatura = await prisma.fatura.create({
        data: {
          ...faturaData,
          ...(tenantId && { tenantId }),
          siparisNo: siparis?.siparisNo || null,
          deliveryNoteId: deliveryNoteId || null, // İrsaliye ID'sini bağla
          toplamTutar,
          kdvTutar,
          genelToplam,
          odenenTutar: 0, // FIFO: Başlangıçta ödenmemiş
          odenecekTutar: genelToplam, // FIFO: Tüm tutar ödenmeli
          createdBy: userId,
          kalemler: {
            create: kalemlerWithCalculations,
          },
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Eğer sipariş varsa ve geçerli bir ID'si varsa, siparişi faturalandı olarak işaretle
      if (siparis && siparis.id) {
        await prisma.siparis.update({
          where: { id: siparis.id },
          data: {
            durum: 'FATURALANDI',
            faturaNo: faturaData.faturaNo,
          },
        });
      }

      // Sadece ONAYLANDI durumunda cari ve stok güncellemesi yap
      if (faturaData.durum === 'ONAYLANDI') {
        // Cari hareket kaydı oluştur
        await prisma.cariHareket.create({
          data: {
            cariId: faturaData.cariId,
            tip: faturaData.faturaTipi === 'SATIS' ? 'BORC' : 'ALACAK',
            tutar: genelToplam,
            bakiye:
              faturaData.faturaTipi === 'SATIS'
                ? cari.bakiye.toNumber() + genelToplam
                : cari.bakiye.toNumber() - genelToplam,
            belgeTipi: 'FATURA',
            belgeNo: faturaData.faturaNo,
            tarih: new Date(faturaData.tarih),
            aciklama: `${faturaData.faturaTipi === 'SATIS' ? 'Satış' : 'Alış'} Faturası: ${faturaData.faturaNo}`,
          },
        });

        // Cari bakiyeyi güncelle
        await prisma.cari.update({
          where: { id: faturaData.cariId },
          data: {
            bakiye:
              faturaData.faturaTipi === 'SATIS'
                ? { increment: genelToplam }
                : { decrement: genelToplam },
          },
        });

        // Stok hareketi oluştur
        if (faturaData.faturaTipi === 'SATIS') {
          // Satış faturası: Stoktan düş

          // Eğer sipariş hazırlık kayıtları varsa, raf bazlı stok düş
          if (siparisHazirliklar.length > 0) {
            for (const hazirlik of siparisHazirliklar) {
              // ProductLocationStock'tan stok düş
              const locationStock = await prisma.productLocationStock.findFirst(
                {
                  where: {
                    productId: hazirlik.siparisKalemi.stokId,
                    locationId: hazirlik.locationId,
                  },
                },
              );

              if (locationStock) {
                await prisma.productLocationStock.update({
                  where: { id: locationStock.id },
                  data: {
                    qtyOnHand: { decrement: hazirlik.miktar },
                  },
                });
              }

              // StockMove kaydı oluştur
              await prisma.stockMove.create({
                data: {
                  productId: hazirlik.siparisKalemi.stokId,
                  fromWarehouseId: locationStock?.warehouseId,
                  fromLocationId: hazirlik.locationId,
                  toWarehouseId: locationStock!.warehouseId,
                  toLocationId: hazirlik.locationId,
                  qty: hazirlik.miktar,
                  moveType: 'SALE',
                  refType: 'Fatura',
                  refId: fatura.id,
                  note: `Satış Faturası: ${faturaData.faturaNo}`,
                  createdBy: userId,
                },
              });
            }
          }

          // Stok hareket kaydı (genel)
          for (const kalem of kalemlerWithCalculations) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'SATIS',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Satış Faturası: ${faturaData.faturaNo}`,
              },
            });
          }
        } else if (faturaData.faturaTipi === 'ALIS') {
          // Alış faturası: Stoğa ekle
          for (const kalem of kalemlerWithCalculations) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'GIRIS',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Alış Faturası: ${faturaData.faturaNo}`,
              },
            });
          }
        }
      }

      // Audit log oluştur (transaction içinde)
      await this.createLog(
        fatura.id,
        'CREATE',
        userId,
        { fatura: faturaData, kalemler: kalemlerWithCalculations },
        ipAddress,
        userAgent,
        prisma,
      );

      // Kar hesaplama (sadece SATIS faturaları için)
      if (faturaData.faturaTipi === 'SATIS') {
        try {
          await this.invoiceProfitService.calculateAndSaveProfit(
            fatura.id,
            userId,
            prisma, // Transaction içindeki prisma instance'ını geçir
          );
        } catch (error: any) {
          // Kar hesaplama hatası fatura oluşturmayı engellemez, sadece log'lanır
          console.error(
            `[FaturaService] Fatura ${fatura.id} (${fatura.faturaNo}) için kar hesaplama hatası:`,
            {
              faturaId: fatura.id,
              faturaNo: fatura.faturaNo,
              error: error?.message || error,
              stack: error?.stack,
              userId,
            },
          );
          // Hata durumunda fatura oluşturma devam eder, ancak profit kaydı oluşmaz
          // Kullanıcı daha sonra manuel olarak yeniden hesaplayabilir
        }
      }

      // Maliyetlendirme (sadece ALIS faturaları için ve parametre açıksa)
      // Durum ne olursa olsun, parametre açıksa maliyetlendirme yapılır
      // Maliyetlendirme servisi sadece ONAYLANDI durumundaki geçmiş faturaları dahil eder
      if (faturaData.faturaTipi === 'ALIS') {
        try {
          const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
            'AUTO_COSTING_ON_PURCHASE_INVOICE',
            true, // Varsayılan: true
          );

          if (autoCostingEnabled) {
            // Transaction dışında çalıştır (transaction commit edildikten sonra)
            // Çünkü maliyetlendirme servisi fatura kayıtlarını okumak için transaction'ın commit edilmesini bekler
            await this.calculateCostsForInvoiceItems(
              fatura.kalemler,
              fatura.id,
              fatura.faturaNo,
            );
          }
        } catch (error: any) {
          // Maliyetlendirme hatası fatura oluşturmayı engellemez, sadece log'lanır
          console.error(
            `[FaturaService] Fatura ${fatura.id} (${fatura.faturaNo}) için maliyetlendirme hatası:`,
            {
              faturaId: fatura.id,
              faturaNo: fatura.faturaNo,
              error: error?.message || error,
              stack: error?.stack,
              userId,
            },
          );
        }
      }

      return fatura;
    });
  }

  async update(
    id: string,
    updateFaturaDto: UpdateFaturaDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const fatura = await this.findOne(id);

    // Eğer kalemler güncellenmiyorsa sadece fatura bilgilerini güncelle
    if (!updateFaturaDto.kalemler) {
      const { cariId, faturaNo, faturaTipi, kalemler, ...updateData } =
        updateFaturaDto;

      const updated = await this.prisma.fatura.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: userId,
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Audit log
      await this.createLog(
        id,
        'UPDATE',
        userId,
        updateData,
        ipAddress,
        userAgent,
      );

      // Durum değişikliği kontrolü (maliyetlendirme için)
      if (
        fatura.faturaTipi === 'ALIS' &&
        updateData.durum &&
        updateData.durum !== fatura.durum
      ) {
        // Eğer durum ONAYLANDI'ya geçiyorsa
        if (updateData.durum === 'ONAYLANDI') {
          // Transaction içinde işlemleri yap
          await this.prisma.$transaction(async (prisma) => {
            // 1. Cari Hareket Oluştur
            await prisma.cariHareket.create({
              data: {
                cariId: updated.cariId,
                tip: 'ALACAK',
                tutar: updated.genelToplam,
                bakiye: updated.cari.bakiye.toNumber() - updated.genelToplam.toNumber(),
                belgeTipi: 'FATURA',
                belgeNo: updated.faturaNo,
                tarih: new Date(updated.tarih),
                aciklama: `Alış Faturası: ${updated.faturaNo}`,
              },
            });

            // 2. Cari Bakiyeyi Güncelle
            await prisma.cari.update({
              where: { id: updated.cariId },
              data: {
                bakiye: { decrement: updated.genelToplam },
              },
            });

            // 3. Stok Hareketlerini Oluştur
            for (const kalem of updated.kalemler) {
              await prisma.stokHareket.create({
                data: {
                  stokId: kalem.stokId,
                  hareketTipi: 'GIRIS',
                  miktar: kalem.miktar,
                  birimFiyat: kalem.birimFiyat,
                  aciklama: `Alış Faturası: ${updated.faturaNo}`,
                },
              });
            }
          });
        }

        // Durum değiştiğinde parametre açıksa maliyetlendirme yap
        try {
          const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
            'AUTO_COSTING_ON_PURCHASE_INVOICE',
            true, // Varsayılan: true
          );

          if (autoCostingEnabled) {
            await this.calculateCostsForInvoiceItems(
              updated.kalemler,
              updated.id,
              updated.faturaNo,
            );
          }
        } catch (error: any) {
          console.error(
            `[FaturaService] Fatura ${updated.id} (${updated.faturaNo}) için durum değişikliği maliyetlendirme hatası:`,
            {
              faturaId: updated.id,
              faturaNo: updated.faturaNo,
              eskiDurum: fatura.durum,
              yeniDurum: updateData.durum,
              error: error?.message || error,
              stack: error?.stack,
              userId,
            },
          );
        }
      }

      return updated;
    }

    // Kalemler güncelleniyorsa yeniden hesaplama yap
    const { kalemler, ...faturaData } = updateFaturaDto;

    let toplamTutar = 0;
    let kdvTutar = 0;

    const kalemlerWithCalculations = kalemler.map((kalem) => {
      const birimFiyat = kalem.birimFiyat;
      const tutar = kalem.miktar * birimFiyat;
      const kalemKdv = (tutar * kalem.kdvOrani) / 100;

      toplamTutar += tutar;
      kdvTutar += kalemKdv;

      return {
        ...kalem,
        birimFiyat,
        tutar,
        kdvTutar: kalemKdv,
      };
    });

    const iskonto = faturaData.iskonto || fatura.iskonto.toNumber();
    toplamTutar -= iskonto;
    const genelToplam = toplamTutar + kdvTutar;

    return this.prisma.$transaction(async (prisma) => {
      // Eski kalemleri sil
      await prisma.faturaKalemi.deleteMany({
        where: { faturaId: id },
      });

      // Faturayı güncelle ve yeni kalemleri ekle
      const updated = await prisma.fatura.update({
        where: { id },
        data: {
          ...faturaData,
          toplamTutar,
          kdvTutar,
          genelToplam,
          updatedBy: userId,
          kalemler: {
            create: kalemlerWithCalculations,
          },
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Audit log (transaction içinde)
      await this.createLog(
        id,
        'UPDATE',
        userId,
        { ...faturaData, kalemler: kalemlerWithCalculations },
        ipAddress,
        userAgent,
        prisma,
      );

      // Kar hesaplama güncelleme (sadece SATIS faturaları için)
      if (fatura.faturaTipi === 'SATIS') {
        try {
          await this.invoiceProfitService.calculateAndSaveProfit(
            updated.id,
            userId,
            prisma,
          );
        } catch (error: any) {
          console.error(
            `[FaturaService] Fatura ${updated.id} (${updated.faturaNo}) için kar hesaplama güncelleme hatası:`,
            {
              faturaId: updated.id,
              faturaNo: updated.faturaNo,
              error: error?.message || error,
              stack: error?.stack,
              userId,
            },
          );
        }
      }

      // Maliyetlendirme (sadece ALIS faturaları için ve parametre açıksa)
      // Kalemler güncellendiğinde veya durum değiştiğinde maliyetlendirme yap
      if (fatura.faturaTipi === 'ALIS') {
        // Eğer durum ONAYLANDI'ya geçiyorsa ve eski durum ONAYLANDI değilse
        if (updateFaturaDto.durum === 'ONAYLANDI' && fatura.durum !== 'ONAYLANDI') {
          // 1. Cari Hareket Oluştur
          await prisma.cariHareket.create({
            data: {
              cariId: updated.cariId,
              tip: 'ALACAK',
              tutar: updated.genelToplam,
              bakiye: updated.cari.bakiye.toNumber() - updated.genelToplam.toNumber(), // Alış faturası carinin alacağını (bizim borcumuzu) artırır, yani bakiyeyi azaltır (negatif bakiye borç demektir)
              belgeTipi: 'FATURA',
              belgeNo: updated.faturaNo,
              tarih: new Date(updated.tarih),
              aciklama: `Alış Faturası: ${updated.faturaNo}`,
            },
          });

          // 2. Cari Bakiyeyi Güncelle (Azalt - Borçlanıyoruz)
          await prisma.cari.update({
            where: { id: updated.cariId },
            data: {
              bakiye: { decrement: updated.genelToplam },
            },
          });

          // 3. Stok Hareketlerini Oluştur
          for (const kalem of updated.kalemler) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'GIRIS',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Alış Faturası: ${updated.faturaNo}`,
              },
            });
          }
        }

        const shouldCalculateCosts =
          fatura.durum !== 'ONAYLANDI' || updateFaturaDto.kalemler || updateFaturaDto.durum;

        if (shouldCalculateCosts) {
          try {
            const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
              'AUTO_COSTING_ON_PURCHASE_INVOICE',
              true, // Varsayılan: true
            );

            if (autoCostingEnabled) {
              // Transaction dışında çalıştır
              await this.calculateCostsForInvoiceItems(
                updated.kalemler,
                updated.id,
                updated.faturaNo,
              );
            }
          } catch (error: any) {
            console.error(
              `[FaturaService] Fatura ${updated.id} (${updated.faturaNo}) için maliyetlendirme güncelleme hatası:`,
              {
                faturaId: updated.id,
                faturaNo: updated.faturaNo,
                error: error?.message || error,
                stack: error?.stack,
                userId,
              },
            );
          }
        }
      }

      return updated;
    });
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const fatura = await this.findOne(id);

    // Tahsilatı var mı kontrol et
    const tahsilatSayisi = await this.prisma.tahsilat.count({
      where: { faturaId: id },
    });

    if (tahsilatSayisi > 0) {
      throw new BadRequestException(
        'Bu faturaya ait tahsilat kayıtları var, silinemez.',
      );
    }

    // Soft delete: Fiziksel silme yerine işaretle
    return this.prisma.$transaction(async (prisma) => {
      // Cari hareket kaydını sil (eğer onaylanmışsa)
      if (fatura.durum === 'ONAYLANDI') {
        await prisma.cariHareket.deleteMany({
          where: {
            cariId: fatura.cariId,
            belgeTipi: 'FATURA',
            belgeNo: fatura.faturaNo,
          },
        });

        // Cari bakiyeyi geri al
        await prisma.cari.update({
          where: { id: fatura.cariId },
          data: {
            bakiye:
              fatura.faturaTipi === 'SATIS'
                ? { decrement: fatura.genelToplam }
                : { increment: fatura.genelToplam },
          },
        });

        // Stok hareketlerini geri al
        if (fatura.faturaTipi === 'SATIS') {
          for (const kalem of fatura.kalemler) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'IADE',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Fatura Silme: ${fatura.faturaNo}`,
              },
            });
          }
        } else if (fatura.faturaTipi === 'ALIS') {
          for (const kalem of fatura.kalemler) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'CIKIS',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Fatura Silme: ${fatura.faturaNo}`,
              },
            });
          }
        }
      }

      // Soft delete: deletedAt ve deletedBy ayarla
      const deleted = await prisma.fatura.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      // Audit log (transaction içinde)
      await this.createLog(
        id,
        'DELETE',
        userId,
        { fatura },
        ipAddress,
        userAgent,
        prisma,
      );

      // Maliyetlendirme (sadece ALIS faturaları için ve parametre açıksa)
      // Durum ne olursa olsun, parametre açıksa maliyetlendirme yapılır
      if (fatura.faturaTipi === 'ALIS') {
        try {
          const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
            'AUTO_COSTING_ON_PURCHASE_INVOICE',
            true, // Varsayılan: true
          );

          if (autoCostingEnabled) {
            // Transaction dışında çalıştır
            await this.calculateCostsForInvoiceItems(
              fatura.kalemler,
              fatura.id,
              fatura.faturaNo,
            );
          }
        } catch (error: any) {
          console.error(
            `[FaturaService] Fatura ${fatura.id} (${fatura.faturaNo}) için silme maliyetlendirme hatası:`,
            {
              faturaId: fatura.id,
              faturaNo: fatura.faturaNo,
              error: error?.message || error,
              stack: error?.stack,
              userId,
            },
          );
        }
      }

      return deleted;
    });
  }

  async findDeleted(
    page = 1,
    limit = 50,
    faturaTipi?: FaturaTipi,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.FaturaWhereInput = {
      deletedAt: { not: null }, // Sadece silinmiş kayıtlar
    };

    if (faturaTipi) {
      where.faturaTipi = faturaTipi;
    }

    if (search) {
      where.OR = [
        { faturaNo: { contains: search, mode: 'insensitive' } },
        { cari: { unvan: { contains: search, mode: 'insensitive' } } },
        { cari: { cariKodu: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.fatura.findMany({
        where,
        skip,
        take: limit,
        include: {
          cari: true,
          deletedByUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          _count: {
            select: {
              kalemler: true,
            },
          },
        },
        orderBy: { deletedAt: 'desc' },
      }),
      this.prisma.fatura.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async restore(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const fatura = await this.prisma.fatura.findUnique({
      where: { id },
      include: {
        cari: true,
        kalemler: true,
      },
    });

    if (!fatura) {
      throw new NotFoundException(`Fatura bulunamadı: ${id}`);
    }

    if (!fatura.deletedAt) {
      throw new BadRequestException(
        'Bu fatura silinmemiş, geri yükleme yapılamaz.',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // Faturayı geri yükle
      const restored = await prisma.fatura.update({
        where: { id },
        data: {
          deletedAt: null,
          deletedBy: null,
          updatedBy: userId,
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Eğer durum ONAYLANDI ise, stok ve cari işlemlerini tekrar yap
      if (fatura.durum === 'ONAYLANDI') {
        // Cari hareket kaydı oluştur
        await prisma.cariHareket.create({
          data: {
            cariId: fatura.cariId,
            tip: fatura.faturaTipi === 'SATIS' ? 'BORC' : 'ALACAK',
            tutar: fatura.genelToplam,
            bakiye:
              fatura.faturaTipi === 'SATIS'
                ? fatura.cari.bakiye.toNumber() + fatura.genelToplam.toNumber()
                : fatura.cari.bakiye.toNumber() - fatura.genelToplam.toNumber(),
            belgeTipi: 'FATURA',
            belgeNo: fatura.faturaNo,
            tarih: fatura.tarih,
            aciklama: `${fatura.faturaTipi === 'SATIS' ? 'Satış' : 'Alış'} Faturası: ${fatura.faturaNo} (Geri Yüklendi)`,
          },
        });

        // Cari bakiyeyi güncelle
        await prisma.cari.update({
          where: { id: fatura.cariId },
          data: {
            bakiye:
              fatura.faturaTipi === 'SATIS'
                ? { increment: fatura.genelToplam }
                : { decrement: fatura.genelToplam },
          },
        });

        // Stok hareketlerini yeniden oluştur
        if (fatura.faturaTipi === 'SATIS') {
          for (const kalem of fatura.kalemler) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'SATIS',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Satış Faturası: ${fatura.faturaNo} (Geri Yüklendi)`,
              },
            });
          }
        } else if (fatura.faturaTipi === 'ALIS') {
          for (const kalem of fatura.kalemler) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'GIRIS',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Alış Faturası: ${fatura.faturaNo} (Geri Yüklendi)`,
              },
            });
          }
        }
      }

      // Audit log (transaction içinde)
      await this.createLog(
        id,
        'RESTORE',
        userId,
        { fatura },
        ipAddress,
        userAgent,
        prisma,
      );

      return restored;
    });
  }

  async iptalEt(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    irsaliyeIptal?: boolean,
  ) {
    const fatura = await this.findOne(id);

    // ⚠️ GÜVENLIK KONTROLLERI

    // 1. Zaten iptal edilmiş mi?
    if (fatura.durum === 'IPTAL') {
      throw new BadRequestException('Bu fatura zaten iptal edilmiş.');
    }

    // 2. Sadece ONAYLANDI faturalar iptal edilebilir!
    if (fatura.durum !== 'ONAYLANDI') {
      throw new BadRequestException(
        'Sadece ONAYLANDI durumundaki faturalar iptal edilebilir. ' +
        'ACIK (Beklemede) faturalar henüz işleme alınmadığı için iptal edilemez.',
      );
    }

    // 3. Ödeme yapılmış faturalar iptal edilemez!
    const odenenTutar = Number(fatura.odenenTutar || 0);
    if (odenenTutar > 0.01) {
      throw new BadRequestException(
        `Bu faturaya ₺${odenenTutar.toFixed(2)} ödeme yapılmış. ` +
        'Ödemeli faturalar iptal edilemez. Önce ödemeleri iptal edin.',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // 1. Fatura durumunu IPTAL yap
      const iptaldiFatura = await prisma.fatura.update({
        where: { id },
        data: { durum: 'IPTAL' },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // 2. Stokları geri al (ters işlem)
      if (fatura.faturaTipi === 'SATIS') {
        // Satış faturası iptal: Stoğa geri ekle
        for (const kalem of fatura.kalemler) {
          await prisma.stokHareket.create({
            data: {
              stokId: kalem.stokId,
              hareketTipi: 'IADE',
              miktar: kalem.miktar,
              birimFiyat: kalem.birimFiyat,
              aciklama: `Fatura İptali: ${fatura.faturaNo} - ${kalem.stok?.stokAdi || 'Stok'}`,
            },
          });
        }
      } else if (fatura.faturaTipi === 'ALIS') {
        // Alış faturası iptal: Stoktan düş
        for (const kalem of fatura.kalemler) {
          await prisma.stokHareket.create({
            data: {
              stokId: kalem.stokId,
              hareketTipi: 'CIKIS',
              miktar: kalem.miktar,
              birimFiyat: kalem.birimFiyat,
              aciklama: `Fatura İptali: ${fatura.faturaNo} - ${kalem.stok?.stokAdi || 'Stok'}`,
            },
          });
        }
      }

      // 3. Cari hareket kaydını sil veya ters işlem yap
      await prisma.cariHareket.deleteMany({
        where: {
          cariId: fatura.cariId,
          belgeTipi: 'FATURA',
          belgeNo: fatura.faturaNo,
        },
      });

      // 4. Cari bakiyeyi düzelt (ters işlem)
      await prisma.cari.update({
        where: { id: fatura.cariId },
        data: {
          bakiye:
            fatura.faturaTipi === 'SATIS'
              ? { decrement: fatura.genelToplam } // Satış faturasında borcu azalt
              : { increment: fatura.genelToplam }, // Alış faturasında alacağı arttır
        },
      });

      // 5. İptal hareket kaydı oluştur
      const yeniBakiye =
        fatura.faturaTipi === 'SATIS'
          ? fatura.cari.bakiye.toNumber() - fatura.genelToplam.toNumber()
          : fatura.cari.bakiye.toNumber() + fatura.genelToplam.toNumber();

      await prisma.cariHareket.create({
        data: {
          cariId: fatura.cariId,
          tip: fatura.faturaTipi === 'SATIS' ? 'ALACAK' : 'BORC', // Ters işlem
          tutar: fatura.genelToplam,
          bakiye: yeniBakiye,
          belgeTipi: 'DUZELTME',
          belgeNo: `${fatura.faturaNo}-IPTAL`,
          tarih: new Date(),
          aciklama: `Fatura İptali: ${fatura.faturaNo}`,
        },
      });

      // Eğer irsaliyeIptal true ise ve faturaya bağlı irsaliye varsa
      if (irsaliyeIptal && fatura.deliveryNoteId) {
        const irsaliye = await prisma.satisIrsaliyesi.findUnique({
          where: { id: fatura.deliveryNoteId },
          include: {
            kalemler: {
              include: {
                stok: true,
              },
            },
          },
        });

        if (irsaliye && irsaliye.durum === 'FATURALANDI') {
          // İrsaliye durumunu FATURALANMADI'ya çevir
          await prisma.satisIrsaliyesi.update({
            where: { id: irsaliye.id },
            data: { durum: IrsaliyeDurum.FATURALANMADI },
          });

          // İrsaliye kalemlerini stoğa geri ekle (IADE tipi stok hareketi)
          const tenantId = await this.tenantResolver.resolveForCreate({ userId });
          for (const kalem of irsaliye.kalemler) {
            const miktar = typeof kalem.miktar === 'object' && 'toNumber' in kalem.miktar
              ? (kalem.miktar as Decimal).toNumber()
              : Number(kalem.miktar);
            const birimFiyat = typeof kalem.birimFiyat === 'object' && 'toNumber' in kalem.birimFiyat
              ? (kalem.birimFiyat as Decimal).toNumber()
              : Number(kalem.birimFiyat);

            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'IADE',
                miktar,
                birimFiyat,
                aciklama: `Fatura İptali - İrsaliye İptali: ${irsaliye.irsaliyeNo} - ${kalem.stok?.stokAdi || 'Stok'}`,
                ...(tenantId && { tenantId }),
              },
            });
          }
        }
      }

      // Audit log (transaction içinde)
      await this.createLog(
        id,
        'IPTAL',
        userId,
        { eskiDurum: fatura.durum, yeniDurum: 'IPTAL', irsaliyeIptal },
        ipAddress,
        userAgent,
        prisma,
      );

      return iptaldiFatura;
    });
  }

  async changeDurum(
    id: string,
    yeniDurum: FaturaDurum,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const fatura = await this.findOne(id);
    const eskiDurum = fatura.durum;

    if (eskiDurum === yeniDurum) {
      throw new BadRequestException('Fatura zaten bu durumda.');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Durum değişikliğine göre işlemler

      // Eski durum ONAYLANDI ise, işlemleri geri al
      if (eskiDurum === 'ONAYLANDI') {
        // Cari hareket kaydını sil
        await prisma.cariHareket.deleteMany({
          where: {
            cariId: fatura.cariId,
            belgeTipi: 'FATURA',
            belgeNo: fatura.faturaNo,
          },
        });

        // Cari bakiyeyi geri al
        await prisma.cari.update({
          where: { id: fatura.cariId },
          data: {
            bakiye:
              fatura.faturaTipi === 'SATIS'
                ? { decrement: fatura.genelToplam }
                : { increment: fatura.genelToplam },
          },
        });

        // Stokları geri al (ters işlem)
        if (fatura.faturaTipi === 'SATIS') {
          // Satış faturası iptal: Stoğa geri ekle
          for (const kalem of fatura.kalemler) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'IADE',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Fatura Durum Değişikliği: ${fatura.faturaNo} (ONAYLANDI → ${yeniDurum})`,
              },
            });
          }
        } else if (fatura.faturaTipi === 'ALIS') {
          // Alış faturası iptal: Stoktan düş
          for (const kalem of fatura.kalemler) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'CIKIS',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Fatura Durum Değişikliği: ${fatura.faturaNo} (ONAYLANDI → ${yeniDurum})`,
              },
            });
          }
        }
      }

      // Yeni durum ONAYLANDI ise, işlemleri uygula
      if (yeniDurum === 'ONAYLANDI') {
        // Kar hesaplamasını güncelle (maliyet değişmiş olabilir)
        if (fatura.faturaTipi === 'SATIS') {
          try {
            await this.invoiceProfitService.recalculateProfit(
              id,
              userId,
            );
          } catch (error) {
            console.error('Kar hesaplama hatası:', error);
          }
        }
        // Cari hareket kaydı oluştur
        const cari = await prisma.cari.findUnique({
          where: { id: fatura.cariId },
        });

        if (cari) {
          await prisma.cariHareket.create({
            data: {
              cariId: fatura.cariId,
              tip: fatura.faturaTipi === 'SATIS' ? 'BORC' : 'ALACAK',
              tutar: fatura.genelToplam,
              bakiye:
                fatura.faturaTipi === 'SATIS'
                  ? cari.bakiye.toNumber() + fatura.genelToplam.toNumber()
                  : cari.bakiye.toNumber() - fatura.genelToplam.toNumber(),
              belgeTipi: 'FATURA',
              belgeNo: fatura.faturaNo,
              tarih: fatura.tarih,
              aciklama: `${fatura.faturaTipi === 'SATIS' ? 'Satış' : 'Alış'} Faturası: ${fatura.faturaNo}`,
            },
          });

          // Cari bakiyeyi güncelle
          await prisma.cari.update({
            where: { id: fatura.cariId },
            data: {
              bakiye:
                fatura.faturaTipi === 'SATIS'
                  ? { increment: fatura.genelToplam }
                  : { decrement: fatura.genelToplam },
            },
          });

          // Stok hareketi oluştur
          if (fatura.faturaTipi === 'SATIS') {
            // Satış faturası: Stoktan düş
            for (const kalem of fatura.kalemler) {
              await prisma.stokHareket.create({
                data: {
                  stokId: kalem.stokId,
                  hareketTipi: 'SATIS',
                  miktar: kalem.miktar,
                  birimFiyat: kalem.birimFiyat,
                  aciklama: `Satış Faturası: ${fatura.faturaNo}`,
                },
              });
            }
          } else if (fatura.faturaTipi === 'ALIS') {
            // Alış faturası: Stoğa ekle
            for (const kalem of fatura.kalemler) {
              await prisma.stokHareket.create({
                data: {
                  stokId: kalem.stokId,
                  hareketTipi: 'GIRIS',
                  miktar: kalem.miktar,
                  birimFiyat: kalem.birimFiyat,
                  aciklama: `Alış Faturası: ${fatura.faturaNo}`,
                },
              });
            }
          }
        }
      }

      // Yeni durum IPTAL ise, iptal işlemlerini yap
      if (yeniDurum === 'IPTAL') {
        // Eğer eski durum ONAYLANDI değilse, sadece durumu değiştir
        // ONAYLANDI ise yukarıda zaten geri alındı

        // İptal hareket kaydı oluştur (sadece ONAYLANDI'dan geliyorsa)
        if (eskiDurum === 'ONAYLANDI') {
          const cari = await prisma.cari.findUnique({
            where: { id: fatura.cariId },
          });

          if (cari) {
            await prisma.cariHareket.create({
              data: {
                cariId: fatura.cariId,
                tip: fatura.faturaTipi === 'SATIS' ? 'ALACAK' : 'BORC',
                tutar: fatura.genelToplam,
                bakiye: cari.bakiye.toNumber(),
                belgeTipi: 'DUZELTME',
                belgeNo: `${fatura.faturaNo}-IPTAL`,
                tarih: new Date(),
                aciklama: `Fatura İptali: ${fatura.faturaNo}`,
              },
            });
          }
        }
      }

      // Fatura durumunu güncelle
      const updated = await prisma.fatura.update({
        where: { id },
        data: {
          durum: yeniDurum,
          updatedBy: userId,
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Audit log (transaction içinde)
      await this.createLog(
        id,
        'DURUM_DEGISIKLIK',
        userId,
        { eskiDurum, yeniDurum },
        ipAddress,
        userAgent,
        prisma,
      );

      return updated;
    });
  }

  async getVadeAnaliz(cariId?: string) {
    // Sadece ONAYLANDI ve KAPALI olmayan (ödenmemiş/kısmen ödenmiş) faturaları al
    const where: Prisma.FaturaWhereInput = {
      deletedAt: null,
      durum: 'ONAYLANDI', // Sadece onaylanmış faturalar
      odenecekTutar: {
        gt: 0.01, // Kalan borcu olanlar
      },
    };

    if (cariId) {
      where.cariId = cariId;
    }

    const faturalar = await this.prisma.fatura.findMany({
      where,
      include: {
        cari: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            tip: true,
          },
        },
      },
      orderBy: [
        { vade: 'asc' }, // En eski vade önce
        { tarih: 'asc' },
      ],
    });

    // Bugünün tarihini al (saat bilgisi olmadan)
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    // Faturalar için vade analizi
    const analiz = faturalar.map((fatura) => {
      const vade = fatura.vade ? new Date(fatura.vade) : new Date(fatura.tarih);
      vade.setHours(0, 0, 0, 0);

      const kalanGun = Math.ceil(
        (vade.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24),
      );

      let vadeDurumu: 'GECMIS' | 'BUGUN' | 'YAKLASAN' | 'NORMAL';
      if (kalanGun < 0) {
        vadeDurumu = 'GECMIS'; // Vadesi geçmiş
      } else if (kalanGun === 0) {
        vadeDurumu = 'BUGUN'; // Bugün vade
      } else if (kalanGun <= 7) {
        vadeDurumu = 'YAKLASAN'; // 7 gün içinde
      } else {
        vadeDurumu = 'NORMAL'; // Normal
      }

      return {
        id: fatura.id,
        faturaNo: fatura.faturaNo,
        faturaTipi: fatura.faturaTipi,
        cari: fatura.cari,
        tarih: fatura.tarih,
        vade: fatura.vade,
        genelToplam: fatura.genelToplam,
        odenenTutar: fatura.odenenTutar,
        odenecekTutar: fatura.odenecekTutar,
        kalanGun,
        vadeDurumu,
        gecenGun: kalanGun < 0 ? Math.abs(kalanGun) : 0, // Kaç gün geçti
      };
    });

    // Özet istatistikler
    const ozet = {
      toplam: analiz.length,
      toplamTutar: analiz.reduce((sum, f) => sum + Number(f.genelToplam), 0),
      toplamKalanTutar: analiz.reduce(
        (sum, f) => sum + Number(f.odenecekTutar),
        0,
      ),

      vadesiGecenler: {
        adet: analiz.filter((f) => f.vadeDurumu === 'GECMIS').length,
        tutar: analiz
          .filter((f) => f.vadeDurumu === 'GECMIS')
          .reduce((sum, f) => sum + Number(f.odenecekTutar), 0),
      },

      bugunVadenler: {
        adet: analiz.filter((f) => f.vadeDurumu === 'BUGUN').length,
        tutar: analiz
          .filter((f) => f.vadeDurumu === 'BUGUN')
          .reduce((sum, f) => sum + Number(f.odenecekTutar), 0),
      },

      yaklaşanlar: {
        adet: analiz.filter((f) => f.vadeDurumu === 'YAKLASAN').length,
        tutar: analiz
          .filter((f) => f.vadeDurumu === 'YAKLASAN')
          .reduce((sum, f) => sum + Number(f.odenecekTutar), 0),
      },

      normalFaturalar: {
        adet: analiz.filter((f) => f.vadeDurumu === 'NORMAL').length,
        tutar: analiz
          .filter((f) => f.vadeDurumu === 'NORMAL')
          .reduce((sum, f) => sum + Number(f.odenecekTutar), 0),
      },
    };

    // Cari bazlı özet (cariId yoksa)
    const cariOzet = cariId ? null : await this.getCariBazliVadeOzet(analiz);

    return {
      ozet,
      cariOzet,
      faturalar: analiz,
    };
  }

  private async getCariBazliVadeOzet(analiz: any[]) {
    // Cari bazında grupla
    const cariMap = new Map<string, any>();

    analiz.forEach((fatura) => {
      const cariId = fatura.cari.id;
      if (!cariMap.has(cariId)) {
        cariMap.set(cariId, {
          cari: fatura.cari,
          toplamFatura: 0,
          toplamKalan: 0,
          vadesiGecen: 0,
          vadesiGecenTutar: 0,
        });
      }

      const cariData = cariMap.get(cariId);
      cariData.toplamFatura += 1;
      cariData.toplamKalan += Number(fatura.odenecekTutar);

      if (fatura.vadeDurumu === 'GECMIS') {
        cariData.vadesiGecen += 1;
        cariData.vadesiGecenTutar += Number(fatura.odenecekTutar);
      }
    });

    // Map'i array'e çevir ve vadesi geçenleri başa al
    return Array.from(cariMap.values()).sort(
      (a, b) => b.vadesiGecenTutar - a.vadesiGecenTutar,
    );
  }

  /**
   * Malzeme Hazırlama Fişi - Depo görevlileri için
   * Fatura kalemlerindeki ürünlerin hangi rafta olduğunu gösterir
   */
  async getMalzemeHazirlamaFisi(faturaId: string) {
    // Faturayı ve kalemlerini getir
    const fatura = await this.prisma.fatura.findUnique({
      where: { id: faturaId },
      include: {
        cari: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            telefon: true,
            adres: true,
          },
        },
        kalemler: {
          include: {
            stok: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
                birim: true,
                raf: true, // Eski raf sistemi
                barkod: true,
                marka: true,
                model: true,
              },
            },
          },
          orderBy: {
            stok: {
              stokKodu: 'asc',
            },
          },
        },
      },
    });

    if (!fatura) {
      throw new NotFoundException('Fatura bulunamadı');
    }

    // Her ürün için raf lokasyonlarını getir (yeni sistem)
    const kalemlerWithRaf = await Promise.all(
      fatura.kalemler.map(async (kalem) => {
        // ProductLocationStock'tan raf bilgilerini al
        const rafBilgileri = await this.prisma.productLocationStock.findMany({
          where: {
            productId: kalem.stokId,
            qtyOnHand: {
              gt: 0, // Sadece stokta olan raflar
            },
          },
          include: {
            location: {
              select: {
                id: true,
                code: true,
                barcode: true,
                name: true,
                layer: true,
                corridor: true,
                side: true,
                section: true,
                level: true,
              },
            },
            warehouse: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
          orderBy: [
            { qtyOnHand: 'desc' }, // En çok stok olan rafları önce göster
            { location: { code: 'asc' } },
          ],
        });

        return {
          stokId: kalem.stokId,
          stokKodu: kalem.stok.stokKodu,
          stokAdi: kalem.stok.stokAdi,
          birim: kalem.stok.birim,
          barkod: kalem.stok.barkod,
          marka: kalem.stok.marka,
          model: kalem.stok.model,
          istenenMiktar: kalem.miktar,
          birimFiyat: kalem.birimFiyat,
          kdvOrani: kalem.kdvOrani,
          // Raf bilgileri
          eskiRaf: kalem.stok.raf, // Eski sistemdeki raf
          raflar: rafBilgileri.map((raf) => ({
            depoKodu: raf.warehouse.code,
            depoAdi: raf.warehouse.name,
            rafKodu: raf.location.code,
            rafBarkod: raf.location.barcode,
            rafAciklama: raf.location.name,
            kat: raf.location.layer,
            koridor: raf.location.corridor,
            taraf: raf.location.side,
            bolum: raf.location.section,
            seviye: raf.location.level,
            mevcutMiktar: raf.qtyOnHand,
          })),
          toplamMevcutMiktar: rafBilgileri.reduce(
            (sum, raf) => sum + raf.qtyOnHand,
            0,
          ),
          toplamRafSayisi: rafBilgileri.length,
        };
      }),
    );

    return {
      fatura: {
        id: fatura.id,
        faturaNo: fatura.faturaNo,
        faturaTipi: fatura.faturaTipi,
        tarih: fatura.tarih,
        vade: fatura.vade,
        durum: fatura.durum,
        toplamTutar: fatura.toplamTutar,
        kdvTutar: fatura.kdvTutar,
        genelToplam: fatura.genelToplam,
        aciklama: fatura.aciklama,
      },
      cari: fatura.cari,
      kalemler: kalemlerWithRaf,
      hazirlamaBilgisi: {
        toplamKalemSayisi: kalemlerWithRaf.length,
        toplamUrunAdedi: kalemlerWithRaf.reduce(
          (sum, k) => sum + k.istenenMiktar,
          0,
        ),
        eksikUrunler: kalemlerWithRaf.filter(
          (k) => k.toplamMevcutMiktar < k.istenenMiktar,
        ),
        tamUrunler: kalemlerWithRaf.filter(
          (k) => k.toplamMevcutMiktar >= k.istenenMiktar,
        ),
      },
      olusturmaTarihi: new Date(),
    };
  }

  /**
   * E-Fatura gönder - Hızlı Teknoloji API'sine fatura gönderir
   */
  async sendEInvoice(
    faturaId: string,
    hizliService: any, // HizliService instance
    userId?: string,
  ) {
    // Fatura verisini getir
    const fatura = await this.findOne(faturaId);

    if (!fatura) {
      throw new NotFoundException(`Fatura bulunamadı: ${faturaId}`);
    }

    if (fatura.faturaTipi !== 'SATIS') {
      throw new BadRequestException('Sadece satış faturaları E-fatura olarak gönderilebilir');
    }

    if (fatura.durum === 'IPTAL') {
      throw new BadRequestException('İptal edilmiş faturalar E-fatura olarak gönderilemez');
    }

    // Cari bilgilerini kontrol et
    if (!fatura.cari.vergiNo && !fatura.cari.tcKimlikNo) {
      throw new BadRequestException('Cari bilgilerinde VKN veya TC Kimlik No bulunamadı');
    }

    const customerIdentifier = fatura.cari.vergiNo || fatura.cari.tcKimlikNo;

    try {
      // 1. Alıcı URN bilgisini al (GetGibUserList)
      let destinationUrn = '';
      try {
        const gibUserList = await hizliService.getGibUserList(1, 'PK', customerIdentifier);

        // REST API response formatı kontrolü
        if (gibUserList?.IsSucceeded && gibUserList?.gibUserLists && Array.isArray(gibUserList.gibUserLists) && gibUserList.gibUserLists.length > 0) {
          destinationUrn = gibUserList.gibUserLists[0].Alias || '';
          console.log(`✅ Alıcı URN bulundu: ${destinationUrn} (Identifier: ${customerIdentifier})`);
        } else if (gibUserList?.IsSucceeded === false) {
          // API başarısız döndü ama exception fırlatmadı
          throw new BadRequestException(`Alıcı URN bilgisi alınamadı: ${gibUserList?.Message || 'GIB kullanıcı listesi boş veya bulunamadı'}`);
        } else {
          // IsSucceeded undefined veya gibUserLists boş
          throw new BadRequestException(`Alıcı URN bilgisi bulunamadı. GIB kullanıcı listesi boş (Identifier: ${customerIdentifier})`);
        }
      } catch (error: any) {
        // URN alınamazsa hata fırlat
        const errorMessage = error.message || error.response?.data?.message || 'Bilinmeyen hata';
        throw new BadRequestException(`Alıcı URN bilgisi alınamadı: ${errorMessage}`);
      }

      // 2. Fatura verisini Hızlı Teknoloji formatına çevir
      const invoiceModel = this.mapFaturaToInvoiceModel(fatura, destinationUrn);

      // 3. InputInvoiceModel oluştur
      const inputInvoice = {
        AppType: 1, // 1: E-Fatura, 2: E-Arşiv, 3: E-İrsaliye
        SourceUrn: process.env.HIZLI_GB_URN || 'urn:mail:defaultgb@hizlibilisimteknolojileri.net',
        DestinationIdentifier: customerIdentifier,
        DestinationUrn: destinationUrn,
        IsDraft: false,
        IsDraftSend: false,
        IsPreview: false,
        LocalId: null,
        UpdateDocument: false,
        InvoiceModel: invoiceModel,
      };

      // 4. SendInvoiceModel ile gönder
      const result = await hizliService.sendInvoiceModel([inputInvoice]);

      // 5. Sonucu kontrol et ve veritabanına kaydet
      if (result && result.length > 0 && result[0].IsSucceeded) {
        // Başarılı - E-fatura durumunu güncelle
        await this.prisma.fatura.update({
          where: { id: faturaId },
          data: {
            efaturaStatus: 'SENT',
            efaturaEttn: result[0].UUID || null,
            updatedBy: userId,
          },
        });

        // Log kaydı oluştur
        await this.createLog(
          faturaId,
          'EFATURA_GONDERILDI',
          userId,
          {
            ettn: result[0].UUID,
            message: result[0].Message,
          },
        );

        return {
          success: true,
          message: result[0].Message || 'E-fatura başarıyla gönderildi',
          ettn: result[0].UUID,
          data: result[0],
        };
      } else {
        // Başarısız
        const errorMessage = result && result.length > 0 ? result[0].Message : 'Bilinmeyen hata';

        await this.prisma.fatura.update({
          where: { id: faturaId },
          data: {
            efaturaStatus: 'ERROR',
            updatedBy: userId,
          },
        });

        await this.createLog(
          faturaId,
          'EFATURA_GONDERIM_HATASI',
          userId,
          {
            error: errorMessage,
          },
        );

        throw new BadRequestException(`E-fatura gönderilemedi: ${errorMessage}`);
      }
    } catch (error) {
      // Hata durumunda status'u güncelle
      await this.prisma.fatura.update({
        where: { id: faturaId },
        data: {
          efaturaStatus: 'ERROR',
          updatedBy: userId,
        },
      });

      await this.createLog(
        faturaId,
        'EFATURA_GONDERIM_HATASI',
        userId,
        {
          error: error.message,
        },
      );

      throw error;
    }
  }

  /**
   * Fatura verisini Hızlı Teknoloji InvoiceModel formatına çevirir
   */
  private mapFaturaToInvoiceModel(fatura: any, destinationUrn: string) {
    const issueDate = new Date(fatura.tarih);
    const issueDateStr = issueDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const issueTimeStr = issueDate.toTimeString().split(' ')[0]; // HH:mm:ss

    // UUID oluştur (eğer yoksa)
    const uuid = fatura.efaturaEttn || this.generateUUID();

    // Invoice Lines (Kalemler)
    const invoiceLines = fatura.kalemler.map((kalem: any, index: number) => {
      const birimFiyat = Number(kalem.birimFiyat);
      const miktar = Number(kalem.miktar);
      const tutar = birimFiyat * miktar;
      const kdvOrani = Number(kalem.kdvOrani || 0);
      const kdvTutar = (tutar * kdvOrani) / 100;

      // Birim kodunu çevir (C62 = Adet)
      const birimKodu = this.mapBirimToUnitCode(kalem.stok?.birim || 'ADET');

      return {
        ID: index + 1,
        Item_Name: kalem.stok?.stokAdi || 'Mal/Hizmet',
        Quantity_Amount: miktar,
        Quantity_Unit_User: birimKodu,
        Price_Amount: birimFiyat,
        Price_Total: tutar,
        Allowance_Percent: 0,
        Allowance_Amount: 0,
        Allowance_Reason: null,
        Item_ID_Buyer: null,
        Item_ID_Seller: kalem.stok?.stokKodu || null,
        Item_Description: kalem.stok?.aciklama || null,
        Item_Brand: kalem.stok?.marka || null,
        Item_Model: kalem.stok?.model || null,
        Item_Classification: null,
        LineNote: null,
        LineCurrencyCode: null,
        Manufacturers_ItemIdentification: null,
        exportLine: null,
        lineTaxes: [
          {
            Tax_Code: '0015', // KDV kodu
            Tax_Name: 'KDV',
            Tax_Base: tutar,
            Tax_Perc: kdvOrani,
            Tax_Amnt: kdvTutar,
            Tax_Exem: '',
            Tax_Exem_Code: '',
          },
        ],
      };
    });

    // Customer (Alıcı) bilgileri
    const customer = {
      IdentificationID: fatura.cari.vergiNo || fatura.cari.tcKimlikNo || '',
      PartyName: fatura.cari.unvan || '',
      TaxSchemeName: fatura.cari.vergiDairesi || '',
      CountryName: fatura.cari.ulke || 'TÜRKİYE',
      CityName: fatura.cari.il || '',
      CitySubdivisionName: fatura.cari.ilce || '',
      StreetName: fatura.cari.adres || '',
      PostalZone: null,
      ElectronicMail: fatura.cari.email || null,
      Telephone: fatura.cari.telefon || null,
      Telefax: null,
      WebsiteURI: null,
      Person_FirstName: fatura.cari.sirketTipi === 'SAHIS' ? (fatura.cari.isimSoyisim?.split(' ')[0] || '') : '',
      Person_FamilyName: fatura.cari.sirketTipi === 'SAHIS' ? (fatura.cari.isimSoyisim?.split(' ').slice(1).join(' ') || '') : '',
      customerIdentificationsOther: [],
    };

    // Invoice Header
    const invoiceHeader = {
      UUID: uuid,
      Invoice_ID: fatura.faturaNo,
      ProfileID: 'TICARIFATURA', // TICARIFATURA, TEMELFATURA, EARSIVFATURA
      InvoiceTypeCode: 'SATIS',
      IssueDate: issueDateStr,
      IssueTime: issueTimeStr,
      DocumentCurrencyCode: 'TRY',
      CalculationRate: 1,
      XSLT_Adi: 'general', // general.xslt dosyası
      XSLT_Doc: null,
      LineExtensionAmount: Number(fatura.toplamTutar),
      AllowanceTotalAmount: Number(fatura.iskonto || 0),
      TaxInclusiveAmount: Number(fatura.toplamTutar) + Number(fatura.kdvTutar),
      PayableAmount: Number(fatura.genelToplam),
      Note: fatura.aciklama || '',
      Notes: fatura.aciklama ? [{ Note: fatura.aciklama }] : [],
      OrderReferenceId: fatura.siparisNo || null,
      OrderReferenceDate: fatura.siparisNo ? issueDateStr : null,
      IsInternetSale: false,
      IsInternet_PaymentMeansCode: null,
      IsInternet_PaymentDueDate: null,
      IsInternet_InstructionNote: null,
      IsInternet_WebsiteURI: null,
      IsInternet_Delivery_TcknVkn: null,
      IsInternet_Delivery_PartyName: null,
      IsInternet_Delivery_FirstName: null,
      IsInternet_Delivery_FamilyName: null,
      IsInternet_ActualDespatchDate: null,
      Sgk_AccountingCost: null,
      Sgk_Period_StartDate: null,
      Sgk_Period_EndDate: null,
      Sgk_Mukellef_Kodu: null,
      Sgk_Mukellef_Adi: null,
      Sgk_DosyaNo: null,
    };

    // Payment Means (Ödeme bilgileri)
    const paymentMeans = fatura.vade
      ? [
        {
          PaymentMeansCode: 'ZZZ', // Diğer
          InstructionNote: '-',
          PaymentChannelCode: '',
          PaymentDueDate: new Date(fatura.vade).toISOString(),
          PayeeFinancialAccount: null,
          PayeeFinancialCurrencyCode: 'TRY',
        },
      ]
      : [];

    return {
      invoiceheader: invoiceHeader,
      customer: customer,
      invoiceLines: invoiceLines,
      paymentMeans: paymentMeans,
      supplier: null, // Satıcı bilgileri sistemden alınacak (opsiyonel)
      supplierAgent: null,
      customerAgent: null,
      additionalDocumentReferences: [],
      despatchs: [],
    };
  }

  /**
   * Birim kodunu Hızlı Teknoloji unit code'una çevirir
   */
  private mapBirimToUnitCode(birim: string): string {
    const birimMap: Record<string, string> = {
      ADET: 'C62',
      KG: 'KGM',
      TON: 'TNE',
      LITRE: 'LTR',
      METRE: 'MTR',
      M2: 'MTK',
      M3: 'MTQ',
      PAKET: 'PK',
      KUTU: 'CT',
      PALET: 'PF',
    };

    return birimMap[birim.toUpperCase()] || 'C62'; // Varsayılan: Adet
  }

  /**
   * UUID oluşturur
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
