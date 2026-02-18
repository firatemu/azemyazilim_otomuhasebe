/*
  Warnings:

  - Added the required column `bakiye` to the `cari_hareketler` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `cari_hareketler` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BelgeTipi" AS ENUM ('FATURA', 'TAHSILAT', 'ODEME', 'DEVIR', 'DUZELTME');

-- AlterEnum
ALTER TYPE "BorcAlacak" ADD VALUE 'DEVIR';

-- AlterTable
ALTER TABLE "cari_hareketler" ADD COLUMN     "bakiye" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "belgeNo" TEXT,
ADD COLUMN     "belgeTipi" "BelgeTipi",
ADD COLUMN     "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "cari_hareketler_cariId_tarih_idx" ON "cari_hareketler"("cariId", "tarih");
