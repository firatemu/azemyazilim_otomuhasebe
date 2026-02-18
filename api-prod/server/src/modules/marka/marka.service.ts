import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class MarkaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tüm markaları getir (stoklardan unique markalar)
   * Her marka için ürün sayısını say (placeholder kayıtları hariç)
   * Placeholder kayıtları da listeye dahil edilir (ürün sayısı 0 olarak)
   */
  async findAll() {
    // Stoklardan tüm unique markaları getir (null olmayanlar)
    const stoklar = await this.prisma.stok.findMany({
      where: {
        marka: {
          not: null,
        },
      },
      select: {
        marka: true,
        stokAdi: true,
      },
    });

    // Tüm unique markaları topla (placeholder dahil)
    const allMarkalar = new Set<string>();
    // Gerçek ürün sayısını say (placeholder hariç)
    const markaMap = new Map<string, number>();

    stoklar.forEach((stok) => {
      if (stok.marka) {
        // Tüm markaları topla (placeholder dahil)
        allMarkalar.add(stok.marka);

        // Placeholder kayıtları sayma (sadece marka tanımı için olan kayıtlar)
        const isPlaceholder = stok.stokAdi?.includes('[Marka Tanımı]') || false;

        if (!isPlaceholder) {
          // Sadece gerçek ürünleri say
          const count = markaMap.get(stok.marka) || 0;
          markaMap.set(stok.marka, count + 1);
        }
      }
    });

    // Tüm markaları array'e çevir (placeholder dahil)
    // Placeholder olan markalar için urunSayisi: 0, gerçek ürünleri olanlar için gerçek sayı
    const markalar = Array.from(allMarkalar)
      .map((markaAdi) => ({
        markaAdi,
        urunSayisi: markaMap.get(markaAdi) || 0,
      }))
      .sort((a, b) => a.markaAdi.localeCompare(b.markaAdi, 'tr'));

    // Debug: Marka sayısını logla
    console.log(`[MarkaService] findAll: ${markalar.length} marka bulundu`);
    if (markalar.length > 0) {
      console.log(
        `[MarkaService] İlk 5 marka:`,
        markalar.slice(0, 5).map((m) => `${m.markaAdi} (${m.urunSayisi} ürün)`),
      );
    }

    return markalar;
  }

  /**
   * Belirli bir markayı getir (ürün sayısı ile)
   */
  async findOne(markaAdi: string) {
    // URL decode
    const decodedMarkaAdi = decodeURIComponent(markaAdi);

    // Placeholder kayıtları hariç ürün sayısını say
    const urunSayisi = await this.prisma.stok.count({
      where: {
        marka: decodedMarkaAdi,
        stokAdi: {
          not: {
            contains: '[Marka Tanımı]',
          },
        },
      },
    });

    // Toplam stok sayısını kontrol et (marka var mı)
    const toplamStokSayisi = await this.prisma.stok.count({
      where: {
        marka: decodedMarkaAdi,
      },
    });

    if (toplamStokSayisi === 0) {
      throw new NotFoundException(`Marka bulunamadı: ${decodedMarkaAdi}`);
    }

    return {
      markaAdi: decodedMarkaAdi,
      urunSayisi,
    };
  }

  /**
   * Yeni marka ekle - Placeholder stok kaydı oluştur
   */
  async create(markaAdi: string) {
    if (!markaAdi || !markaAdi.trim()) {
      throw new BadRequestException('Marka adı gereklidir');
    }

    const trimmedMarkaAdi = markaAdi.trim();

    // Bu marka zaten var mı kontrol et
    const existingStok = await this.prisma.stok.findFirst({
      where: {
        marka: trimmedMarkaAdi,
      },
    });

    if (existingStok) {
      throw new BadRequestException(`Marka "${trimmedMarkaAdi}" zaten mevcut`);
    }

    // Marka tanımı için placeholder stok kaydı oluştur
    const timestamp = Date.now().toString().slice(-6);
    const stokKodu = `MRK-${trimmedMarkaAdi.substring(0, 3).toUpperCase()}-${timestamp}`;

    try {
      const stok = await this.prisma.stok.create({
        data: {
          stokKodu,
          stokAdi: `[Marka Tanımı] ${trimmedMarkaAdi}`,
          birim: 'Adet',
          alisFiyati: 0,
          satisFiyati: 0,
          marka: trimmedMarkaAdi,
          aciklama: 'Bu kayıt sadece marka tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
        },
      });

      return {
        message: `Marka "${trimmedMarkaAdi}" başarıyla eklendi`,
        markaAdi: trimmedMarkaAdi,
        stokKodu: stok.stokKodu,
      };
    } catch (error: any) {
      // Eğer stok kodu zaten varsa, farklı bir kod dene
      if (error.code === 'P2002' && error.meta?.target?.includes('stokKodu')) {
        const timestamp = Date.now().toString();
        const retryStokKodu = `MRK-${trimmedMarkaAdi.substring(0, 3).toUpperCase()}-${timestamp}`;

        const stok = await this.prisma.stok.create({
          data: {
            stokKodu: retryStokKodu,
            stokAdi: `[Marka Tanımı] ${trimmedMarkaAdi}`,
            birim: 'Adet',
            alisFiyati: 0,
            satisFiyati: 0,
            marka: trimmedMarkaAdi,
            aciklama: 'Bu kayıt sadece marka tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
          },
        });

        return {
          message: `Marka "${trimmedMarkaAdi}" başarıyla eklendi`,
          markaAdi: trimmedMarkaAdi,
          stokKodu: stok.stokKodu,
        };
      }

      throw new BadRequestException(
        error?.message || 'Marka eklenirken bir hata oluştu',
      );
    }
  }

  /**
   * Markayı güncelle - Marka adını değiştir
   * O markayı kullanan tüm stoklardaki marka adını güncelle
   */
  async update(markaAdi: string, yeniMarkaAdi: string) {
    // URL decode
    const decodedMarkaAdi = decodeURIComponent(markaAdi);
    const decodedYeniMarkaAdi = decodeURIComponent(yeniMarkaAdi);

    // Eğer yeni marka adı aynıysa, hata fırlat
    if (decodedMarkaAdi === decodedYeniMarkaAdi) {
      throw new BadRequestException(
        'Yeni marka adı mevcut marka adı ile aynı olamaz',
      );
    }

    // Eski markayı kullanan stokları kontrol et
    const stokSayisi = await this.prisma.stok.count({
      where: {
        marka: decodedMarkaAdi,
      },
    });

    if (stokSayisi === 0) {
      throw new NotFoundException(`Marka bulunamadı: ${decodedMarkaAdi}`);
    }

    // Yeni marka adının zaten kullanılıp kullanılmadığını kontrol et
    const yeniMarkaStokSayisi = await this.prisma.stok.count({
      where: {
        marka: decodedYeniMarkaAdi,
      },
    });

    if (yeniMarkaStokSayisi > 0) {
      throw new BadRequestException(
        `Marka adı "${decodedYeniMarkaAdi}" zaten kullanılıyor`,
      );
    }

    // O markayı kullanan tüm stoklardaki marka adını güncelle
    await this.prisma.stok.updateMany({
      where: {
        marka: decodedMarkaAdi,
      },
      data: {
        marka: decodedYeniMarkaAdi,
      },
    });

    return {
      message: `Marka "${decodedMarkaAdi}" başarıyla "${decodedYeniMarkaAdi}" olarak güncellendi`,
      eskiMarkaAdi: decodedMarkaAdi,
      yeniMarkaAdi: decodedYeniMarkaAdi,
      etkilenenUrunSayisi: stokSayisi,
    };
  }

  /**
   * Markayı sil - Sadece ürünü olmayan markalar silinebilir
   * Eğer bir markaya ait 1 tane bile ürün varsa, o marka silinemez
   */
  async remove(markaAdi: string) {
    // URL decode
    const decodedMarkaAdi = decodeURIComponent(markaAdi);

    // Markayı kullanan stokları kontrol et
    const stokSayisi = await this.prisma.stok.count({
      where: {
        marka: decodedMarkaAdi,
        // Placeholder kayıtları sayma (sadece marka tanımı için olan kayıtlar)
        stokAdi: {
          not: {
            contains: '[Marka Tanımı]',
          },
        },
      },
    });

    // Eğer marka bulunamazsa
    const toplamStokSayisi = await this.prisma.stok.count({
      where: {
        marka: decodedMarkaAdi,
      },
    });

    if (toplamStokSayisi === 0) {
      throw new NotFoundException(`Marka bulunamadı: ${decodedMarkaAdi}`);
    }

    // Eğer markaya ait gerçek ürün varsa (placeholder hariç), silme yapılamaz
    if (stokSayisi > 0) {
      throw new BadRequestException(
        `Bu markaya ait ${stokSayisi} ürün bulunmaktadır. Ürünü olan markalar silinemez. Önce ürünlerden markayı kaldırmanız veya ürünleri silmeniz gerekmektedir.`,
      );
    }

    // Sadece placeholder kayıtlar varsa, onları sil
    // Placeholder kayıtları bul ve sil
    const placeholderKayitlar = await this.prisma.stok.findMany({
      where: {
        marka: decodedMarkaAdi,
        stokAdi: {
          contains: '[Marka Tanımı]',
        },
      },
    });

    // Placeholder kayıtları sil
    if (placeholderKayitlar.length > 0) {
      await this.prisma.stok.deleteMany({
        where: {
          id: {
            in: placeholderKayitlar.map((k) => k.id),
          },
        },
      });
    }

    return {
      message: `Marka "${decodedMarkaAdi}" başarıyla silindi`,
      markaAdi: decodedMarkaAdi,
      silinenPlaceholderSayisi: placeholderKayitlar.length,
    };
  }
}
