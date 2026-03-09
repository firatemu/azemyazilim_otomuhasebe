-- ============================================
-- TASK 13: Add Missing tenantId Columns for RLS
-- ============================================

-- ============================================
-- CRITICAL: account_movements (Financial Data)
-- ============================================
ALTER TABLE account_movements 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX am_tenant_idx ON account_movements(tenant_id);

-- Migrate data: Get tenant_id from account
UPDATE account_movements am
SET tenant_id = (
    SELECT tenant_id 
    FROM accounts 
    WHERE id = am.account_id
);

ALTER TABLE account_movements ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- HIGH: product_movements (Inventory Data)
-- ============================================
ALTER TABLE product_movements 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX pm_tenant_idx ON product_movements(tenant_id);

-- Migrate data: Get tenant_id from product
UPDATE product_movements pm
SET tenant_id = (
    SELECT tenant_id 
    FROM products 
    WHERE id = pm.product_id
);

ALTER TABLE product_movements ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- HIGH: stock_moves (Inventory Data)
-- ============================================
ALTER TABLE stock_moves 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX sm_tenant_idx ON stock_moves(tenant_id);

-- Migrate data: Get tenant_id from product
UPDATE stock_moves sm
SET tenant_id = (
    SELECT tenant_id 
    FROM products 
    WHERE id = sm.product_id
);

ALTER TABLE stock_moves ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- LOW: units (System/Global Table - Nullable)
-- ============================================
ALTER TABLE units 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX units_tenant_idx ON units(tenant_id);

-- Keep as nullable for system/global units
-- Existing units remain NULL (system/global)

-- ============================================
-- Verification
-- ============================================
SELECT 
    'account_movements' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) AS with_tenant_id,
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) AS without_tenant_id
FROM account_movements

UNION ALL

SELECT 
    'product_movements',
    COUNT(*),
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END)
FROM product_movements

UNION ALL

SELECT 
    'stock_moves',
    COUNT(*),
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END)
FROM stock_moves

UNION ALL

SELECT 
    'units',
    COUNT(*),
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END)
FROM units;

-- ============================================
-- Summary
-- ============================================
SELECT 
    'TASK 13 COMPLETED' AS status;