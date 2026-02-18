-- Add faturaNo to satin_alma_siparisleri
ALTER TABLE "satin_alma_siparisleri" 
ADD COLUMN IF NOT EXISTS "faturaNo" TEXT;

-- Add satinAlmaSiparisiId to faturalar
ALTER TABLE "faturalar" 
ADD COLUMN IF NOT EXISTS "satinAlmaSiparisiId" TEXT;

CREATE INDEX IF NOT EXISTS "faturalar_satinAlmaSiparisiId_idx" ON "faturalar"("satinAlmaSiparisiId");
