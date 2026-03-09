-- ============================================
-- TASK 10: Normalize Product Table - Category (Hierarchical)
-- ============================================
-- Convert category fields (main_category, sub_category, category_text) to category_id (FK to categories)
-- ============================================

-- ============================================
-- Step 1: Drop and recreate category_id column (TEXT to match categories.id)
-- ============================================
-- Drop existing UUID column if exists
ALTER TABLE products 
DROP COLUMN IF EXISTS category_id;

-- Add TEXT column to match categories.id
ALTER TABLE products 
ADD COLUMN category_id TEXT;

-- ============================================
-- Step 2: Add foreign key constraint
-- ============================================
ALTER TABLE products 
ADD CONSTRAINT products_category_fk 
FOREIGN KEY (category_id) REFERENCES categories(id);

-- ============================================
-- Step 3: Check if categories table exists and create indexes
-- ============================================
-- Ensure categories table has proper indexes for migration
CREATE INDEX IF NOT EXISTS categories_tenant_id_idx ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS categories_name_idx ON categories(name);

-- ============================================
-- Step 4: Analyze current category data
-- ============================================
-- Count products with category information
SELECT 
  'Category Data Analysis' as status,
  COUNT(*) FILTER (WHERE main_category IS NOT NULL) as products_with_main_category,
  COUNT(*) FILTER (WHERE sub_category IS NOT NULL) as products_with_sub_category,
  COUNT(*) FILTER (WHERE category_text IS NOT NULL) as products_with_category_text,
  COUNT(*) FILTER (WHERE category_id IS NOT NULL) as products_with_category_id,
  COUNT(DISTINCT main_category) FILTER (WHERE main_category IS NOT NULL) as unique_main_categories,
  COUNT(DISTINCT sub_category) FILTER (WHERE sub_category IS NOT NULL) as unique_sub_categories,
  COUNT(DISTINCT category_text) FILTER (WHERE category_text IS NOT NULL) as unique_categories
FROM products;

-- Show sample of categories needing migration (main_category only)
SELECT 
  "tenantId",
  main_category,
  COUNT(*) as product_count
FROM products
WHERE main_category IS NOT NULL 
GROUP BY "tenantId", main_category
ORDER BY "tenantId", product_count DESC
LIMIT 20;

-- ============================================
-- Step 5: Drop existing function if exists
-- ============================================
DROP FUNCTION IF EXISTS consolidate_duplicate_categories();

-- ============================================
-- Step 6: Create function to consolidate categories
-- ============================================
CREATE OR REPLACE FUNCTION consolidate_duplicate_categories()
RETURNS TABLE(
  ret_tenant_id TEXT,
  ret_main_cat TEXT,
  ret_sub_cat TEXT,
  ret_cat_text TEXT,
  ret_category_id TEXT,
  ret_products_affected INT
) AS $$
DECLARE
  cat_record RECORD;
  cat_id_value TEXT;
  products_count INT;
BEGIN
  -- For each unique main_category per tenant
  FOR cat_record IN 
    SELECT 
      "tenantId", 
      main_category, 
      sub_category, 
      category_text,
      COUNT(*) as cnt
    FROM products p
    WHERE p.main_category IS NOT NULL
    GROUP BY "tenantId", main_category, sub_category, category_text
    ORDER BY "tenantId", main_category, sub_category, category_text
  LOOP
    -- Try to find existing category
    SELECT id INTO cat_id_value
    FROM categories c
    WHERE c.tenant_id = cat_record."tenantId"
      AND c.name = cat_record.main_category
    LIMIT 1;
    
    -- If not exists, create it
    IF cat_id_value IS NULL THEN
      INSERT INTO categories (id, tenant_id, name, is_active, created_at, updated_at)
      VALUES (gen_random_uuid()::TEXT, cat_record."tenantId", cat_record.main_category, true, NOW(), NOW())
      RETURNING id INTO cat_id_value;
    END IF;
    
    -- Update products
    UPDATE products
    SET category_id = cat_id_value
    WHERE "tenantId" = cat_record."tenantId"
      AND main_category = cat_record.main_category
      AND COALESCE(sub_category, '') = COALESCE(cat_record.sub_category, '')
      AND COALESCE(category_text, '') = COALESCE(cat_record.category_text, '')
      AND category_id IS NULL;
    
    GET DIAGNOSTICS products_count = ROW_COUNT;
    
    -- Return result
    RETURN QUERY SELECT 
      cat_record."tenantId" as ret_tenant_id,
      cat_record.main_category as ret_main_cat,
      cat_record.sub_category as ret_sub_cat,
      cat_record.category_text as ret_cat_text,
      cat_id_value as ret_category_id,
      products_count as ret_products_affected;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 7: Execute category consolidation
-- ============================================
-- Run consolidation function
SELECT * FROM consolidate_duplicate_categories();

-- ============================================
-- Step 8: Verify migration results
-- ============================================
-- Count after migration
SELECT 
  'Category Migration Results' as status,
  COUNT(*) FILTER (WHERE main_category IS NOT NULL) as products_with_main_category,
  COUNT(*) FILTER (WHERE sub_category IS NOT NULL) as products_with_sub_category,
  COUNT(*) FILTER (WHERE category_text IS NOT NULL) as products_with_category_text,
  COUNT(*) FILTER (WHERE category_id IS NOT NULL) as products_with_category_id,
  COUNT(*) FILTER (WHERE main_category IS NOT NULL AND category_id IS NULL) as products_still_needing_migration
FROM products;

-- Show unmatched categories (if any)
SELECT 
  "tenantId",
  main_category,
  sub_category,
  category_text,
  COUNT(*) as product_count
FROM products
WHERE main_category IS NOT NULL 
  AND category_id IS NULL
GROUP BY "tenantId", main_category, sub_category, category_text
ORDER BY "tenantId", product_count DESC
LIMIT 10;

-- ============================================
-- Step 9: Add index for performance
-- ============================================
CREATE INDEX IF NOT EXISTS products_category_id_idx 
ON products(category_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show categories table stats per tenant
SELECT 
  c.tenant_id,
  COUNT(*) as total_categories,
  COUNT(*) FILTER (WHERE c.is_active = true) as active_categories
FROM categories c
GROUP BY c.tenant_id
ORDER BY c.tenant_id;

-- Sample of migrated data
SELECT 
  p.id,
  p."tenantId",
  p.code,
  p.name as product_name,
  p.main_category,
  p.sub_category,
  p.category_text,
  p.category_id,
  c.name as category_name_from_table
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.main_category IS NOT NULL
ORDER BY p."tenantId", p.code
LIMIT 10;

-- ============================================
-- CLEANUP (Optional - after verification)
-- ============================================
-- Drop consolidation function
-- DROP FUNCTION IF EXISTS consolidate_duplicate_categories();

-- Drop text columns (after verification and app update)
-- ALTER TABLE products DROP COLUMN IF EXISTS category_text;

SELECT 'TASK 10 COMPLETED' as status, NOW() as completed_at;