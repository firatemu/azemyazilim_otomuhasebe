-- ============================================
-- TASK9: Normalize Brand Data and Remove Duplicates
-- ============================================

-- ============================================
-- Step 1: Identify and Create Mapping Table for Duplicate Brands
-- ============================================

-- Create temporary table to track duplicate brands
CREATE TEMP TABLE brand_duplicates AS
SELECT 
  unvan as brand_name,
  string_agg(DISTINCT id, ',') as brand_ids,
  COUNT(*) as count
FROM brands
WHERE "tenantId" IS NOT NULL
GROUP BY "tenantId", unvan
HAVING COUNT(*) > 1;

-- Show duplicates found
SELECT 
  'Duplicate Brands Found' as status,
  COUNT(*) as duplicate_count
FROM brand_duplicates;

-- Display duplicate details
SELECT 
  brand_name,
  brand_ids,
  count as duplicate_count
FROM brand_duplicates
ORDER BY count DESC;

-- ============================================
-- Step 2: Consolidate Duplicate Brands
-- ============================================

-- For each duplicate, keep the first ID and update products
-- This is a manual process, so we create a script to do it

-- Example for specific duplicate (replace with actual IDs):
-- UPDATE stoklar SET "markaId" = 'first_brand_id' WHERE "markaId" IN ('second_brand_id', 'third_brand_id');

-- For automation, we can create a migration script:
-- Create a function to consolidate brands
CREATE OR REPLACE FUNCTION consolidate_duplicate_brands() RETURNS INTEGER AS $$
DECLARE
  duplicate RECORD;
  brand_ids_array TEXT[];
  first_brand_id TEXT;
  brand_id_to_remove TEXT;
  updated_count INTEGER := 0;
BEGIN
  FOR duplicate IN 
    SELECT 
      string_agg(DISTINCT id, ',') as brand_ids,
      MIN(id) as first_id
    FROM brands
    WHERE "tenantId" IS NOT NULL
    GROUP BY "tenantId", unvan
    HAVING COUNT(*) > 1
  LOOP
    brand_ids_array := regexp_split_to_array(duplicate.brand_ids, ',');
    first_brand_id := duplicate.first_id;
    
    -- Loop through remaining IDs and update products
    FOR i IN 2..array_length(brand_ids_array, 1) LOOP
      brand_id_to_remove := brand_ids_array[i];
      
      -- Update products to use the first brand ID
      UPDATE stoklar 
      SET "markaId" = first_brand_id 
      WHERE "markaId" = brand_id_to_remove;
      
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      updated_count := updated_count + updated_count;
      
      -- Delete the duplicate brand
      DELETE FROM brands WHERE id = brand_id_to_remove;
    END LOOP;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 3: Run the Consolidation Function
-- ============================================
-- Uncomment to run:
-- SELECT consolidate_duplicate_brands();

-- ============================================
-- Step 4: Add Unique Constraint
-- ============================================
-- First, ensure all duplicates are removed
-- Then add unique constraint
ALTER TABLE brands 
DROP CONSTRAINT IF EXISTS brands_unvan_key;

ALTER TABLE brands 
ADD CONSTRAINT brands_tenant_unvan_unique 
UNIQUE ("tenantId", unvan);

-- ============================================
-- Step 5: Add Index for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS brands_tenant_idx ON brands("tenantId");

CREATE INDEX IF NOT EXISTS brands_tenant_unvan_idx ON brands("tenantId", unvan);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check for remaining duplicates
SELECT 
  'Remaining Duplicates' as check,
  COUNT(*) as duplicate_count
FROM (
  SELECT unvan, "tenantId", COUNT(*) 
  FROM brands 
  WHERE "tenantId" IS NOT NULL
  GROUP BY "tenantId", unvan 
  HAVING COUNT(*) > 1
) t;

-- Verify unique constraint
SELECT 
  constraint_name,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'brands'
  AND constraint_type = 'UNIQUE';

-- Show brand statistics
SELECT 
  'Brand Statistics' as report,
  COUNT(*) as total_brands,
  COUNT(DISTINCT "tenantId") as tenants_with_brands
FROM brands;

-- Show brands per tenant
SELECT 
  "tenantId" as tenant_id,
  COUNT(*) as brand_count
FROM brands
WHERE "tenantId" IS NOT NULL
GROUP BY "tenantId"
ORDER BY brand_count DESC;

SELECT 'TASK 9 COMPLETED' as status, NOW() as completed_at;