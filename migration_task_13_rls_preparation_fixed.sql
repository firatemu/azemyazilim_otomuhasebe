-- ============================================
-- TASK13: Prepare for Row-Level Security (RLS)
-- ============================================

-- This script prepares the database for RLS implementation
-- RLS will be enabled later after testing

-- ============================================
-- Step 1: Verify all tables have tenant_id (or tenantId) column
-- ============================================

-- Check for tables without tenant isolation
SELECT 
  table_name,
  'Missing tenant_id' as issue
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name NOT IN (
    'tenants', 'users', 'roles', 'permissions', 
    'audit_logs', 'license_keys', 'tenant_settings',
    '_prisma_migrations', 'migration_lock'
  )
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT IN (
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name IN ('tenant_id', 'tenantId')
  )
ORDER BY table_name;

-- ============================================
-- Step 2: Create RLS Policy Helper Functions
-- ============================================

-- Function to check if current user has access to tenant data
CREATE OR REPLACE FUNCTION current_user_has_tenant_access(target_tenant_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super admins can access all tenants
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_setting('app.current_user_id', true)::TEXT
      AND role IN ('SUPER_ADMIN', 'SUPPORT')
  ) THEN
    RETURN true;
  END IF;
  
  -- Regular users can only access their own tenant
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_setting('app.current_user_id', true)::TEXT
      AND tenant_id = target_tenant_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION current_user_tenant_id()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM users 
    WHERE id = current_setting('app.current_user_id', true)::TEXT
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = current_setting('app.current_user_id', true)::TEXT
      AND role IN ('SUPER_ADMIN', 'SUPPORT')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 3: Create Indexes for All tenant_id Columns
-- ============================================

-- Create indexes for all tables with tenant_id for RLS performance
-- This ensures RLS queries are efficient

-- Faturalar
CREATE INDEX IF NOT EXISTS faturalar_rls_tenant_idx 
ON faturalar("tenantId");

-- Stoklar
CREATE INDEX IF NOT EXISTS stoklar_rls_tenant_idx 
ON stoklar("tenantId");

-- Cariler
CREATE INDEX IF NOT EXISTS cariler_rls_tenant_idx 
ON cariler("tenantId");

-- MasrafKategori
CREATE INDEX IF NOT EXISTS masraf_kategoriler_rls_tenant_idx 
ON masraf_kategoriler(tenant_id);

-- PriceCard
CREATE INDEX IF NOT EXISTS price_cards_rls_tenant_idx 
ON price_cards(tenant_id);

-- FaturaKalemi
CREATE INDEX IF NOT EXISTS fatura_kalemleri_rls_tenant_idx 
ON fatura_kalemleri(tenant_id);

-- SiparisKalemi
CREATE INDEX IF NOT EXISTS siparis_kalemleri_rls_tenant_idx 
ON siparis_kalemleri(tenant_id);

-- WorkOrderLine
CREATE INDEX IF NOT EXISTS work_order_lines_rls_tenant_idx 
ON work_order_lines(tenant_id);

-- ProductBarcode
CREATE INDEX IF NOT EXISTS product_barcodes_rls_tenant_idx 
ON product_barcodes(tenant_id);

-- StockMove
CREATE INDEX IF NOT EXISTS stock_moves_rls_tenant_idx 
ON stock_moves(tenant_id);

-- ProductLocationStock
CREATE INDEX IF NOT EXISTS product_location_stocks_rls_tenant_idx 
ON product_location_stocks(tenant_id);

-- StockCostHistory
CREATE INDEX IF NOT EXISTS stock_cost_history_rls_tenant_idx 
ON stock_cost_history(tenant_id);

-- KasaHareket
CREATE INDEX IF NOT EXISTS kasa_hareketler_rls_tenant_idx 
ON kasa_hareketler("tenantId");

-- BankaHesapHareket
CREATE INDEX IF NOT EXISTS banka_hesap_hareketler_rls_tenant_idx 
ON banka_hesap_hareketler("createdAt");

-- ============================================
-- Step 4: Create View for Audit Trail
-- ============================================

-- Create a view that shows RLS audit information
CREATE OR REPLACE VIEW rls_audit_view AS
SELECT 
  'faturalar' as table_name,
  COUNT(*) as total_rows,
  COUNT(DISTINCT "tenantId") as tenant_count
FROM faturalar
UNION ALL
SELECT 
  'stoklar',
  COUNT(*),
  COUNT(DISTINCT "tenantId")
FROM stoklar
UNION ALL
SELECT 
  'cariler',
  COUNT(*),
  COUNT(DISTINCT "tenantId")
FROM cariler
UNION ALL
SELECT 
  'masraf_kategoriler',
  COUNT(*),
  COUNT(DISTINCT tenant_id)
FROM masraf_kategoriler
UNION ALL
SELECT 
  'price_cards',
  COUNT(*),
  COUNT(DISTINCT tenant_id)
FROM price_cards
UNION ALL
SELECT 
  'fatura_kalemleri',
  COUNT(*),
  COUNT(DISTINCT tenant_id)
FROM fatura_kalemleri
UNION ALL
SELECT 
  'siparis_kalemleri',
  COUNT(*),
  COUNT(DISTINCT tenant_id)
FROM siparis_kalemleri
UNION ALL
SELECT 
  'work_order_lines',
  COUNT(*),
  COUNT(DISTINCT tenant_id)
FROM work_order_lines
UNION ALL
SELECT 
  'product_barcodes',
  COUNT(*),
  COUNT(DISTINCT tenant_id)
FROM product_barcodes
UNION ALL
SELECT 
  'stock_moves',
  COUNT(*),
  COUNT(DISTINCT tenant_id)
FROM stock_moves
UNION ALL
SELECT 
  'product_location_stocks',
  COUNT(*),
  COUNT(DISTINCT tenant_id)
FROM product_location_stocks
UNION ALL
SELECT 
  'stock_cost_history',
  COUNT(*),
  COUNT(DISTINCT tenant_id)
FROM stock_cost_history;

-- ============================================
-- Step 5: Create RLS Policy Templates (For Future Use)
-- ============================================

-- These are template policies that can be enabled later
-- Do NOT enable RLS yet - this is just preparation

-- Template for tables with tenantId (quoted)
CREATE OR REPLACE POLICY tenant_isolation_policy_template_tenantid
ON faturalar
FOR ALL
TO authenticated
USING (
  "tenantId" = current_user_tenant_id() OR is_super_admin()
)
WITH CHECK (
  "tenantId" = current_user_tenant_id() OR is_super_admin()
);

-- Template for tables with tenant_id (unquoted)
CREATE OR REPLACE POLICY tenant_isolation_policy_template_tenantid_lower
ON masraf_kategoriler
FOR ALL
TO authenticated
USING (
  tenant_id = current_user_tenant_id() OR is_super_admin()
)
WITH CHECK (
  tenant_id = current_user_tenant_id() OR is_super_admin()
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS preparation status
SELECT 
  'RLS Preparation Status' as status,
  NOW() as timestamp;

-- Check tenant_id columns
SELECT 
  'Tables with tenant isolation' as check,
  COUNT(DISTINCT table_name) as table_count
FROM information_schema.columns
WHERE column_name IN ('tenant_id', 'tenantId')
  AND table_schema = 'public';

-- Check RLS indexes
SELECT 
  'RLS Indexes Created' as check,
  COUNT(*) as index_count
FROM pg_indexes
WHERE indexname LIKE '%_rls_tenant_idx'
  AND schemaname = 'public';

-- Check RLS functions
SELECT 
  'RLS Functions Created' as check,
  COUNT(*) as function_count
FROM pg_proc
WHERE proname LIKE '%tenant%'
  OR proname LIKE '%super_admin%';

-- Show audit view
SELECT * FROM rls_audit_view ORDER BY table_name;

-- Check for tables without tenant isolation (should be empty)
SELECT 
  'Tables Without Tenant Isolation' as issue,
  COUNT(*) as count
FROM (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name NOT IN (
      'tenants', 'users', 'roles', 'permissions', 
      'audit_logs', 'license_keys', 'tenant_settings',
      '_prisma_migrations', 'migration_lock',
      'rls_audit_view', 'brand_duplicates', 'category_duplicates', 'unit_duplicates',
      'unit_standardization'
    )
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT IN (
      SELECT table_name 
      FROM information_schema.columns 
      WHERE column_name IN ('tenant_id', 'tenantId')
    )
) t;

SELECT 'TASK 13 COMPLETED' as status, NOW() as completed_at;

-- ============================================
-- IMPORTANT: RLS IS NOT YET ENABLED
-- ============================================
-- To enable RLS later, run:
-- ALTER TABLE faturalar ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE stoklar ENABLE ROW LEVEL SECURITY;
-- ... for each table

-- Then apply policies:
-- DROP POLICY IF EXISTS tenant_isolation_policy_template_tenantid ON faturalar;
-- CREATE POLICY tenant_isolation_policy ON faturalar
--   FOR ALL TO authenticated
--   USING ("tenantId" = current_user_tenant_id() OR is_super_admin())
--   WITH CHECK ("tenantId" = current_user_tenant_id() OR is_super_admin());