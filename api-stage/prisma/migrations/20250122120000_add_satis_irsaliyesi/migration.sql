-- ============= SATIŞ İRSALİYESİ MODÜLÜ MİGRATİON =============

-- 1. Enum'ları oluştur
CREATE TYPE "IrsaliyeKaynakTip" AS ENUM ('SIPARIS', 'DOGRUDAN', 'FATURA_OTOMATIK');
CREATE TYPE "IrsaliyeDurum" AS ENUM ('TASLAK', 'FATURALANDI');

-- ModuleType enum'ına DELIVERY_NOTE_SALES ekle
ALTER TYPE "ModuleType" ADD VALUE IF NOT EXISTS 'DELIVERY_NOTE_SALES';

-- 2. Satış İrsaliyesi tablosunu oluştur
CREATE TABLE "satis_irsaliyeleri" (
    "id" TEXT NOT NULL,
    "irsaliyeNo" TEXT NOT NULL,
    "irsaliyeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "cariId" TEXT NOT NULL,
    "depoId" TEXT,
    "kaynakTip" "IrsaliyeKaynakTip" NOT NULL,
    "kaynakId" TEXT,
    "durum" "IrsaliyeDurum" NOT NULL DEFAULT 'TASLAK',
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

    CONSTRAINT "satis_irsaliyeleri_pkey" PRIMARY KEY ("id")
);

-- 3. Satış İrsaliyesi Kalemi tablosunu oluştur
CREATE TABLE "satis_irsaliyesi_kalemleri" (
    "id" TEXT NOT NULL,
    "irsaliyeId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL,
    "kdvTutar" DECIMAL(10,2) NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satis_irsaliyesi_kalemleri_pkey" PRIMARY KEY ("id")
);

-- 4. Satış İrsaliyesi Log tablosunu oluştur
CREATE TABLE "satis_irsaliyesi_logs" (
    "id" TEXT NOT NULL,
    "irsaliyeId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satis_irsaliyesi_logs_pkey" PRIMARY KEY ("id")
);

-- 5. Faturalar tablosuna deliveryNoteId kolonu ekle (NOT NULL constraint olmadan, önce nullable yap)
ALTER TABLE "faturalar" ADD COLUMN "deliveryNoteId" TEXT;

-- 6. Siparisler tablosuna deliveryNoteId kolonu ekle (nullable)
ALTER TABLE "siparisler" ADD COLUMN "deliveryNoteId" TEXT;

-- 7. Mevcut faturalar için geçici irsaliye kayıtları oluştur ve deliveryNoteId'yi set et
DO $$
DECLARE
    fatura_rec RECORD;
    irsaliye_id TEXT;
    irsaliye_no TEXT;
    year_str TEXT;
    counter INTEGER;
BEGIN
    FOR fatura_rec IN
        SELECT
            "id",
            "tarih",
            "tenantId",
            "cariId",
            "toplamTutar",
            "kdvTutar",
            "genelToplam",
            "iskonto",
            "aciklama",
            "createdBy",
            "createdAt",
            "updatedAt",
            EXTRACT(YEAR FROM "tarih")::text AS year_val
        FROM "faturalar"
        WHERE "deletedAt" IS NULL
        AND "faturaTipi" = 'SATIS'
        ORDER BY "createdAt"
    LOOP
        -- Yıl bazlı sayaç
        SELECT COALESCE(MAX(CAST(SUBSTRING("irsaliyeNo" FROM '[0-9]+$') AS INTEGER)), 0) + 1
        INTO counter
        FROM "satis_irsaliyeleri"
        WHERE "irsaliyeNo" LIKE 'IRS-' || fatura_rec.year_val || '-%'
        AND ("tenantId" = fatura_rec."tenantId" OR ("tenantId" IS NULL AND fatura_rec."tenantId" IS NULL));

        irsaliye_no := 'IRS-' || fatura_rec.year_val || '-' || LPAD(counter::text, 6, '0');
        irsaliye_id := gen_random_uuid()::text;

        -- İrsaliye oluştur
        INSERT INTO "satis_irsaliyeleri" (
            "id",
            "irsaliyeNo",
            "irsaliyeTarihi",
            "tenantId",
            "cariId",
            "depoId",
            "kaynakTip",
            "kaynakId",
            "durum",
            "toplamTutar",
            "kdvTutar",
            "genelToplam",
            "iskonto",
            "aciklama",
            "createdBy",
            "createdAt",
            "updatedAt"
        ) VALUES (
            irsaliye_id,
            irsaliye_no,
            fatura_rec."tarih",
            fatura_rec."tenantId",
            fatura_rec."cariId",
            NULL,
            'FATURA_OTOMATIK'::"IrsaliyeKaynakTip",
            NULL,
            'FATURALANDI'::"IrsaliyeDurum",
            fatura_rec."toplamTutar",
            fatura_rec."kdvTutar",
            fatura_rec."genelToplam",
            fatura_rec."iskonto",
            fatura_rec."aciklama",
            fatura_rec."createdBy",
            fatura_rec."createdAt",
            fatura_rec."updatedAt"
        );

        -- Fatura deliveryNoteId'yi set et
        UPDATE "faturalar"
        SET "deliveryNoteId" = irsaliye_id
        WHERE "id" = fatura_rec."id";
    END LOOP;
END $$;

-- 8. Faturalar tablosundaki deliveryNoteId nullable olarak bırakılıyor (ALIS faturaları için null olabilir)
-- ALTER TABLE "faturalar" ALTER COLUMN "deliveryNoteId" SET NOT NULL;

-- 9. Foreign key constraints ekle
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_kaynakId_fkey" FOREIGN KEY ("kaynakId") REFERENCES "siparisler"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "satis_irsaliyeleri" ADD CONSTRAINT "satis_irsaliyeleri_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "satis_irsaliyesi_kalemleri" ADD CONSTRAINT "satis_irsaliyesi_kalemleri_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES "satis_irsaliyeleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "satis_irsaliyesi_kalemleri" ADD CONSTRAINT "satis_irsaliyesi_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "satis_irsaliyesi_logs" ADD CONSTRAINT "satis_irsaliyesi_logs_irsaliyeId_fkey" FOREIGN KEY ("irsaliyeId") REFERENCES "satis_irsaliyeleri"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "satis_irsaliyesi_logs" ADD CONSTRAINT "satis_irsaliyesi_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "satis_irsaliyeleri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "siparisler" ADD CONSTRAINT "siparisler_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES "satis_irsaliyeleri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 10. Unique constraints ve index'ler
CREATE UNIQUE INDEX "satis_irsaliyeleri_irsaliyeNo_tenantId_key" ON "satis_irsaliyeleri"("irsaliyeNo", "tenantId");
CREATE UNIQUE INDEX "siparisler_deliveryNoteId_key" ON "siparisler"("deliveryNoteId");

CREATE INDEX "satis_irsaliyeleri_tenantId_idx" ON "satis_irsaliyeleri"("tenantId");
CREATE INDEX "satis_irsaliyeleri_irsaliyeNo_tenantId_idx" ON "satis_irsaliyeleri"("irsaliyeNo", "tenantId");
CREATE INDEX "satis_irsaliyeleri_durum_tenantId_idx" ON "satis_irsaliyeleri"("durum", "tenantId");
CREATE INDEX "satis_irsaliyeleri_irsaliyeTarihi_tenantId_idx" ON "satis_irsaliyeleri"("irsaliyeTarihi", "tenantId");
CREATE INDEX "satis_irsaliyeleri_cariId_idx" ON "satis_irsaliyeleri"("cariId");
CREATE INDEX "satis_irsaliyeleri_durum_idx" ON "satis_irsaliyeleri"("durum");
CREATE INDEX "satis_irsaliyeleri_kaynakId_idx" ON "satis_irsaliyeleri"("kaynakId");

CREATE INDEX "satis_irsaliyesi_kalemleri_irsaliyeId_idx" ON "satis_irsaliyesi_kalemleri"("irsaliyeId");
CREATE INDEX "satis_irsaliyesi_kalemleri_stokId_idx" ON "satis_irsaliyesi_kalemleri"("stokId");

CREATE INDEX "satis_irsaliyesi_logs_irsaliyeId_idx" ON "satis_irsaliyesi_logs"("irsaliyeId");
CREATE INDEX "satis_irsaliyesi_logs_userId_idx" ON "satis_irsaliyesi_logs"("userId");

CREATE INDEX "faturalar_deliveryNoteId_idx" ON "faturalar"("deliveryNoteId");
CREATE INDEX "siparisler_deliveryNoteId_idx" ON "siparisler"("deliveryNoteId");
