-- ============================================
-- CREATE MISSING CORPORATE TABLES
-- ============================================

-- ============================================
-- TABLE 1: brands
-- ============================================
CREATE TABLE brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes for brands
CREATE INDEX brands_tenant_id_idx ON brands(tenant_id);
CREATE INDEX brands_name_idx ON brands(name);
CREATE INDEX brands_code_idx ON brands(code);
CREATE INDEX brands_is_active_idx ON brands(is_active);

-- ============================================
-- TABLE 2: categories
-- ============================================
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT,
    main_category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes for categories
CREATE INDEX categories_tenant_id_idx ON categories(tenant_id);
CREATE INDEX categories_main_category_id_idx ON categories(main_category_id);
CREATE INDEX categories_name_idx ON categories(name);
CREATE INDEX categories_code_idx ON categories(code);
CREATE INDEX categories_is_active_idx ON categories(is_active);

-- ============================================
-- TABLE 3: product_vehicle_compatibilities
-- ============================================
CREATE TABLE product_vehicle_compatibilities (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    start_year INTEGER,
    end_year INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT unique_product_vehicle UNIQUE (product_id, brand_id, model, start_year, end_year)
);

-- Indexes for product_vehicle_compatibilities
CREATE INDEX pvc_tenant_id_idx ON product_vehicle_compatibilities(tenant_id);
CREATE INDEX pvc_product_id_idx ON product_vehicle_compatibilities(product_id);
CREATE INDEX pvc_brand_id_idx ON product_vehicle_compatibilities(brand_id);
CREATE INDEX pvc_tenant_brand_model_idx ON product_vehicle_compatibilities(tenant_id, brand_id, model);
CREATE INDEX pvc_is_active_idx ON product_vehicle_compatibilities(is_active);

-- ============================================
-- Verification
-- ============================================
SELECT 
    'brands' AS table_name,
    COUNT(*) AS total_rows
FROM brands

UNION ALL

SELECT 
    'categories',
    COUNT(*)
FROM categories

UNION ALL

SELECT 
    'product_vehicle_compatibilities',
    COUNT(*)
FROM product_vehicle_compatibilities;

-- ============================================
-- Summary
-- ============================================
SELECT 
    'ALL MISSING TABLES CREATED SUCCESSFULLY' AS status;