-- Add tenantId columns to all business models
-- This migration adds tenantId support for multi-tenant isolation

-- Stok
ALTER TABLE "stoklar" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_idx" ON "stoklar"("tenantId");
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_stokKodu_idx" ON "stoklar"("tenantId", "stokKodu");
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_barkod_idx" ON "stoklar"("tenantId", "barkod");
ALTER TABLE "stoklar" DROP CONSTRAINT IF EXISTS "stoklar_stokKodu_key";
ALTER TABLE "stoklar" DROP CONSTRAINT IF EXISTS "stoklar_barkod_key";
CREATE UNIQUE INDEX IF NOT EXISTS "stoklar_stokKodu_tenantId_key" ON "stoklar"("stokKodu", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "stoklar_barkod_tenantId_key" ON "stoklar"("barkod", "tenantId") WHERE "barkod" IS NOT NULL;
ALTER TABLE "stoklar" ADD CONSTRAINT "stoklar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Cari
ALTER TABLE "cariler" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "cariler_tenantId_idx" ON "cariler"("tenantId");
CREATE INDEX IF NOT EXISTS "cariler_tenantId_cariKodu_idx" ON "cariler"("tenantId", "cariKodu");
ALTER TABLE "cariler" DROP CONSTRAINT IF EXISTS "cariler_cariKodu_key";
CREATE UNIQUE INDEX IF NOT EXISTS "cariler_cariKodu_tenantId_key" ON "cariler"("cariKodu", "tenantId");
ALTER TABLE "cariler" ADD CONSTRAINT "cariler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Siparis
ALTER TABLE "siparisler" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "siparisler_tenantId_idx" ON "siparisler"("tenantId");
CREATE INDEX IF NOT EXISTS "siparisler_tenantId_siparisNo_idx" ON "siparisler"("tenantId", "siparisNo");
ALTER TABLE "siparisler" DROP CONSTRAINT IF EXISTS "siparisler_siparisNo_key";
CREATE UNIQUE INDEX IF NOT EXISTS "siparisler_siparisNo_tenantId_key" ON "siparisler"("siparisNo", "tenantId");
ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Teklif
ALTER TABLE "teklifler" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "teklifler_tenantId_idx" ON "teklifler"("tenantId");
CREATE INDEX IF NOT EXISTS "teklifler_tenantId_teklifNo_idx" ON "teklifler"("tenantId", "teklifNo");
ALTER TABLE "teklifler" DROP CONSTRAINT IF EXISTS "teklifler_teklifNo_key";
CREATE UNIQUE INDEX IF NOT EXISTS "teklifler_teklifNo_tenantId_key" ON "teklifler"("teklifNo", "tenantId");
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tahsilat
ALTER TABLE "tahsilatlar" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "tahsilatlar_tenantId_idx" ON "tahsilatlar"("tenantId");
CREATE INDEX IF NOT EXISTS "tahsilatlar_tenantId_tarih_idx" ON "tahsilatlar"("tenantId", "tarih");
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Kasa
ALTER TABLE "kasalar" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "kasalar_tenantId_idx" ON "kasalar"("tenantId");
CREATE INDEX IF NOT EXISTS "kasalar_tenantId_kasaKodu_idx" ON "kasalar"("tenantId", "kasaKodu");
ALTER TABLE "kasalar" DROP CONSTRAINT IF EXISTS "kasalar_kasaKodu_key";
CREATE UNIQUE INDEX IF NOT EXISTS "kasalar_kasaKodu_tenantId_key" ON "kasalar"("kasaKodu", "tenantId");
ALTER TABLE "kasalar" ADD CONSTRAINT "kasalar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sayim
ALTER TABLE "sayimlar" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "sayimlar_tenantId_idx" ON "sayimlar"("tenantId");
CREATE INDEX IF NOT EXISTS "sayimlar_tenantId_sayimNo_idx" ON "sayimlar"("tenantId", "sayimNo");
ALTER TABLE "sayimlar" DROP CONSTRAINT IF EXISTS "sayimlar_sayimNo_key";
CREATE UNIQUE INDEX IF NOT EXISTS "sayimlar_sayimNo_tenantId_key" ON "sayimlar"("sayimNo", "tenantId");
ALTER TABLE "sayimlar" ADD CONSTRAINT "sayimlar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Masraf
ALTER TABLE "masraflar" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "masraflar_tenantId_idx" ON "masraflar"("tenantId");
CREATE INDEX IF NOT EXISTS "masraflar_tenantId_tarih_idx" ON "masraflar"("tenantId", "tarih");
ALTER TABLE "masraflar" ADD CONSTRAINT "masraflar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Personel
ALTER TABLE "personeller" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "personeller_tenantId_idx" ON "personeller"("tenantId");
CREATE INDEX IF NOT EXISTS "personeller_tenantId_personelKodu_idx" ON "personeller"("tenantId", "personelKodu");
ALTER TABLE "personeller" DROP CONSTRAINT IF EXISTS "personeller_personelKodu_key";
ALTER TABLE "personeller" DROP CONSTRAINT IF EXISTS "personeller_tcKimlikNo_key";
CREATE UNIQUE INDEX IF NOT EXISTS "personeller_personelKodu_tenantId_key" ON "personeller"("personelKodu", "tenantId");
CREATE UNIQUE INDEX IF NOT EXISTS "personeller_tcKimlikNo_tenantId_key" ON "personeller"("tcKimlikNo", "tenantId") WHERE "tcKimlikNo" IS NOT NULL;
ALTER TABLE "personeller" ADD CONSTRAINT "personeller_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PurchaseOrder
ALTER TABLE "purchase_orders" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "purchase_orders_tenantId_idx" ON "purchase_orders"("tenantId");
CREATE INDEX IF NOT EXISTS "purchase_orders_tenantId_orderNumber_idx" ON "purchase_orders"("tenantId", "orderNumber");
ALTER TABLE "purchase_orders" DROP CONSTRAINT IF EXISTS "purchase_orders_orderNumber_key";
CREATE UNIQUE INDEX IF NOT EXISTS "purchase_orders_orderNumber_tenantId_key" ON "purchase_orders"("orderNumber", "tenantId");
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- BasitSiparis
ALTER TABLE "basit_siparisler" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "basit_siparisler_tenantId_idx" ON "basit_siparisler"("tenantId");
CREATE INDEX IF NOT EXISTS "basit_siparisler_tenantId_firmaId_idx" ON "basit_siparisler"("tenantId", "firmaId");
CREATE INDEX IF NOT EXISTS "basit_siparisler_tenantId_urunId_idx" ON "basit_siparisler"("tenantId", "urunId");
ALTER TABLE "basit_siparisler" ADD CONSTRAINT "basit_siparisler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SatınAlmaSiparisi
ALTER TABLE "satin_alma_siparisleri" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "satin_alma_siparisleri_tenantId_idx" ON "satin_alma_siparisleri"("tenantId");
CREATE INDEX IF NOT EXISTS "satin_alma_siparisleri_tenantId_siparisNo_idx" ON "satin_alma_siparisleri"("tenantId", "siparisNo");
ALTER TABLE "satin_alma_siparisleri" DROP CONSTRAINT IF EXISTS "satin_alma_siparisleri_siparisNo_key";
CREATE UNIQUE INDEX IF NOT EXISTS "satin_alma_siparisleri_siparisNo_tenantId_key" ON "satin_alma_siparisleri"("siparisNo", "tenantId");
ALTER TABLE "satin_alma_siparisleri" ADD CONSTRAINT "satin_alma_siparisleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Warehouse
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "warehouses_tenantId_idx" ON "warehouses"("tenantId");
CREATE INDEX IF NOT EXISTS "warehouses_tenantId_code_idx" ON "warehouses"("tenantId", "code");
ALTER TABLE "warehouses" DROP CONSTRAINT IF EXISTS "warehouses_code_key";
CREATE UNIQUE INDEX IF NOT EXISTS "warehouses_code_tenantId_key" ON "warehouses"("code", "tenantId");
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- BankaHavale
ALTER TABLE "banka_havaleler" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "banka_havaleler_tenantId_idx" ON "banka_havaleler"("tenantId");
CREATE INDEX IF NOT EXISTS "banka_havaleler_tenantId_tarih_idx" ON "banka_havaleler"("tenantId", "tarih");
ALTER TABLE "banka_havaleler" ADD CONSTRAINT "banka_havaleler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CekSenet
ALTER TABLE "cek_senetler" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "cek_senetler_tenantId_idx" ON "cek_senetler"("tenantId");
CREATE INDEX IF NOT EXISTS "cek_senetler_tenantId_vade_idx" ON "cek_senetler"("tenantId", "vade");
ALTER TABLE "cek_senetler" ADD CONSTRAINT "cek_senetler_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

