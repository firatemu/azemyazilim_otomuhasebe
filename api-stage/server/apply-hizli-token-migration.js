#!/usr/bin/env node

/**
 * HizliToken Migration Uygulama Script'i
 * Bu script hizli_tokens tablosunu oluşturur
 */

// .env dosyasını yükle
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyMigration() {
  console.log('🚀 HizliToken migration uygulanıyor...\n');

  try {
    // Tablo zaten var mı kontrol et
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'hizli_tokens'
      );
    `;

    if (tableExists[0]?.exists) {
      console.log('⚠️  hizli_tokens tablosu zaten mevcut!');
      console.log('✅ Migration gerekmiyor.\n');
      return;
    }

    console.log('📝 hizli_tokens tablosu oluşturuluyor...\n');

    // Tabloyu oluştur
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "hizli_tokens" (
        "id" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "encryptedUsername" TEXT NOT NULL,
        "encryptedPassword" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "hizli_tokens_pkey" PRIMARY KEY ("id")
      );
    `;

    console.log('✅ Tablo oluşturuldu!');

    // Index'leri oluştur
    console.log('📊 Index\'ler oluşturuluyor...\n');

    try {
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "hizli_tokens_token_key" ON "hizli_tokens"("token");
      `;
      console.log('✅ Unique index oluşturuldu: hizli_tokens_token_key');
    } catch (e) {
      console.log('⚠️  Unique index zaten mevcut veya oluşturulamadı:', e.message);
    }

    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "hizli_tokens_expiresAt_idx" ON "hizli_tokens"("expiresAt");
      `;
      console.log('✅ Index oluşturuldu: hizli_tokens_expiresAt_idx');
    } catch (e) {
      console.log('⚠️  Index zaten mevcut veya oluşturulamadı:', e.message);
    }

    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "hizli_tokens_token_idx" ON "hizli_tokens"("token");
      `;
      console.log('✅ Index oluşturuldu: hizli_tokens_token_idx');
    } catch (e) {
      console.log('⚠️  Index zaten mevcut veya oluşturulamadı:', e.message);
    }

    console.log('\n✅ Migration başarıyla uygulandı!');
    console.log('📋 Tablo bilgileri:');
    
    const tableInfo = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'hizli_tokens'
      ORDER BY ordinal_position;
    `;

    console.table(tableInfo);

  } catch (error) {
    console.error('❌ Migration hatası:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
applyMigration()
  .then(() => {
    console.log('\n🎉 Tüm işlemler tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  });

