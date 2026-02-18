const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Migration uygulanıyor...');
  try {
    // Önce tablo adını kontrol et
    const tables = await prisma.$queryRawUnsafe(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%stok%';`);
    console.log('📋 Bulunan tablolar:', JSON.stringify(tables, null, 2));
    
    // "stoklar" tablosuna ekle (Prisma schema'da @@map ile)
    const result = await prisma.$executeRawUnsafe('ALTER TABLE "stoklar" ADD COLUMN IF NOT EXISTS "tedarikciKodu" TEXT;');
    console.log('✅ Migration başarıyla uygulandı!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Migration hatası:', error.message);
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('ℹ️  Kolon zaten mevcut, sorun yok.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
