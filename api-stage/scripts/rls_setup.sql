-- =============================================================================
-- POSTGRESQL ROW LEVEL SECURITY (RLS) SETUP
-- =============================================================================
-- Bu script, veritabanı seviyesinde izolasyon sağlar.
-- Uygulama her sorgudan önce "app.current_tenant" değişkenini set etmelidir.
-- Örnek: SET app.current_tenant = 'tenant_uuid';

-- 1. Yardımcı Fonksiyon: Mevcut Tenant ID'yi getir
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS text AS $$
BEGIN
    RETURN current_setting('app.current_tenant', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Tenant Tablosu Koruması (Herkes kendi tenant'ını görebilir)
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_policy" ON "tenants"
    USING (id = current_tenant_id() OR current_setting('app.current_user_role', true) = 'SUPER_ADMIN');

-- 3. Kritik Tablolar için RLS Aktivasyonu

-- USERS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_isolation" ON "users"
    USING (
        "tenantId" = current_tenant_id() 
        OR "tenantId" IS NULL -- Super Admin veya System User
    );

-- FATURALAR
ALTER TABLE "fatura" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fatura_isolation" ON "fatura"
    USING ("tenantId" = current_tenant_id());

-- CARİLER
ALTER TABLE "cariler" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cari_isolation" ON "cariler"
    USING ("tenantId" = current_tenant_id());

-- STOKLAR
ALTER TABLE "stoklar" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stok_isolation" ON "stoklar"
    USING ("tenantId" = current_tenant_id());

-- SİPARİŞLER
ALTER TABLE "siparisler" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "siparis_isolation" ON "siparisler"
    USING ("tenantId" = current_tenant_id());

-- LOGLAR (Audit Log)
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_isolation" ON "audit_logs"
    USING ("tenantId" = current_tenant_id());

-- =============================================================================
-- NOTLAR:
-- 1. Bu scripti çalıştırmadan önce uygulamanızın DB bağlantı koduna (Middleware)
--    şu satırı eklemelisiniz:
--    await prisma.$executeRaw`SET app.current_tenant = ${tenantId}`;
--    
-- 2. Super Admin işlemleri için:
--    await prisma.$executeRaw`SET app.current_user_role = 'SUPER_ADMIN'`;
-- =============================================================================
