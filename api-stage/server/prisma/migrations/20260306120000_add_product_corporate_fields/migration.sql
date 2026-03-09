-- Add corporate / extended fields to products (malzeme)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight" DECIMAL(12,4);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight_unit" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "dimensions" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "country_of_origin" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "warranty_months" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "internal_note" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "min_order_qty" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "lead_time_days" INTEGER;
