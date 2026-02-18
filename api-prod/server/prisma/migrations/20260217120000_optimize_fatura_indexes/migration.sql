-- Fatura Modülü Performans İndeksleri
-- Bu migration, fatura sorgularını hızlandırmak için optimize edilmiş indeksler ekler

-- 1. Fatura tablosu için compound indeksler
-- Arşiv ve deletedAt sorguları için
CREATE INDEX IF NOT EXISTS "faturalar_tenantId_deletedAt_faturaTipi_idx"
ON "faturalar"("tenantId", "deletedAt", "faturaTipi");

-- Cari bazlı filtreler için (onay durumu + silinmiş kontrolü ile)
CREATE INDEX IF NOT EXISTS "faturalar_cariId_durum_deletedAt_idx"
ON "faturalar"("cariId", "durum", "deletedAt");

-- Vade analizi sorguları için
CREATE INDEX IF NOT EXISTS "faturalar_tenantId_vade_durum_idx"
ON "faturalar"("tenantId", "vade", "durum");

-- Arşiv sorguları için (deletedAt olan kayıtları hızlı bul)
CREATE INDEX IF NOT EXISTS "faturalar_deletedAt_createdAt_idx"
ON "faturalar"("deletedAt", "createdAt" DESC);

-- Cari bazlı raporlar için
CREATE INDEX IF NOT EXISTS "faturalar_tenantId_cariId_durum_idx"
ON "faturalar"("tenantId", "cariId", "durum");

-- Tarih bazlı arama sorguları için
CREATE INDEX IF NOT EXISTS "faturalar_tenantId_tarih_createdAt_idx"
ON "faturalar"("tenantId", "tarih" DESC, "createdAt" DESC);

-- 2. FaturaKalemi tablosu için indeksler
-- Kalem detay sorguları için
CREATE INDEX IF NOT EXISTS "fatura_kalemleri_faturaId_stokId_idx"
ON "fatura_kalemleri"("faturaId", "stokId");

-- Ürün bazlı raporlar için (stokId ile faturaları bul)
CREATE INDEX IF NOT EXISTS "fatura_kalemleri_stokId_idx"
ON "fatura_kalemleri"("stokId");

-- 3. FaturaLog tablosu için
-- Son log kayıtlarını hızlı çekmek için
CREATE INDEX IF NOT EXISTS "fatura_logs_faturaId_createdAt_idx"
ON "fatura_logs"("faturaId", "createdAt" DESC);

-- 4. Partial Index ( sadece aktif faturalar için )
-- Bu indeks sadece deletedAt NULL olan kayıtları içerir
CREATE UNIQUE INDEX IF NOT EXISTS "faturalar_active_tenantId_faturaNo_idx"
ON "faturalar"("tenantId", "faturaNo")
WHERE "deletedAt" IS NULL;

-- İndeks istatistiklerini güncelle
ANALYZE "faturalar";
ANALYZE "fatura_kalemleri";
ANALYZE "fatura_logs";

COMMENT ON INDEX "faturalar_tenantId_deletedAt_faturaTipi_idx" IS 'Fatura listeleme sorguları için - tenant, durum ve türe göre hızlı arama';
COMMENT ON INDEX "faturalar_cariId_durum_deletedAt_idx" IS 'Cari bazlı filtreler için - cari, durum ve silinmiş kontrolü';
COMMENT ON INDEX "faturalar_tenantId_vade_durum_idx" IS 'Vade analizi sorguları için - tenant ve vade bazlı sıralama';
COMMENT ON INDEX "fatura_kalemleri_faturaId_stokId_idx" IS 'Kalem detay sorguları için - fatura ve stok ilişkisi';
