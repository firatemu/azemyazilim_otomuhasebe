-- AlterTable: Add company info fields to tenant_settings

-- Firma tipi
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "companyType" TEXT DEFAULT 'COMPANY';

-- Şirket bilgileri
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "taxOffice" TEXT;
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "mersisNo" TEXT;

-- Şahıs firma bilgileri
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "tcNo" TEXT;

-- İletişim bilgileri
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "website" TEXT;

-- Adres bilgileri
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "district" TEXT;
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
