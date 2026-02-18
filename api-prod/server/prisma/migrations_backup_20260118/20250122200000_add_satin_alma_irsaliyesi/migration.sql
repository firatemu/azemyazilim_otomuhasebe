-- ============= SATIN ALMA İRSALİYESİ MODÜLÜ MİGRATİON =============

-- ModuleType enum'ına DELIVERY_NOTE_PURCHASE ekle
ALTER TYPE "ModuleType" ADD VALUE IF NOT EXISTS 'DELIVERY_NOTE_PURCHASE';

-- 1. Satın Alma İrsaliyesi tablosunu oluştur
CREATE TABLE "satin_alma_irsaliyeleri" (
    "id" TEXT NOT NULL,
    "irsaliyeNo" TEXT NOT NULL,
    "irsaliyeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "cariId" TEXT NOT NULL,
    "depoId" TEXT,
    "kaynakTip" "IrsaliyeKaynakTip" NOT NULL,
    "kaynakId" TEXT,
    "durum" "IrsaliyeDurum" NOT NULL DEFAULT 'FATURALANMADI',
    "toplamTutar" DECIMAL(12,2) NOT NULL,
    "kdvTutar" DECIMAL(12,2) NOT NULL,
    "genelToplam" DECIMAL(12,2) NOT NULL,
    "iskonto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "aciklama" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "satin_alma_irsaliyeleri_pkey" PRIMARY KEY ("id")
);

-- 2. Satın Alma İrsaliyesi Kalemi tablosunu oluştur
CREATE TABLE "satin_alma_irsaliyesi_kalemleri" (
    "id" TEXT NOT NULL,
    "irsaliyeId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL,
    "kdvTutar" DECIMAL(10,2) NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satin_alma_irsaliyesi_kalemleri_pkey" PRIMARY KEY ("id")
);

-- 3. Satın Alma İrsaliyesi Log tablosunu oluştur
CREATE TABLE "satin_alma_irsaliyesi_logs" (
    "id" TEXT NOT NULL,
    "irsaliyeId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satin_alma_irsaliyesi_logs_pkey" PRIMARY KEY ("id")
);

-- 4. Satın alma siparişleri tablosuna deliveryNoteId ekle (eğer yoksa)
ALTER TABLE "satin_alma_siparisleri" ADD COLUMN IF NOT EXISTS "deliveryNoteId" TEXT;

-- 5. Faturalar tablosuna satinAlmaIrsaliyeId ekle (eğer yoksa)
ALTER TABLE "faturalar" ADD COLUMN IF NOT EXISTS "satinAlmaIrsaliyeId" TEXT;

-- 6. Index'ler
CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyeleri_tenantId_idx" ON "satin_alma_irsaliyeleri"("tenantId");
CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyeleri_tenantId_irsaliyeNo_idx" ON "satin_alma_irsaliyeleri"("tenantId", "irsaliyeNo");
CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyeleri_tenantId_durum_idx" ON "satin_alma_irsaliyeleri"("tenantId", "durum");
CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyeleri_tenantId_irsaliyeTarihi_idx" ON "satin_alma_irsaliyeleri"("tenantId", "irsaliyeTarihi");
CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyeleri_cariId_idx" ON "satin_alma_irsaliyeleri"("cariId");
CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyeleri_durum_idx" ON "satin_alma_irsaliyeleri"("durum");
CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyeleri_kaynakId_idx" ON "satin_alma_irsaliyeleri"("kaynakId");
CREATE UNIQUE INDEX IF NOT EXISTS "satin_alma_irsaliyeleri_irsaliyeNo_tenantId_key" ON "satin_alma_irsaliyeleri"("irsaliyeNo", "tenantId");

CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyesi_kalemleri_irsaliyeId_idx" ON "satin_alma_irsaliyesi_kalemleri"("irsaliyeId");
CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyesi_kalemleri_stokId_idx" ON "satin_alma_irsaliyesi_kalemleri"("stokId");

CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyesi_logs_irsaliyeId_idx" ON "satin_alma_irsaliyesi_logs"("irsaliyeId");
CREATE INDEX IF NOT EXISTS "satin_alma_irsaliyesi_logs_userId_idx" ON "satin_alma_irsaliyesi_logs"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "satin_alma_siparisleri_deliveryNoteId_key" ON "satin_alma_siparisleri"("deliveryNoteId");
CREATE UNIQUE INDEX IF NOT EXISTS "faturalar_satinAlmaIrsaliyeId_key" ON "faturalar"("satinAlmaIrsaliyeId");

-- 7. Foreign key constraints
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_kaynakId_fkey" FOREIGN KEY ("kaynakId") REFERENCES "satin_alma_siparisleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "satin_alma_irsaliyeleri" ADD CONSTRAINT "satin_alma_irsaliyeleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "satin_alma_irsaliyesi_kalemleri" ADD CONSTRAINT "satin_alma_irsaliyesi_kalemleri_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES "satin_alma_irsaliyeleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "satin_alma_irsaliyesi_kalemleri" ADD CONSTRAINT "satin_alma_irsaliyesi_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "satin_alma_irsaliyesi_logs" ADD CONSTRAINT "satin_alma_irsaliyesi_logs_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES "satin_alma_irsaliyeleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "satin_alma_irsaliyesi_logs" ADD CONSTRAINT "satin_alma_irsaliyesi_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "satin_alma_siparisleri" ADD CONSTRAINT "satin_alma_siparisleri_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "satin_alma_irsaliyeleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_satinAlmaIrsaliyeId_fkey" FOREIGN KEY ("satinAlmaIrsaliyeId") REFERENCES "satin_alma_irsaliyeleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 8. SatınAlmaSiparisDurum enum'ına yeni durumlar ekle (eğer yoksa)
-- Bu enum değerleri zaten eklenmiş olabilir, bu yüzden IF NOT EXISTS kullanılmalı
-- Ancak PostgreSQL enum'larına değer eklemek için ALTER TYPE kullanılır
DO $$
BEGIN
    -- HAZIRLANIYOR ekle
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'HAZIRLANIYOR' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SatınAlmaSiparisDurum')) THEN
        ALTER TYPE "SatınAlmaSiparisDurum" ADD VALUE 'HAZIRLANIYOR';
    END IF;

    -- HAZIRLANDI ekle
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'HAZIRLANDI' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SatınAlmaSiparisDurum')) THEN
        ALTER TYPE "SatınAlmaSiparisDurum" ADD VALUE 'HAZIRLANDI';
    END IF;

    -- SEVK_EDILDI ekle
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SEVK_EDILDI' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SatınAlmaSiparisDurum')) THEN
        ALTER TYPE "SatınAlmaSiparisDurum" ADD VALUE 'SEVK_EDILDI';
    END IF;

    -- KISMI_SEVK ekle
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'KISMI_SEVK' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SatınAlmaSiparisDurum')) THEN
        ALTER TYPE "SatınAlmaSiparisDurum" ADD VALUE 'KISMI_SEVK';
    END IF;
END $$;

-- 9. satin_alma_siparis_kalemleri tablosuna sevkEdilenMiktar ekle (eğer yoksa)
ALTER TABLE "satin_alma_siparis_kalemleri" ADD COLUMN IF NOT EXISTS "sevkEdilenMiktar" INTEGER NOT NULL DEFAULT 0;

