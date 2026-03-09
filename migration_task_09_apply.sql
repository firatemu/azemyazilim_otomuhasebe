-- ============================================
-- TASK 9: Fix Product.brand Duplication
-- ============================================

-- ============================================
-- STEP 1: Add brand_id column to products
-- ============================================
ALTER TABLE products 
ADD COLUMN brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL;

-- ============================================
-- STEP 2: Add index
-- ============================================
CREATE INDEX products_brand_id_idx ON products(brand_id);
CREATE INDEX products_tenant_brand_idx ON products(tenant_id, brand_id);

-- ============================================
-- STEP 3: Verify
-- ============================================
SELECT 
    'TASK 9 COMPLETED' AS status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_id') AS brand_id_exists,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_text') AS brand_text_exists;