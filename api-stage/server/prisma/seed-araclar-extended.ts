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

async function seedAraclarExtended() {
  try {
    console.log('🚗 Araç verileri temizleniyor ve yükleniyor...\n');

    // Önce tüm eski araç verilerini sil
    console.log('🗑️  Eski araç verileri siliniyor...');
    const deletedCount = await prisma.arac.deleteMany({});
    console.log(`   ✅ ${deletedCount.count} eski araç kaydı silindi.\n`);

    // JSON dosyasını oku
    const jsonPath = path.join(__dirname, '../../cars_prisma_full_models_extended.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`JSON dosyası bulunamadı: ${jsonPath}`);
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const araclar: AracData[] = JSON.parse(jsonData);

    console.log(`📊 Toplam ${araclar.length} araç verisi bulundu.\n`);

    // Verileri Prisma formatına dönüştür
    console.log('📥 Araç verileri ekleniyor...');
    const aracData = araclar.map((arac) => ({
      marka: arac.brand,
      model: arac.model,
      motorHacmi: arac.engine_capacity,
      yakitTipi: arac.fuel_type,
    }));

    // Toplu olarak ekle (createMany kullanarak daha hızlı)
    try {
      const result = await prisma.arac.createMany({
        data: aracData,
        skipDuplicates: true, // Aynı kayıtları atla (unique constraint)
      });
      
      console.log(`   ✅ ${result.count} araç başarıyla eklendi\n`);
    } catch (error: any) {
      console.error('❌ Toplu ekleme hatası:', error.message);
      throw error;
    }

    // İstatistikler
    const toplamArac = await prisma.arac.count();
    console.log(`📈 Veritabanındaki toplam araç sayısı: ${toplamArac}\n`);

    const markalar = await prisma.arac.groupBy({
      by: ['marka'],
      _count: {
        marka: true,
      },
      orderBy: {
        marka: 'asc',
      },
    });

    console.log('📈 Marka İstatistikleri (İlk 20):');
    markalar.slice(0, 20).forEach((marka) => {
      console.log(`   • ${marka.marka}: ${marka._count.marka} model`);
    });
    if (markalar.length > 20) {
      console.log(`   ... ve ${markalar.length - 20} marka daha`);
    }

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

seedAraclarExtended()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
