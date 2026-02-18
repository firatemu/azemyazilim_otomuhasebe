-- DropForeignKey
ALTER TABLE "cek_senet_logs" DROP CONSTRAINT IF EXISTS "cek_senet_logs_cekSenetId_fkey";
ALTER TABLE "cek_senet_logs" DROP CONSTRAINT IF EXISTS "cek_senet_logs_userId_fkey";
ALTER TABLE "cek_senetler" DROP CONSTRAINT IF EXISTS "cek_senetler_cariId_fkey";
ALTER TABLE "cek_senetler" DROP CONSTRAINT IF EXISTS "cek_senetler_createdBy_fkey";
ALTER TABLE "cek_senetler" DROP CONSTRAINT IF EXISTS "cek_senetler_deletedBy_fkey";
ALTER TABLE "cek_senetler" DROP CONSTRAINT IF EXISTS "cek_senetler_tahsilKasaId_fkey";
ALTER TABLE "cek_senetler" DROP CONSTRAINT IF EXISTS "cek_senetler_tenantId_fkey";
ALTER TABLE "cek_senetler" DROP CONSTRAINT IF EXISTS "cek_senetler_updatedBy_fkey";
ALTER TABLE "deleted_cek_senetler" DROP CONSTRAINT IF EXISTS "deleted_cek_senetler_deletedBy_fkey";

-- DropTable
DROP TABLE IF EXISTS "cek_senet_logs";
DROP TABLE IF EXISTS "cek_senetler";
DROP TABLE IF EXISTS "deleted_cek_senetler";

-- DropEnum
DROP TYPE IF EXISTS "CekSenetTip";
DROP TYPE IF EXISTS "PortfoyTip";
DROP TYPE IF EXISTS "CekSenetDurum";

-- AlterEnum
-- Remove CEK_SENET from KasaTipi enum
-- Note: This requires recreating the enum if there are existing values
-- First, add a temporary type
CREATE TYPE "KasaTipi_new" AS ENUM ('NAKIT', 'POS', 'FIRMA_KREDI_KARTI', 'BANKA');

-- Update existing kasalar to use NAKIT if they were CEK_SENET
UPDATE "kasalar" SET "kasaTipi" = 'NAKIT'::"KasaTipi" WHERE "kasaTipi" = 'CEK_SENET'::"KasaTipi";

-- Alter the column to use the new type
ALTER TABLE "kasalar" ALTER COLUMN "kasaTipi" TYPE "KasaTipi_new" USING ("kasaTipi"::text::"KasaTipi_new");

-- Drop the old enum and rename the new one
DROP TYPE "KasaTipi";
ALTER TYPE "KasaTipi_new" RENAME TO "KasaTipi";
