import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface AracData {
  brand: string;
  model: string;
  engine_capacity: string;
  fuel_type: string;
}

async function seedAraclar() {
  try {
    console.log('🚗 Araç verileri yükleniyor...\n');

    // JSON dosyasını oku
    const jsonPath = path.join(__dirname, '../../cars_prisma_full.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const araclar: AracData[] = JSON.parse(jsonData);

    console.log(`📊 Toplam ${araclar.length} araç verisi bulundu.\n`);

    let eklenenSayisi = 0;
    let mevcutSayisi = 0;
    let hataSayisi = 0;

    // Her araç için veritabanına ekleme işlemi
    for (const arac of araclar) {
      try {
        // Aynı araç zaten var mı kontrol et
        const existingArac = await prisma.arac.findFirst({
          where: {
            brand: arac.brand,
            model: arac.model,
            motorHacmi: arac.engine_capacity,
            yakitTipi: arac.fuel_type,
          },
        });

        if (existingArac) {
          console.log(`  ⏭️  ${arac.brand} ${arac.model} (${arac.engine_capacity}, ${arac.fuel_type}) zaten mevcut, atlanıyor...`);
          mevcutSayisi++;
          continue;
        }

        // Yeni araç ekle
        await prisma.arac.create({
          data: {
            brand: arac.brand,
            model: arac.model,
            motorHacmi: arac.engine_capacity,
            yakitTipi: arac.fuel_type,
          },
        });

        console.log(`  ✅ ${arac.brand} ${arac.model} (${arac.engine_capacity}, ${arac.fuel_type}) eklendi`);
        eklenenSayisi++;
      } catch (error: any) {
        console.error(`  ❌ ${arac.brand} ${arac.model} eklenirken hata:`, error.message);
        hataSayisi++;
      }
    }

    console.log('\n✅ Araç verileri ekleme işlemi tamamlandı!');
    console.log(`   📊 Eklenen: ${eklenenSayisi} araç`);
    console.log(`   📊 Mevcut: ${mevcutSayisi} araç`);
    console.log(`   📊 Hata: ${hataSayisi} araç`);
    console.log(`   📊 Toplam: ${eklenenSayisi + mevcutSayisi} araç\n`);

    // İstatistikler
    const markalar = await prisma.arac.groupBy({
      by: ['brand'],
      _count: {
        brand: true,
      },
      orderBy: {
        brand: 'asc',
      },
    });

    console.log('📈 Marka İstatistikleri:');
    markalar.forEach((brand) => {
      console.log(`   • ${brand.brand}: ${brand._count.brand} model`);
    });

    const yakitTipleri = await prisma.arac.groupBy({
      by: ['yakitTipi'],
      _count: {
        yakitTipi: true,
      },
      orderBy: {
        yakitTipi: 'asc',
      },
    });

    console.log('\n⛽ Yakıt Tipi İstatistikleri:');
    yakitTipleri.forEach((yakit) => {
      console.log(`   • ${yakit.yakitTipi}: ${yakit._count.yakitTipi} araç`);
    });
  } catch (error) {
    console.error('❌ Araç verileri yüklenirken hata oluştu:', error);
    throw error;
  }
}

seedAraclar()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

