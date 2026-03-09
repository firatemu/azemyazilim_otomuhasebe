-- ============================================
-- TASK 10: Normalize Product.category Field
-- ============================================

-- ============================================
-- STEP 1: Rename category to category_text
-- ============================================
ALTER TABLE products RENAME COLUMN category TO category_text;

-- ============================================
-- STEP 2: Add index for category_text
-- ============================================
CREATE INDEX IF NOT EXISTS products_category_text_idx ON products(category_text);

-- ============================================
-- STEP 3: Analyze category data
-- ============================================
SELECT 
    category_text AS category,
    COUNT(*) AS product_count
FROM products
WHERE category_text IS NOT NULL 
  AND TRIM(category_text) != ''
GROUP BY category_text
ORDER BY product_count DESC
LIMIT 30;

-- ============================================
-- STEP 4: Verify migration
-- ============================================
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN category_text IS NOT NULL THEN 1 END) AS products_with_category_text,
    COUNT(CASE WHEN main_category IS NOT NULL THEN 1 END) AS products_with_main_category,
    COUNT(CASE WHEN sub_category IS NOT NULL THEN 1 END) AS products_with_sub_category
FROM products;

-- ============================================
-- Summary
-- ============================================
SELECT 
    'TASK 10 COMPLETED' AS status,
    (SELECT COUNT(*) FROM products WHERE category_text IS NOT NULL) AS products_with_category_text,
    (SELECT COUNT(*) FROM products WHERE main_category IS NOT NULL) AS products_with_main_category;
