-- CreateEnum
CREATE TYPE "SirketTipi" AS ENUM ('KURUMSAL', 'SAHIS');

-- AlterTable
ALTER TABLE "cariler" ADD COLUMN     "aktif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "il" TEXT,
ADD COLUMN     "ilce" TEXT,
ADD COLUMN     "sirketTipi" "SirketTipi" DEFAULT 'KURUMSAL',
ADD COLUMN     "ulke" TEXT DEFAULT 'Türkiye';
