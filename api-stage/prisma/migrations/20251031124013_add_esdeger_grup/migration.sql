-- AlterTable
ALTER TABLE "stoklar" ADD COLUMN     "esdegerGrupId" TEXT;

-- CreateTable
CREATE TABLE "esdeger_gruplar" (
    "id" TEXT NOT NULL,
    "grupAdi" TEXT,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "esdeger_gruplar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stoklar" ADD CONSTRAINT "stoklar_esdegerGrupId_fkey" FOREIGN KEY ("esdegerGrupId") REFERENCES "esdeger_gruplar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
