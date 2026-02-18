-- CreateEnum
CREATE TYPE "BasitSiparisDurum" AS ENUM ('ONAY_BEKLIYOR', 'ONAYLANDI', 'SIPARIS_VERILDI', 'FATURALANDI', 'IPTAL_EDILDI');

-- CreateTable
CREATE TABLE "basit_siparisler" (
    "id" TEXT NOT NULL,
    "firmaId" TEXT NOT NULL,
    "urunId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "durum" "BasitSiparisDurum" NOT NULL DEFAULT 'ONAY_BEKLIYOR',
    "tedarikEdilenMiktar" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basit_siparisler_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "basit_siparisler_firmaId_idx" ON "basit_siparisler"("firmaId");

-- CreateIndex
CREATE INDEX "basit_siparisler_urunId_idx" ON "basit_siparisler"("urunId");

-- CreateIndex
CREATE INDEX "basit_siparisler_durum_idx" ON "basit_siparisler"("durum");

-- CreateIndex
CREATE INDEX "basit_siparisler_createdAt_idx" ON "basit_siparisler"("createdAt");

-- AddForeignKey
ALTER TABLE "basit_siparisler" ADD CONSTRAINT "basit_siparisler_firmaId_fkey" FOREIGN KEY ("firmaId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basit_siparisler" ADD CONSTRAINT "basit_siparisler_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
