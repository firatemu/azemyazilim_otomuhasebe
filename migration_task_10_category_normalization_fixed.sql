-- ============================================
-- TASK10: Normalize Category Data and Remove Duplicates
-- ============================================

-- ============================================
-- Step 1: Identify and Create Mapping Table for Duplicate Categories
-- ============================================

-- Create temporary table to track duplicate categories
CREATE TEMP TABLE category_duplicates AS
SELECT 
  kategori_adi as category_name,
  string_agg(DISTINCT id, ',') as category_ids,
  COUNT(*) as count
FROM categories
WHERE "tenantId" IS NOT NULL
GROUP BY "tenantId", kategori_adi
HAVING COUNT(*) > 1;

-- Show duplicates found
SELECT 
  'Duplicate Categories Found' as status,
  COUNT(*) as duplicate_count
FROM category_duplicates;

-- Display duplicate details
SELECT 
  category_name,
  category_ids,
  count as duplicate_count
FROM category_duplicates
ORDER BY count DESC;

-- ============================================
-- Step 2: Consolidate Duplicate Categories
-- ============================================

-- Create a function to consolidate categories
CREATE OR REPLACE FUNCTION consolidate_duplicate_categories() RETURNS INTEGER AS $$
DECLARE
  duplicate RECORD;
  category_ids_array TEXT[];
  first_category_id TEXT;
  category_id_to_remove TEXT;
  updated_count INTEGER := 0;
BEGIN
  FOR duplicate IN 
    SELECT 
      string_agg(DISTINCT id, ',') as category_ids,
      MIN(id) as first_id
    FROM categories
    WHERE "tenantId" IS NOT NULL
    GROUP BY "tenantId", kategori_adi
    HAVING COUNT(*) > 1
  LOOP
    category_ids_array := regexp_split_to_array(duplicate.category_ids, ',');
    first_category_id := duplicate.first_id;
    
    -- Loop through remaining IDs and update products
    FOR i IN 2..array_length(category_ids_array, 1) LOOP
      category_id_to_remove := category_ids_array[i];
      
      -- Update products to use the first category ID
      UPDATE stoklar 
      SET "kategoriId" = first_category_id 
      WHERE "kategoriId" = category_id_to_remove;
      
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      updated_count := updated_count + updated_count;
      
      -- Delete the duplicate category
      DELETE FROM categories WHERE id = category_id_to_remove;
    END LOOP;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 3: Run the Consolidation Function
-- ============================================
-- Uncomment to run:
-- SELECT consolidate_duplicate_categories();

-- ============================================
-- Step 4: Add Unique Constraint
-- ============================================
-- First, ensure all duplicates are removed
-- Then add unique constraint
ALTER TABLE categories 
DROP CONSTRAINT IF EXISTS categories_kategori_adi_key;

ALTER TABLE categories 
ADD CONSTRAINT categories_tenant_kategori_unique 
UNIQUE ("tenantId", kategori_adi);

-- ============================================
-- Step 5: Add Index for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS categories_tenant_idx ON categories("tenantId");

CREATE INDEX IF NOT EXISTS categories_tenant_kategori_idx ON categories("tenantId", kategori_adi);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check for remaining duplicates
SELECT 
  'Remaining Duplicates' as check,
  COUNT(*) as duplicate_count
FROM (
  SELECT kategori_adi, "tenantId", COUNT(*) 
  FROM categories 
  WHERE "tenantId" IS NOT NULL
  GROUP BY "tenantId", kategori_adi 
  HAVING COUNT(*) > 1
) t;

-- Verify unique constraint
SELECT 
  constraint_name,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'categories'
  AND constraint_type = 'UNIQUE';

-- Show category statistics
SELECT 
  'Category Statistics' as report,
  COUNT(*) as total_categories,
  COUNT(DISTINCT "tenantId") as tenants_with_categories
FROM categories;

-- Show categories per tenant
SELECT 
  "tenantId" as tenant_id,
  COUNT(*) as category_count
FROM categories
WHERE "tenantId" IS NOT NULL
GROUP BY "tenantId"
ORDER BY category_count DESC;

-- Check products with NULL category
SELECT 
  'Products without Category' as check,
  COUNT(*) as product_count
FROM stoklar
WHERE "kategoriId" IS NULL;

SELECT 'TASK 10 COMPLETED' as status, NOW() as completed_at;