const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupStoklar() {
  try {
    console.log('🧹 STOK KAYITLARI TEMİZLENİYOR...\n');
    console.log('⚠️  UYARI: Bu işlem geri alınamaz!\n');

    // Stok kayıtlarını sil (cascade delete ile ilişkili kayıtlar da silinecek)
    const deletedCount = await prisma.stok.deleteMany({});
    
    console.log(`✅ ${deletedCount.count} stok kaydı silindi.`);
    console.log('✅ Stok temizleme işlemi tamamlandı!\n');
  } catch (error) {
    console.error('\n❌ Stok temizleme hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupStoklar()
  .then(() => {
    console.log('✅ İşlem başarıyla tamamlandı.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ İşlem sırasında hata oluştu:', error);
    process.exit(1);
  });

