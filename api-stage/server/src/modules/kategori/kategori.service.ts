import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class KategoriService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tüm kategorileri getir (stoklardan unique kategoriler)
   * Ana kategorilere göre grupla ve alt kategorileri listele
   */
  async findAll() {
    // Stoklardan tüm unique ana kategorileri getir (null olmayanlar)
    const stoklar = await this.prisma.stok.findMany({
      where: {
        anaKategori: {
          not: null,
        },
      },
      select: {
        anaKategori: true,
        altKategori: true,
      },
    });

    // Ana kategorilere göre grupla
    const kategoriMap = new Map<string, Set<string>>();

    stoklar.forEach((stok) => {
      if (stok.anaKategori) {
        if (!kategoriMap.has(stok.anaKategori)) {
          kategoriMap.set(stok.anaKategori, new Set<string>());
        }

        // Alt kategori varsa ekle
        if (stok.altKategori) {
          kategoriMap.get(stok.anaKategori)!.add(stok.altKategori);
        }
      }
    });

    // Map'i array'e çevir ve sırala
    const kategoriler = Array.from(kategoriMap.entries())
      .map(([anaKategori, altKategoriSet]) => ({
        anaKategori,
        altKategoriler: Array.from(altKategoriSet).sort((a, b) =>
          a.localeCompare(b, 'tr'),
        ),
      }))
      .sort((a, b) => a.anaKategori.localeCompare(b.anaKategori, 'tr'));

    // Debug: Kategori sayısını logla
    console.log(
      `[KategoriService] findAll: ${kategoriler.length} kategori bulundu`,
    );
    if (kategoriler.length > 0) {
      console.log(
        `[KategoriService] İlk 3 kategori:`,
        kategoriler
          .slice(0, 3)
          .map(
            (k) => `${k.anaKategori} (${k.altKategoriler.length} alt kategori)`,
          ),
      );
    } else {
      console.log(
        `[KategoriService] Veritabanında hiç kategori yok. Toplam stok kaydı: ${stoklar.length}`,
      );
    }

    return kategoriler;
  }

  /**
   * Belirli bir ana kategoriye ait alt kategorileri getir
   */
  async findAltKategoriler(anaKategori: string) {
    // URL decode
    const decodedAnaKategori = decodeURIComponent(anaKategori);

    const stoklar = await this.prisma.stok.findMany({
      where: {
        anaKategori: decodedAnaKategori,
        altKategori: {
          not: null,
        },
      },
      select: {
        altKategori: true,
      },
      distinct: ['altKategori'],
    });

    const altKategoriler = stoklar
      .map((stok) => stok.altKategori!)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'tr'));

    return {
      anaKategori: decodedAnaKategori,
      altKategoriler,
    };
  }

  /**
   * Ana kategoriye alt kategori ekle
   * Not: Kategoriler stoklardan geldiği için, yeni kategori eklemek için
   * bir placeholder stok kaydı oluşturmak gerekiyor.
   * Bu placeholder kayıt, sadece kategori tanımı için kullanılır ve
   * gerçek bir stok kaydı olarak kullanılmaz.
   */
  async addAltKategori(anaKategori: string, altKategori: string) {
    // URL decode
    const decodedAnaKategori = decodeURIComponent(anaKategori);
    const decodedAltKategori = decodeURIComponent(altKategori);

    // Bu ana kategori ve alt kategori kombinasyonunun zaten var olup olmadığını kontrol et
    const existingStok = await this.prisma.stok.findFirst({
      where: {
        anaKategori: decodedAnaKategori,
        altKategori: decodedAltKategori,
      },
    });

    if (existingStok) {
      return {
        message: `Bu alt kategori zaten mevcut: ${decodedAltKategori}`,
        anaKategori: decodedAnaKategori,
        altKategori: decodedAltKategori,
        mevcut: true,
      };
    }

    // Ana kategori için bir stok kaydı var mı kontrol et
    // Eğer yoksa, ana kategoriyi de oluşturmak için bir placeholder stok kaydı oluştur
    const anaKategoriStok = await this.prisma.stok.findFirst({
      where: {
        anaKategori: decodedAnaKategori,
      },
    });

    // Kategori tanımı için placeholder stok kaydı oluştur
    // Bu kayıt sadece kategori tanımı için kullanılır
    // Stok kodu otomatik oluşturulacak
    try {
      // CodeTemplateService'i kullanarak stok kodu oluştur
      // Ancak bu service'e bağımlılık yaratmak yerine, manuel bir kod oluşturalım
      // Format: KAT-{anaKategori}-{altKategori}-{timestamp}
      const timestamp = Date.now().toString().slice(-6);
      const stokKodu = `KAT-${decodedAnaKategori.substring(0, 3).toUpperCase()}-${decodedAltKategori.substring(0, 3).toUpperCase()}-${timestamp}`;

      // Placeholder stok kaydı oluştur
      await this.prisma.stok.create({
        data: {
          stokKodu,
          stokAdi: `[Kategori Tanımı] ${decodedAnaKategori} - ${decodedAltKategori}`,
          birim: 'Adet',
          alisFiyati: 0,
          satisFiyati: 0,
          anaKategori: decodedAnaKategori,
          altKategori: decodedAltKategori,
          aciklama:
            'Bu kayıt sadece kategori tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
        },
      });

      return {
        message: `Alt kategori "${decodedAltKategori}" ana kategori "${decodedAnaKategori}" altına başarıyla eklendi`,
        anaKategori: decodedAnaKategori,
        altKategori: decodedAltKategori,
        mevcut: false,
      };
    } catch (error: any) {
      // Eğer stok kodu zaten varsa, farklı bir kod dene
      if (error.code === 'P2002' && error.meta?.target?.includes('stokKodu')) {
        // Tekrar dene - farklı bir timestamp ile
        const timestamp = Date.now().toString();
        const stokKodu = `KAT-${decodedAnaKategori.substring(0, 3).toUpperCase()}-${decodedAltKategori.substring(0, 3).toUpperCase()}-${timestamp}`;

        await this.prisma.stok.create({
          data: {
            stokKodu,
            stokAdi: `[Kategori Tanımı] ${decodedAnaKategori} - ${decodedAltKategori}`,
            birim: 'Adet',
            alisFiyati: 0,
            satisFiyati: 0,
            anaKategori: decodedAnaKategori,
            altKategori: decodedAltKategori,
            aciklama:
              'Bu kayıt sadece kategori tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
          },
        });

        return {
          message: `Alt kategori "${decodedAltKategori}" ana kategori "${decodedAnaKategori}" altına başarıyla eklendi`,
          anaKategori: decodedAnaKategori,
          altKategori: decodedAltKategori,
          mevcut: false,
        };
      }

      throw new BadRequestException(
        `Alt kategori eklenirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  /**
   * Ana kategori ekle
   * Not: Kategoriler stoklardan geldiği için, yeni ana kategori eklemek için
   * bir placeholder stok kaydı oluşturmak gerekiyor.
   * Bu placeholder kayıt, sadece kategori tanımı için kullanılır ve
   * gerçek bir stok kaydı olarak kullanılmaz.
   */
  async addAnaKategori(anaKategori: string) {
    const decodedAnaKategori = decodeURIComponent(anaKategori);

    // Bu ana kategori zaten var mı kontrol et
    const existingStok = await this.prisma.stok.findFirst({
      where: {
        anaKategori: decodedAnaKategori,
      },
    });

    if (existingStok) {
      throw new BadRequestException(
        `Bu ana kategori zaten mevcut: ${decodedAnaKategori}`,
      );
    }

    // Ana kategori tanımı için placeholder stok kaydı oluştur
    // Bu kayıt sadece kategori tanımı için kullanılır
    // Stok kodu otomatik oluşturulacak
    try {
      // Format: KAT-{anaKategori}-{timestamp}
      const timestamp = Date.now().toString().slice(-6);
      const stokKodu = `KAT-${decodedAnaKategori.substring(0, 3).toUpperCase()}-${timestamp}`;

      // Placeholder stok kaydı oluştur (alt kategori olmadan)
      await this.prisma.stok.create({
        data: {
          stokKodu,
          stokAdi: `[Ana Kategori Tanımı] ${decodedAnaKategori}`,
          birim: 'Adet',
          alisFiyati: 0,
          satisFiyati: 0,
          anaKategori: decodedAnaKategori,
          altKategori: null,
          aciklama:
            'Bu kayıt sadece ana kategori tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
        },
      });

      return {
        message: `Ana kategori "${decodedAnaKategori}" başarıyla eklendi`,
        anaKategori: decodedAnaKategori,
        mevcut: false,
      };
    } catch (error: any) {
      // Eğer stok kodu zaten varsa, farklı bir kod dene
      if (error.code === 'P2002' && error.meta?.target?.includes('stokKodu')) {
        // Tekrar dene - farklı bir timestamp ile
        const timestamp = Date.now().toString();
        const stokKodu = `KAT-${decodedAnaKategori.substring(0, 3).toUpperCase()}-${timestamp}`;

        await this.prisma.stok.create({
          data: {
            stokKodu,
            stokAdi: `[Ana Kategori Tanımı] ${decodedAnaKategori}`,
            birim: 'Adet',
            alisFiyati: 0,
            satisFiyati: 0,
            anaKategori: decodedAnaKategori,
            altKategori: null,
            aciklama:
              'Bu kayıt sadece ana kategori tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
          },
        });

        return {
          message: `Ana kategori "${decodedAnaKategori}" başarıyla eklendi`,
          anaKategori: decodedAnaKategori,
          mevcut: false,
        };
      }

      throw new BadRequestException(
        `Ana kategori eklenirken bir hata oluştu: ${error.message}`,
      );
    }
  }

  /**
   * Alt kategoriyi sil - o alt kategoriyi kullanan tüm stoklardan alt kategoriyi kaldır
   */
  async removeAltKategori(anaKategori: string, altKategori: string) {
    // URL decode
    const decodedAnaKategori = decodeURIComponent(anaKategori);
    const decodedAltKategori = decodeURIComponent(altKategori);

    // Bu alt kategoriyi kullanan stokları kontrol et
    const stokSayisi = await this.prisma.stok.count({
      where: {
        anaKategori: decodedAnaKategori,
        altKategori: decodedAltKategori,
      },
    });

    if (stokSayisi === 0) {
      throw new NotFoundException(
        `Alt kategori bulunamadı: ${decodedAltKategori}`,
      );
    }

    // O alt kategoriyi kullanan tüm stoklardan alt kategoriyi kaldır (null yap)
    await this.prisma.stok.updateMany({
      where: {
        anaKategori: decodedAnaKategori,
        altKategori: decodedAltKategori,
      },
      data: {
        altKategori: null,
      },
    });

    return {
      message: `Alt kategori "${decodedAltKategori}" başarıyla silindi ve ${stokSayisi} üründen kaldırıldı`,
      anaKategori: decodedAnaKategori,
      altKategori: decodedAltKategori,
      etkilenenUrunSayisi: stokSayisi,
    };
  }

  /**
   * Ana kategoriyi sil - o ana kategoriyi kullanan tüm stoklardan ana kategoriyi kaldır
   */
  async removeAnaKategori(anaKategori: string) {
    // URL decode
    const decodedAnaKategori = decodeURIComponent(anaKategori);

    // Bu ana kategoriyi kullanan stokları kontrol et
    const stokSayisi = await this.prisma.stok.count({
      where: {
        anaKategori: decodedAnaKategori,
      },
    });

    if (stokSayisi === 0) {
      throw new NotFoundException(
        `Ana kategori bulunamadı: ${decodedAnaKategori}`,
      );
    }

    // O ana kategoriyi kullanan tüm stoklardan ana kategoriyi ve alt kategoriyi kaldır (null yap)
    await this.prisma.stok.updateMany({
      where: {
        anaKategori: decodedAnaKategori,
      },
      data: {
        anaKategori: null,
        altKategori: null,
      },
    });

    return {
      message: `Ana kategori "${decodedAnaKategori}" başarıyla silindi ve ${stokSayisi} üründen kaldırıldı`,
      anaKategori: decodedAnaKategori,
      etkilenenUrunSayisi: stokSayisi,
    };
  }
}
