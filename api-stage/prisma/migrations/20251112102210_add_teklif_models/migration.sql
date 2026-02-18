-- CreateEnum
CREATE TYPE "TeklifTipi" AS ENUM ('SATIS', 'SATIN_ALMA');

-- CreateEnum
CREATE TYPE "TeklifDurum" AS ENUM ('TEKLIF', 'ONAYLANDI', 'REDDEDILDI', 'SIPARISE_DONUSTU');

-- CreateTable
CREATE TABLE "teklifler" (
    "id" TEXT NOT NULL,
    "teklifNo" TEXT NOT NULL,
    "teklifTipi" "TeklifTipi" NOT NULL,
    "cariId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gecerlilikTarihi" TIMESTAMP(3),
    "iskonto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "toplamTutar" DECIMAL(12,2) NOT NULL,
    "kdvTutar" DECIMAL(12,2) NOT NULL,
    "genelToplam" DECIMAL(12,2) NOT NULL,
    "aciklama" TEXT,
    "durum" "TeklifDurum" NOT NULL DEFAULT 'TEKLIF',
    "siparisId" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teklifler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teklif_kalemleri" (
    "id" TEXT NOT NULL,
    "teklifId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL,
    "kdvTutar" DECIMAL(10,2) NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "iskontoOran" DECIMAL(5,2),
    "iskontoTutar" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teklif_kalemleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teklif_logs" (
    "id" TEXT NOT NULL,
    "teklifId" TEXT NOT NULL,
    "userId" TEXT,
    "actionType" "LogAction" NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teklif_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teklifler_teklifNo_key" ON "teklifler"("teklifNo");

-- CreateIndex
CREATE INDEX "teklif_logs_teklifId_idx" ON "teklif_logs"("teklifId");

-- CreateIndex
CREATE INDEX "teklif_logs_userId_idx" ON "teklif_logs"("userId");

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "siparisler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklifler" ADD CONSTRAINT "teklifler_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklif_kalemleri" ADD CONSTRAINT "teklif_kalemleri_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "teklifler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklif_kalemleri" ADD CONSTRAINT "teklif_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklif_logs" ADD CONSTRAINT "teklif_logs_teklifId_fkey" FOREIGN KEY ("teklifId") REFERENCES "teklifler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teklif_logs" ADD CONSTRAINT "teklif_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

