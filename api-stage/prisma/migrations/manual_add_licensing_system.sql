-- ============= SAAS LİSANSLAMA SİSTEMİ MİGRATİON =============

-- 1. Plans tablosuna yeni alanlar ekle
ALTER TABLE "plans" 
ADD COLUMN IF NOT EXISTS "baseUserLimit" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "isBasePlan" BOOLEAN NOT NULL DEFAULT true;

-- 2. Subscriptions tablosuna ek kullanıcı alanı ekle
ALTER TABLE "subscriptions" 
ADD COLUMN IF NOT EXISTS "additionalUsers" INTEGER NOT NULL DEFAULT 0;

-- 3. Modules tablosu oluştur
CREATE TABLE IF NOT EXISTS "modules" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "modules_slug_key" ON "modules"("slug");
CREATE INDEX IF NOT EXISTS "modules_slug_idx" ON "modules"("slug");
CREATE INDEX IF NOT EXISTS "modules_isActive_idx" ON "modules"("isActive");

-- 4. Module Licenses tablosu oluştur
CREATE TABLE IF NOT EXISTS "module_licenses" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "module_licenses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "module_licenses_subscriptionId_idx" ON "module_licenses"("subscriptionId");
CREATE INDEX IF NOT EXISTS "module_licenses_moduleId_idx" ON "module_licenses"("moduleId");

ALTER TABLE "module_licenses" 
ADD CONSTRAINT "module_licenses_subscriptionId_fkey" 
FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "module_licenses" 
ADD CONSTRAINT "module_licenses_moduleId_fkey" 
FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. License Type enum oluştur
DO $$ BEGIN
  CREATE TYPE "LicenseType" AS ENUM ('BASE_PLAN', 'MODULE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 6. User Licenses tablosu oluştur
CREATE TABLE IF NOT EXISTS "user_licenses" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "licenseType" "LicenseType" NOT NULL,
  "moduleId" TEXT,
  "assignedBy" TEXT,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "revokedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_licenses_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_licenses_userId_licenseType_moduleId_key" UNIQUE ("userId", "licenseType", "moduleId")
);

CREATE INDEX IF NOT EXISTS "user_licenses_userId_idx" ON "user_licenses"("userId");
CREATE INDEX IF NOT EXISTS "user_licenses_moduleId_idx" ON "user_licenses"("moduleId");
CREATE INDEX IF NOT EXISTS "user_licenses_licenseType_idx" ON "user_licenses"("licenseType");

ALTER TABLE "user_licenses" 
ADD CONSTRAINT "user_licenses_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_licenses" 
ADD CONSTRAINT "user_licenses_moduleId_fkey" 
FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Invitation Status enum oluştur
DO $$ BEGIN
  CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 8. Invitations tablosu oluştur
CREATE TABLE IF NOT EXISTS "invitations" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "invitedBy" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "acceptedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "invitations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "invitations_token_key" UNIQUE ("token")
);

CREATE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations"("email");
CREATE INDEX IF NOT EXISTS "invitations_tenantId_idx" ON "invitations"("tenantId");
CREATE INDEX IF NOT EXISTS "invitations_token_idx" ON "invitations"("token");
CREATE INDEX IF NOT EXISTS "invitations_status_idx" ON "invitations"("status");

ALTER TABLE "invitations" 
ADD CONSTRAINT "invitations_tenantId_fkey" 
FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;


