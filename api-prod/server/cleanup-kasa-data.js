const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Kasa verilerini temizleniyor...');

  try {
    // Tahsilat kayıtlarını sil
    await prisma.tahsilat.deleteMany({});
    console.log('✓ Tahsilat kayıtları silindi');

    // Kasa hareketlerini sil
    await prisma.kasaHareket.deleteMany({});
    console.log('✓ Kasa hareketleri silindi');

    // Kasaları sil
    await prisma.kasa.deleteMany({});
    console.log('✓ Kasalar silindi');

    // Banka havale kayıtlarını sil (varsa)
    try {
      await prisma.bankaHavale.deleteMany({});
      console.log('✓ Banka havale kayıtları silindi');
    } catch (e) {
      console.log('- Banka havale tablosu yok veya boş');
    }

    // Çek senet kayıtlarını sil (varsa)
    try {
      await prisma.cekSenet.deleteMany({});
      console.log('✓ Çek senet kayıtları silindi');
    } catch (e) {
      console.log('- Çek senet tablosu yok veya boş');
    }

    console.log('✅ Temizlik tamamlandı!');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();

