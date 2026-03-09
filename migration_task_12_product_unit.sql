-- ============================================
-- TASK 12: Fix Product.unit Duplication
-- ============================================

-- ============================================
-- STEP 1: Add unit_id column
-- ============================================
ALTER TABLE products 
ADD COLUMN unit_id UUID REFERENCES units(id) ON DELETE SET NULL;

-- ============================================
-- STEP 2: Add index
-- ============================================
CREATE INDEX IF NOT EXISTS products_tenant_unit_idx ON products(tenant_id, unit_id);

-- ============================================
-- STEP 3: Analyze unit data
-- ============================================
SELECT 
    unit AS unit_text,
    COUNT(*) AS product_count
FROM products
WHERE unit IS NOT NULL 
  AND TRIM(unit) != ''
GROUP BY unit
ORDER BY product_count DESC
LIMIT 20;

-- ============================================
-- STEP 4: Migrate data - Match units by name
-- ============================================
UPDATE products p
SET unit_id = u.id
FROM units u
WHERE p.unit_id IS NULL 
  AND p.unit IS NOT NULL
  AND TRIM(p.unit) != ''
  AND u.tenant_id IS NULL
  AND LOWER(TRIM(p.unit)) = LOWER(TRIM(u.name));

-- ============================================
-- STEP 5: Verify migration
-- ============================================
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN unit IS NOT NULL THEN 1 END) AS products_with_unit_text,
    COUNT(CASE WHEN unit_id IS NOT NULL THEN 1 END) AS products_with_unit_id
FROM products;

-- ============================================
-- STEP 6: Rename unit column to unit_text
-- ============================================
ALTER TABLE products RENAME COLUMN unit TO unit_text;

-- ============================================
-- Summary
-- ============================================
SELECT 
    'TASK 12 COMPLETED' AS status,
    (SELECT COUNT(*) FROM products WHERE unit_text IS NOT NULL) AS products_with_unit_text,
    (SELECT COUNT(*) FROM products WHERE unit_id IS NOT NULL) AS products_with_unit_id;