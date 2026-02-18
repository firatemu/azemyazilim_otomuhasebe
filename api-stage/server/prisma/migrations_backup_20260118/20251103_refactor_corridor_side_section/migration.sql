-- AlterTable: Eski kolonları sil, yeni kolonları ekle
-- Önce mevcut verileri temizle
TRUNCATE TABLE "locations" CASCADE;

-- Eski kolonları sil
ALTER TABLE "locations" DROP COLUMN IF EXISTS "aisle";
ALTER TABLE "locations" DROP COLUMN IF EXISTS "column";

-- Yeni kolonları ekle
ALTER TABLE "locations" ADD COLUMN "corridor" TEXT NOT NULL DEFAULT 'A';
ALTER TABLE "locations" ADD COLUMN "side" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "locations" ADD COLUMN "section" INTEGER NOT NULL DEFAULT 1;

-- Default değerleri kaldır
ALTER TABLE "locations" ALTER COLUMN "corridor" DROP DEFAULT;
ALTER TABLE "locations" ALTER COLUMN "side" DROP DEFAULT;
ALTER TABLE "locations" ALTER COLUMN "section" DROP DEFAULT;

-- Kod açıklamasını güncelle
COMMENT ON COLUMN "locations"."code" IS 'Format: K{layer}-{corridor}{side}-{section}-{level} (örn: K1-A1-3-5)';
COMMENT ON COLUMN "locations"."corridor" IS 'Koridor (A..E)';
COMMENT ON COLUMN "locations"."side" IS 'Taraf (1=Sol, 2=Sağ)';
COMMENT ON COLUMN "locations"."section" IS 'Bölüm (1..99)';
COMMENT ON COLUMN "locations"."level" IS 'Raf seviyesi (1..50)';

