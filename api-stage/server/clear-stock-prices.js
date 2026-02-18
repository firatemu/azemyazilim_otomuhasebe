const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearStockPrices() {
  try {
    console.log('🧹 Stok satın alma ve satış fiyatları temizleniyor...');

    const result = await prisma.stok.updateMany({
      data: {
        alisFiyati: 0,
        satisFiyati: 0,
      },
    });

    console.log(`✅ ${result.count} stok kaydının fiyat bilgileri sıfırlandı.`);
  } catch (error) {
    console.error('❌ Fiyat temizleme sırasında hata oluştu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearStockPrices()
  .then(() => {
    console.log('🎉 İşlem tamamlandı.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script hatası:', error);
    process.exit(1);
  });


