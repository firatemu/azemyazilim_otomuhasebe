-- Stok Modülü Performans İndeksleri
-- Bu migration, stok sorgularını hızlandırmak için optimize edilmiş indeksler ekler

-- 1. Stok tablosu için arama indeksleri
-- Marka bazlı arama ve filtreleme
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_marka_idx"
ON "stoklar"("tenantId", "marka");

-- Kategori bazlı arama (ana + alt kategori)
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_kategori_idx"
ON "stoklar"("tenantId", "kategori");

-- Hiyerarşik kategori araması (ana → alt)
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_anaKategori_altKategori_idx"
ON "stoklar"("tenantId", "anaKategori", "altKategori");

-- Barkod ile hızlı arama (POS için kritik)
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_barkod_idx"
ON "stoklar"("tenantId", "barkod");

-- OEM numarası araması (otomotiv yedek parça için kritik)
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_oem_idx"
ON "stoklar"("tenantId", "oem");

-- Araç bazlı arama (marka → model)
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_aracMarka_aracModel_idx"
ON "stoklar"("tenantId", "aracMarka", "aracModel");

-- Stok kodu benzersiz index (tenant içinde)
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_stokKodu_idx"
ON "stoklar"("tenantId", "stokKodu");

-- 2. Stok tablosu için sıralama indeksleri
-- Tarih bazlı sıralama (en yeniden eskiye)
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_createdAt_idx"
ON "stoklar"("tenantId", "createdAt" DESC);

-- Ada göre sıralama
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_stokAdi_idx"
ON "stoklar"("tenantId", "stokAdi");

-- 3. Compound indeksler (çoklu filtre için)
-- Marka + Kategori kombinasyonu
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_marka_kategori_idx"
ON "stoklar"("tenantId", "marka", "kategori");

-- Stok kodu + tenant (benzersizlik için)
CREATE INDEX IF NOT EXISTS "stoklar_tenantId_stokKodu_unique_idx"
ON "stoklar"("tenantId", "stokKodu");

-- 4. StokHareket tablosu için indeksler
-- Stok hareketlerini chronologically getir
CREATE INDEX IF NOT EXISTS "stok_hareketleri_tenantId_stokId_createdAt_idx"
ON "stok_hareketleri"("tenantId", "stokId", "createdAt" DESC);

-- Hareket tipine göre filtreleme
CREATE INDEX IF NOT EXISTS "stok_hareketleri_tenantId_hareketTipi_createdAt_idx"
ON "stok_hareketleri"("tenantId", "hareketTipi", "createdAt" DESC);

-- Spesifik stokun hareket tipi
CREATE INDEX IF NOT EXISTS "stok_hareketleri_stokId_hareketTipi_idx"
ON "stok_hareketleri"("stokId", "hareketTipi");

-- 5. Eşdeğer ürün ilişkileri için indeksler
-- Eşdeğer grup sorguları
CREATE INDEX IF NOT EXISTS "stoklar_esdegerGrupId_idx"
ON "stoklar"("esdegerGrupId");

-- 6. Partial index - kritik stok seviyesindeki ürünler
CREATE INDEX IF NOT EXISTS "stoklar_kritik_stok_idx"
ON "stoklar"("tenantId", "kritikStokMiktari", "miktar")
WHERE "kritikStokMiktari" > 0;

-- İndeks istatistiklerini güncelle
ANALYZE "stoklar";
ANALYZE "stok_hareketleri";

-- Yorumlar
COMMENT ON INDEX "stoklar_tenantId_marka_idx" IS 'Marka bazlı filtreleme için';
COMMENT ON INDEX "stoklar_tenantId_kategori_idx" IS 'Kategori bazlı filtreleme için';
COMMENT ON INDEX "stoklar_tenantId_barkod_idx" IS 'Barkod ile hızlı arama (POS)';
COMMENT ON INDEX "stoklar_tenantId_oem_idx" IS 'OEM numarası araması (otomotiv)';
COMMENT ON INDEX "stoklar_tenantId_aracMarka_aracModel_idx" IS 'Araç marka-model bazlı arama';
COMMENT ON INDEX "stok_hareketleri_tenantId_stokId_createdAt_idx" IS 'Stok hareketlerini kronolojik sorgulama';
COMMENT ON INDEX "stoklar_kritik_stok_idx" IS 'Kritik stok seviyesindeki ürünler için';
