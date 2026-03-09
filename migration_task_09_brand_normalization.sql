-- ============================================
-- TASK 9: Normalize Product Table - Brand
-- ============================================
-- Convert brand_text (text) to brand_id (FK to brands)
-- ============================================

-- ============================================
-- Step 1: Check if brands table exists and create indexes
-- ============================================
-- Ensure brands table has proper indexes for migration
CREATE INDEX IF NOT EXISTS brands_tenant_id_idx ON brands(tenant_id);
CREATE INDEX IF NOT EXISTS brands_name_idx ON brands(name);

-- ============================================
-- Step 2: Analyze current brand data
-- ============================================
-- Count products with brand information
SELECT 
  'Brand Data Analysis' as status,
  COUNT(*) FILTER (WHERE brand_text IS NOT NULL) as products_with_brand,
  COUNT(*) FILTER (WHERE brand_id IS NOT NULL) as products_with_brand_id,
  COUNT(*) FILTER (WHERE brand_text IS NOT NULL AND brand_id IS NULL) as products_needing_migration,
  COUNT(DISTINCT brand_text) FILTER (WHERE brand_text IS NOT NULL) as unique_brands
FROM products;

-- Show sample of brands needing migration
SELECT 
  "tenantId",
  brand_text,
  COUNT(*) as product_count
FROM products
WHERE brand_text IS NOT NULL 
  AND brand_id IS NULL
GROUP BY "tenantId", brand_text
ORDER BY "tenantId", product_count DESC
LIMIT 20;

-- ============================================
-- Step 3: Create function to consolidate duplicate brands
-- ============================================
CREATE OR REPLACE FUNCTION consolidate_duplicate_brands()
RETURNS TABLE(
  tenant_id TEXT,
  original_brand TEXT,
  consolidated_brand_id UUID,
  products_affected INT
) AS $$
DECLARE
  brand_record RECORD;
  brand_id_value UUID;
  products_count INT;
BEGIN
  -- For each unique brand per tenant
  FOR brand_record IN 
    SELECT "tenantId", brand_text, COUNT(*) as cnt
    FROM products
    WHERE brand_text IS NOT NULL AND brand_id IS NULL
    GROUP BY "tenantId", brand_text
    ORDER BY "tenantId", brand_text
  LOOP
    -- Check if brand already exists in brands table
    SELECT id INTO brand_id_value
    FROM brands b
    WHERE b.tenant_id = brand_record."tenantId"
      AND b.name = brand_record.brand_text
    LIMIT 1;
    
    -- If not exists, create it
    IF brand_id_value IS NULL THEN
      INSERT INTO brands (id, tenant_id, name, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), brand_record."tenantId", brand_record.brand_text, true, NOW(), NOW())
      RETURNING id INTO brand_id_value;
    END IF;
    
    -- Update products to use brand_id
    UPDATE products
    SET brand_id = brand_id_value
    WHERE "tenantId" = brand_record."tenantId"
      AND brand_text = brand_record.brand_text
      AND brand_id IS NULL;
    
    GET DIAGNOSTICS products_count = ROW_COUNT;
    
    -- Return result
    RETURN QUERY SELECT 
      brand_record."tenantId",
      brand_record.brand_text,
      brand_id_value,
      products_count;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 4: Execute brand consolidation
-- ============================================
-- Run the consolidation function
SELECT * FROM consolidate_duplicate_brands();

-- ============================================
-- Step 5: Verify migration results
-- ============================================
-- Count after migration
SELECT 
  'Brand Migration Results' as status,
  COUNT(*) FILTER (WHERE brand_text IS NOT NULL) as products_with_brand,
  COUNT(*) FILTER (WHERE brand_id IS NOT NULL) as products_with_brand_id,
  COUNT(*) FILTER (WHERE brand_text IS NOT NULL AND brand_id IS NULL) as products_still_needing_migration,
  COUNT(DISTINCT brand_id) FILTER (WHERE brand_id IS NOT NULL) as unique_brand_ids
FROM products;

-- Show unmatched brands (if any)
SELECT 
  "tenantId",
  brand_text,
  COUNT(*) as product_count
FROM products
WHERE brand_text IS NOT NULL 
  AND brand_id IS NULL
GROUP BY "tenantId", brand_text
ORDER BY "tenantId", product_count DESC
LIMIT 10;

-- ============================================
-- Step 6: Add unique constraint (after manual review)
-- ============================================
-- WARNING: Only run this after reviewing unmatched data!
-- CREATE UNIQUE INDEX IF NOT EXISTS brands_tenant_name_unique_idx 
-- ON brands(tenant_id, name);

-- ============================================
-- Step 7: Add index for performance
-- ============================================
CREATE INDEX IF NOT EXISTS products_brand_id_idx 
ON products(brand_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify all products with brand now have brand_id
SELECT 
  'Brand Migration Verification' as status,
  CASE 
    WHEN COUNT(*) FILTER (WHERE brand_text IS NOT NULL AND brand_id IS NULL) = 0 
    THEN 'SUCCESS - All products with brand have brand_id'
    ELSE 'WARNING - Some products still need migration'
  END as verification_result,
  COUNT(*) FILTER (WHERE brand_text IS NOT NULL) as total_with_brand,
  COUNT(*) FILTER (WHERE brand_id IS NOT NULL) as total_with_brand_id,
  COUNT(*) FILTER (WHERE brand_text IS NOT NULL AND brand_id IS NULL) as remaining
FROM products;

-- Show brands table stats per tenant
SELECT 
  b.tenant_id,
  COUNT(*) as total_brands,
  COUNT(*) FILTER (WHERE b.is_active = true) as active_brands,
  COUNT(*) FILTER (WHERE b.is_active = false) as inactive_brands
FROM brands b
GROUP BY b.tenant_id
ORDER BY b.tenant_id;

-- Sample of migrated data
SELECT 
  p.id,
  p."tenantId",
  p.code,
  p.name as product_name,
  p.brand_text as original_brand_text,
  p.brand_id,
  b.name as brand_name_from_table
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.brand_text IS NOT NULL
ORDER BY p."tenantId", p.code
LIMIT 10;

-- ============================================
-- CLEANUP (Optional - after verification)
-- ============================================
-- Drop the consolidation function
-- DROP FUNCTION IF EXISTS consolidate_duplicate_brands();

-- Drop the brand_text column (after verification and app update)
-- ALTER TABLE products DROP COLUMN IF EXISTS brand_text;

SELECT 'TASK 9 COMPLETED' as status, NOW() as completed_at;