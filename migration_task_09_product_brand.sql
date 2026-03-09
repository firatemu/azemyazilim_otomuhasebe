-- ============================================
-- TASK 9: Normalize Product.brand Field
-- ============================================

-- ============================================
-- STEP 1: Add brandId column
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- ============================================
-- STEP 2: Add indexes
-- ============================================
CREATE INDEX IF NOT EXISTS products_tenant_brand_idx ON products(tenant_id, brand_id);
CREATE INDEX IF NOT EXISTS products_brand_text_idx ON products(brand);

-- ============================================
-- STEP 3: Migrate data - Match brands by name (Exact match)
-- ============================================
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE p.brand_id IS NULL 
  AND p.brand IS NOT NULL
  AND TRIM(p.brand) != ''
  AND b.tenant_id IS NULL  -- Match with system/global brands
  AND LOWER(TRIM(p.brand)) = LOWER(TRIM(b.name));

-- ============================================
-- STEP 4: Create missing brands for unmatched products
-- ============================================
INSERT INTO brands (id, name, code, is_active, created_at)
SELECT 
    gen_random_uuid() AS id,
    UPPER(TRIM(p.brand)) AS name,
    UPPER(TRIM(p.brand)) AS code,
    true AS is_active,
    NOW() AS created_at
FROM products p
WHERE p.brand IS NOT NULL 
  AND TRIM(p.brand) != ''
  AND p.brand_id IS NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM brands b 
    WHERE b.tenant_id IS NULL 
      AND LOWER(TRIM(p.brand)) = LOWER(TRIM(b.name))
  )
ON CONFLICT (name, tenant_id) DO NOTHING;

-- ============================================
-- STEP 5: Link products to newly created brands
-- ============================================
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE p.brand_id IS NULL 
  AND p.brand IS NOT NULL
  AND TRIM(p.brand) != ''
  AND b.tenant_id IS NULL
  AND LOWER(TRIM(p.brand)) = LOWER(TRIM(b.name));

-- ============================================
-- STEP 6: Verify migration
-- ============================================
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN brand IS NOT NULL THEN 1 END) AS products_with_brand_text,
    COUNT(CASE WHEN brand_id IS NOT NULL THEN 1 END) AS products_with_brand_id,
    COUNT(CASE WHEN brand IS NOT NULL AND brand_id IS NULL THEN 1 END) AS unmatched_products,
    COUNT(CASE WHEN brand IS NULL AND brand_id IS NULL THEN 1 END) AS products_without_brand
FROM products;

-- Show unmatched brands for manual review
SELECT 
    brand AS brand_text,
    COUNT(*) AS product_count
FROM products
WHERE brand IS NOT NULL 
  AND TRIM(brand) != ''
  AND brand_id IS NULL
GROUP BY brand
ORDER BY product_count DESC
LIMIT 20;

-- ============================================
-- STEP 7: Rename brand column to brand_text (keep for reference)
-- ============================================
ALTER TABLE products RENAME COLUMN brand TO brand_text;

-- ============================================
-- Summary
-- ============================================
SELECT 
    'TASK 9 COMPLETED' AS status,
    (SELECT COUNT(*) FROM products WHERE brand_id IS NOT NULL) AS products_with_brand_id,
    (SELECT COUNT(*) FROM brands WHERE tenant_id IS NULL) AS total_brands;