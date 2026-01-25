-- Add country and neighborhood fields to tenant_settings

-- Add country field with default value
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'Türkiye';

-- Add neighborhood field
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "neighborhood" TEXT;
