import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTahsilatDto } from './dto/create-tahsilat.dto';
import { CreateCaprazOdemeDto } from './dto/create-capraz-odeme.dto';
import { TahsilatTip, OdemeTipi, KasaHareketTipi } from '@prisma/client';

@Injectable()
export class TahsilatService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateTahsilatDto, userId: string) {
    // Cari kontrolü
    const cari = await this.prisma.cari.findUnique({
      where: { id: createDto.cariId },
    });

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    // Fatura kontrolü (varsa)
    if (createDto.faturaId) {
      const fatura = await this.prisma.fatura.findUnique({
        where: { id: createDto.faturaId },
      });

      if (!fatura) {
        throw new NotFoundException('Fatura bulunamadı');
      }
    }

    // Kasa kontrolü (nakit veya kredi kartı ise)
    if (createDto.kasaId) {
      const kasa = await this.prisma.kasa.findUnique({
        where: { id: createDto.kasaId },
      });

      if (!kasa) {
        throw new NotFoundException('Kasa bulunamadı');
      }

      if (!kasa.aktif) {
        throw new BadRequestException('Seçilen kasa aktif değil');
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      // Tahsilat kaydı oluştur
      const tahsilat = await tx.tahsilat.create({
        data: {
          cariId: createDto.cariId,
          faturaId: createDto.faturaId,
          tip: createDto.tip,
          tutar: createDto.tutar,
          tarih: createDto.tarih ? new Date(createDto.tarih) : new Date(),
          odemeTipi: createDto.odemeTipi,
          kasaId: createDto.kasaId,
          bankaHesapId: createDto.bankaHesapId,
          firmaKrediKartiId: createDto.firmaKrediKartiId,
          aciklama: createDto.aciklama,
          createdBy: userId,
        },
        include: {
          cari: true,
          kasa: true,
          fatura: true,
          bankaHesap: true,
          firmaKrediKarti: true,
        },
      });

      // ✅ FIFO MANTIĞI: Tahsilat tutarını açık faturalara dağıt
      await this.applyFIFO(
        tx,
        tahsilat.id,
        createDto.cariId,
        createDto.tip,
        createDto.tutar,
      );

      // Cari bakiye güncelle
      const bakiyeDegisimi =
        createDto.tip === 'TAHSILAT'
          ? -createDto.tutar // Tahsilat bakiyeyi azaltır
          : createDto.tutar; // Ödeme bakiyeyi artırır

      await tx.cari.update({
        where: { id: createDto.cariId },
        data: {
          bakiye: {
            increment: bakiyeDegisimi,
          },
        },
      });

      // Cari hareket kaydı oluştur
      // Mevcut cari bakiyesini al
      const cari = await tx.cari.findUnique({
        where: { id: createDto.cariId },
        select: { bakiye: true },
      });

      const cariBakiyeDegisim =
        createDto.tip === 'TAHSILAT'
          ? -createDto.tutar // Tahsilat: Alacak azaldı
          : createDto.tutar; // Ödeme: Borç arttı
      const yeniCariBakiye = cari!.bakiye.toNumber() + cariBakiyeDegisim;

      await tx.cariHareket.create({
        data: {
          cariId: createDto.cariId,
          tip: createDto.tip === 'TAHSILAT' ? 'ALACAK' : 'BORC',
          tutar: createDto.tutar,
          bakiye: yeniCariBakiye,
          aciklama:
            createDto.aciklama ||
            `${createDto.odemeTipi} ile ${createDto.tip.toLowerCase()}`,
          belgeTipi: 'TAHSILAT',
          belgeNo: tahsilat.id,
        },
      });

      // Cari bakiyesini güncelle
      await tx.cari.update({
        where: { id: createDto.cariId },
        data: { bakiye: yeniCariBakiye },
      });

      // Kasa hareketi oluştur (nakit veya kredi kartı ise)
      if (createDto.kasaId) {
        const hareketTipi: KasaHareketTipi =
          createDto.tip === 'TAHSILAT' ? 'TAHSILAT' : 'ODEME';

        // Mevcut kasa bakiyesini al
        const kasa = await tx.kasa.findUnique({
          where: { id: createDto.kasaId },
          select: { bakiye: true },
        });

        const kasaBakiyeDegisim =
          createDto.tip === 'TAHSILAT' ? createDto.tutar : -createDto.tutar;
        const yeniKasaBakiye = kasa!.bakiye.toNumber() + kasaBakiyeDegisim;

        await tx.kasaHareket.create({
          data: {
            kasaId: createDto.kasaId,
            hareketTipi,
            tutar: createDto.tutar,
            bakiye: yeniKasaBakiye,
            belgeTipi: 'TAHSILAT',
            belgeNo: tahsilat.id,
            cariId: createDto.cariId,
            aciklama: createDto.aciklama,
            tarih: createDto.tarih ? new Date(createDto.tarih) : new Date(),
            createdBy: userId,
          },
        });

        // Kasa bakiyesi zaten `KasaHareket`'te güncellenmiş durumda yok, Kasa tablosunu da güncelleyelim
        // Not: Kasa bakiyesi update ediliyor ama bu işlemi transaction içinde yapıyoruz
        await tx.kasa.update({
          where: { id: createDto.kasaId },
          data: {
            bakiye: yeniKasaBakiye,
          },
        });
      }

      return tahsilat;
    });
  }

  async createCaprazOdeme(createDto: CreateCaprazOdemeDto, userId: string) {
    // Cariler farklı olmalı
    if (createDto.tahsilatCariId === createDto.odemeCariId) {
      throw new BadRequestException(
        'Tahsilat ve ödeme carileri farklı olmalıdır',
      );
    }

    // Tahsilat cari kontrolü
    const tahsilatCari = await this.prisma.cari.findUnique({
      where: { id: createDto.tahsilatCariId },
    });

    if (!tahsilatCari) {
      throw new NotFoundException('Tahsilat cari bulunamadı');
    }

    // Ödeme cari kontrolü
    const odemeCari = await this.prisma.cari.findUnique({
      where: { id: createDto.odemeCariId },
    });

    if (!odemeCari) {
      throw new NotFoundException('Ödeme cari bulunamadı');
    }

    // Kasa kontrolü yapılmaz - Çapraz ödemede para kasaya girmez

    return await this.prisma.$transaction(async (tx) => {
      const tarih = createDto.tarih ? new Date(createDto.tarih) : new Date();
      const aciklama =
        createDto.aciklama ||
        `Çapraz ödeme: ${tahsilatCari.unvan} -> ${odemeCari.unvan}`;
      // Çapraz ödemede ödeme tipi opsiyonel, varsayılan olarak KREDI_KARTI kullanılır (para kasaya girmez)
      const odemeTipi = createDto.odemeTipi || 'KREDI_KARTI';

      // 1. Tahsilat kaydı oluştur (tahsilatCariId'den tahsilat yapılacak)
      const tahsilat = await tx.tahsilat.create({
        data: {
          cariId: createDto.tahsilatCariId,
          tip: 'TAHSILAT',
          tutar: createDto.tutar,
          tarih,
          odemeTipi: odemeTipi,
          kasaId: null, // Çapraz ödemede kasa kullanılmaz
          aciklama: aciklama,
          createdBy: userId,
        },
        include: {
          cari: true,
          kasa: true,
        },
      });

      // 2. Ödeme kaydı oluştur (odemeCariId'ye ödeme yapılacak)
      const odeme = await tx.tahsilat.create({
        data: {
          cariId: createDto.odemeCariId,
          tip: 'ODEME',
          tutar: createDto.tutar,
          tarih,
          odemeTipi: odemeTipi,
          kasaId: null, // Çapraz ödemede kasa kullanılmaz
          aciklama: aciklama,
          createdBy: userId,
        },
        include: {
          cari: true,
          kasa: true,
        },
      });

      // 3. FIFO uygula (tahsilat için)
      await this.applyFIFO(
        tx,
        tahsilat.id,
        createDto.tahsilatCariId,
        'TAHSILAT',
        createDto.tutar,
      );

      // 4. FIFO uygula (ödeme için)
      await this.applyFIFO(
        tx,
        odeme.id,
        createDto.odemeCariId,
        'ODEME',
        createDto.tutar,
      );

      // 5. Tahsilat cari bakiye güncelle (tahsilat: bakiye azalır)
      const tahsilatCariBefore = await tx.cari.findUnique({
        where: { id: createDto.tahsilatCariId },
        select: { bakiye: true },
      });
      const tahsilatCariYeniBakiye =
        tahsilatCariBefore!.bakiye.toNumber() - createDto.tutar;

      await tx.cari.update({
        where: { id: createDto.tahsilatCariId },
        data: {
          bakiye: tahsilatCariYeniBakiye,
        },
      });

      // 6. Ödeme cari bakiye güncelle (ödeme: bakiye artar)
      const odemeCariBefore = await tx.cari.findUnique({
        where: { id: createDto.odemeCariId },
        select: { bakiye: true },
      });
      const odemeCariYeniBakiye =
        odemeCariBefore!.bakiye.toNumber() + createDto.tutar;

      await tx.cari.update({
        where: { id: createDto.odemeCariId },
        data: {
          bakiye: odemeCariYeniBakiye,
        },
      });

      // 7. Tahsilat cari hareket kaydı oluştur
      await tx.cariHareket.create({
        data: {
          cariId: createDto.tahsilatCariId,
          tip: 'ALACAK',
          tutar: createDto.tutar,
          bakiye: tahsilatCariYeniBakiye,
          aciklama: aciklama,
          belgeTipi: 'TAHSILAT',
          belgeNo: tahsilat.id,
        },
      });

      // 8. Ödeme cari hareket kaydı oluştur
      await tx.cariHareket.create({
        data: {
          cariId: createDto.odemeCariId,
          tip: 'BORC',
          tutar: createDto.tutar,
          bakiye: odemeCariYeniBakiye,
          aciklama: aciklama,
          belgeTipi: 'TAHSILAT',
          belgeNo: odeme.id,
        },
      });

      // 9. Kasa hareketi oluşturulmaz
      // Not: Çapraz ödemede para kasaya girmez, doğrudan bir cariden diğerine transfer edilir
      // Bu nedenle kasa hareketi kaydı oluşturulmaz

      return {
        tahsilat,
        odeme,
      };
    });
  }

  async findAll(
    page = 1,
    limit = 50,
    tip?: TahsilatTip,
    odemeTipi?: OdemeTipi,
    cariId?: string,
    baslangicTarihi?: string,
    bitisTarihi?: string,
    kasaId?: string,
    bankaHesapId?: string,
    firmaKrediKartiId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (tip) {
      where.tip = tip;
    }

    if (odemeTipi) {
      where.odemeTipi = odemeTipi;
    }

    if (cariId) {
      where.cariId = cariId;
    }

    if (kasaId) {
      where.kasaId = kasaId;
    }

    if (bankaHesapId) {
      where.bankaHesapId = bankaHesapId;
    }

    if (firmaKrediKartiId) {
      where.firmaKrediKartiId = firmaKrediKartiId;
    }

    if (baslangicTarihi || bitisTarihi) {
      where.tarih = {};
      if (baslangicTarihi) {
        where.tarih.gte = new Date(baslangicTarihi);
      }
      if (bitisTarihi) {
        where.tarih.lte = new Date(bitisTarihi);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.tahsilat.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { tarih: 'desc' },
          { createdAt: 'desc' }, // Aynı tarihteki kayıtlar için en son eklenen önce
        ],
        include: {
          cari: {
            select: {
              id: true,
              cariKodu: true,
              unvan: true,
            },
          },
          kasa: {
            select: {
              id: true,
              kasaKodu: true,
              kasaAdi: true,
              kasaTipi: true,
            },
          },
          bankaHesap: {
            select: {
              id: true,
              hesapAdi: true,
              bankaAdi: true,
            },
          },
          firmaKrediKarti: {
            select: {
              id: true,
              kartAdi: true,
              bankaAdi: true,
              kartTipi: true,
            },
          },
          fatura: {
            select: {
              id: true,
              faturaNo: true,
            },
          },
        },
      }),
      this.prisma.tahsilat.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tahsilat = await this.prisma.tahsilat.findUnique({
      where: { id },
      include: {
        cari: true,
        kasa: true,
        fatura: true,
      },
    });

    if (!tahsilat) {
      throw new NotFoundException('Tahsilat kaydı bulunamadı');
    }

    return tahsilat;
  }

  async getStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      toplamTahsilat,
      toplamOdeme,
      aylikTahsilat,
      aylikOdeme,
      nakitTahsilat,
      krediKartiTahsilat,
    ] = await Promise.all([
      // Toplam tahsilatlar
      this.prisma.tahsilat.aggregate({
        where: { tip: 'TAHSILAT' },
        _sum: { tutar: true },
      }),
      // Toplam ödemeler
      this.prisma.tahsilat.aggregate({
        where: { tip: 'ODEME' },
        _sum: { tutar: true },
      }),
      // Bu ay tahsilatlar
      this.prisma.tahsilat.aggregate({
        where: {
          tip: 'TAHSILAT',
          tarih: { gte: startOfMonth },
        },
        _sum: { tutar: true },
      }),
      // Bu ay ödemeler
      this.prisma.tahsilat.aggregate({
        where: {
          tip: 'ODEME',
          tarih: { gte: startOfMonth },
        },
        _sum: { tutar: true },
      }),
      // Nakit tahsilatlar
      this.prisma.tahsilat.aggregate({
        where: {
          tip: 'TAHSILAT',
          odemeTipi: 'NAKIT',
        },
        _sum: { tutar: true },
      }),
      // Kredi kartı tahsilatlar
      this.prisma.tahsilat.aggregate({
        where: {
          tip: 'TAHSILAT',
          odemeTipi: 'KREDI_KARTI',
        },
        _sum: { tutar: true },
      }),
    ]);

    return {
      toplamTahsilat: toplamTahsilat._sum.tutar || 0,
      toplamOdeme: toplamOdeme._sum.tutar || 0,
      aylikTahsilat: aylikTahsilat._sum.tutar || 0,
      aylikOdeme: aylikOdeme._sum.tutar || 0,
      nakitTahsilat: nakitTahsilat._sum.tutar || 0,
      krediKartiTahsilat: krediKartiTahsilat._sum.tutar || 0,
    };
  }

  async delete(id: string) {
    const tahsilat = await this.findOne(id);

    return await this.prisma.$transaction(async (tx) => {
      // Cari bakiyesini geri al
      const bakiyeDegisimi =
        tahsilat.tip === 'TAHSILAT'
          ? (tahsilat.tutar as any) // Tahsilatı iptal edince bakiye artar
          : -(tahsilat.tutar as any); // Ödemeyi iptal edince bakiye azalır

      await tx.cari.update({
        where: { id: tahsilat.cariId },
        data: {
          bakiye: {
            increment: bakiyeDegisimi,
          },
        },
      });

      // Kasa bakiyesini geri al (varsa)
      if (tahsilat.kasaId) {
        const bakiyeDegisim =
          tahsilat.tip === 'TAHSILAT'
            ? -(tahsilat.tutar as any)
            : (tahsilat.tutar as any);

        await tx.kasa.update({
          where: { id: tahsilat.kasaId },
          data: {
            bakiye: {
              increment: bakiyeDegisim,
            },
          },
        });

        // Kasa hareketini sil
        await tx.kasaHareket.deleteMany({
          where: {
            belgeTipi: 'TAHSILAT',
            belgeNo: id,
          },
        });
      }

      // Cari hareketini sil
      await tx.cariHareket.deleteMany({
        where: {
          belgeTipi: 'TAHSILAT',
          belgeNo: id,
        },
      });

      // Tahsilat kaydını sil
      await tx.tahsilat.delete({
        where: { id },
      });

      return { message: 'Tahsilat kaydı silindi' };
    });
  }

  // ✅ FIFO MANTIĞI: Tahsilat tutarını en eski faturalardan başlayarak dağıt
  private async applyFIFO(
    tx: any,
    tahsilatId: string,
    cariId: string,
    tip: TahsilatTip,
    tutar: number,
  ) {
    // FIFO sadece tahsilat ve ödeme için geçerli (satış faturaları için tahsilat, alış faturaları için ödeme)
    const faturaTipi = tip === 'TAHSILAT' ? 'SATIS' : 'ALIS';

    // 1. Carinin açık faturalarını al (FIFO: En eski önce)
    // ⚠️ ÖNEMLİ: Sadece ONAYLANDI faturalar dahil!
    //    - ACIK faturalar henüz stoktan düşmemiş, cari hesaba eklenmemiş
    //    - ONAYLANDI faturalar stok ve cari işlemi yapılmış, ödemeye hazır
    const acikFaturalar = await tx.fatura.findMany({
      where: {
        cariId,
        faturaTipi: {
          in: [faturaTipi, `${faturaTipi}_IADE`], // Normal ve iade faturaları
        },
        durum: 'ONAYLANDI', // Sadece ONAYLANDI faturalar (stok ve cari işlemi yapılmış)
        odenecekTutar: {
          gt: 0.01, // Kalan borcu olanlar (0.01 TL tolerans)
        },
        deletedAt: null,
      },
      orderBy: [
        { tarih: 'asc' }, // FIFO: En eski fatura önce
        { createdAt: 'asc' },
      ],
    });

    if (acikFaturalar.length === 0) {
      // Açık fatura yok, tahsilat genel olarak uygulandı
      return;
    }

    // 2. Tahsilat tutarını FIFO mantığıyla faturalara dağıt
    let kalanTutar = tutar;

    for (const fatura of acikFaturalar) {
      if (kalanTutar <= 0) break;

      // Faturanın kalan tutarını hesapla
      const faturaGenelToplam = fatura.genelToplam.toNumber();
      const faturaOdenenTutar = fatura.odenenTutar?.toNumber() || 0;
      const faturaKalanTutar = faturaGenelToplam - faturaOdenenTutar;

      if (faturaKalanTutar <= 0) continue;

      // Bu faturaya ne kadar ödenecek?
      const odenecekTutar = Math.min(kalanTutar, faturaKalanTutar);

      // 3. FaturaTahsilat kaydı oluştur
      await tx.faturaTahsilat.create({
        data: {
          faturaId: fatura.id,
          tahsilatId: tahsilatId,
          tutar: odenecekTutar,
        },
      });

      // 4. Fatura odenen tutarını güncelle
      const yeniOdenenTutar = faturaOdenenTutar + odenecekTutar;
      const yeniKalanTutar = faturaGenelToplam - yeniOdenenTutar;

      // 5. Fatura durumunu güncelle
      // ⚠️ ÖNEMLİ: ONAYLANDI durumunu koru, sadece TAM KAPANDIĞINDA değiştir
      let yeniDurum = fatura.durum;

      if (yeniKalanTutar <= 0.01) {
        // Tam kapandı (0.01 TL tolerans) - Her durumdan KAPALI'ya geç
        yeniDurum = 'KAPALI';
      } else if (fatura.durum === 'ONAYLANDI') {
        // ONAYLANDI durumunu koru (kısmen ödense de)
        yeniDurum = 'ONAYLANDI';
      } else if (yeniOdenenTutar > 0) {
        // Diğer durumlarda (ACIK vb.) kısmen ödendi yap
        yeniDurum = 'KISMEN_ODENDI';
      }

      await tx.fatura.update({
        where: { id: fatura.id },
        data: {
          odenenTutar: yeniOdenenTutar,
          odenecekTutar: yeniKalanTutar,
          durum: yeniDurum,
          updatedAt: new Date(),
        },
      });

      // Kalan tutarı azalt
      kalanTutar -= odenecekTutar;
    }

    // Eğer hala kalan tutar varsa, tüm faturalar kapanmış demektir
    // Bu tutar genel tahsilat/ödeme olarak kalır
  }
}
