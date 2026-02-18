const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 GIN İndeksleri Uygulanıyor...');
    try {
        // AuditLog metadata index
        await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "audit_logs_metadata_gin_idx" 
      ON "audit_logs" USING GIN ("metadata" jsonb_path_ops);
    `);
        console.log('✅ AuditLog (metadata) GIN index oluşturuldu.');

        // TenantSettings features index
        await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "tenant_settings_features_gin_idx" 
      ON "tenant_settings" USING GIN ("features" jsonb_path_ops);
    `);
        console.log('✅ TenantSettings (features) GIN index oluşturuldu.');

    } catch (e) {
        console.error('❌ Hata:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
