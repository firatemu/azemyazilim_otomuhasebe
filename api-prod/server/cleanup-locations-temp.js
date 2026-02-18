const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔥 Tüm Location kayıtları siliniyor...');
  
  const result = await prisma.location.deleteMany({});
  
  console.log(`✅ ${result.count} adet raf/koridor/sütun/bölme kaydı silindi!`);
  console.log('✅ Depo kayıtları korundu.');
  console.log('🎯 Tekrar test edebilirsiniz!');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

