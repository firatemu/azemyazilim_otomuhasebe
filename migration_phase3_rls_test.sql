-- ============================================
-- Phase 3: Row Level Security (RLS) - Test Script
-- ============================================
-- Run this AFTER all RLS migrations are applied
-- This verifies tenant isolation is working correctly
-- ============================================

-- ============================================
-- Test 1: Test Tenant Isolation
-- ============================================
-- This simulates setting tenant context and querying data

-- Test: Set tenant_id for Tenant 1
SET LOCAL app.current_tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu';

-- Verify: Should see only Tenant 1's invoices
SELECT 'Test 1a: Tenant 1 invoices' as test_name, COUNT(*) as row_count
FROM invoices
WHERE "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu';

-- Test: Set tenant_id for different tenant (simulate)
SET LOCAL app.current_tenant_id = 'test-tenant-id';

-- Verify: Should see 0 rows (wrong tenant)
SELECT 'Test 1b: Wrong tenant invoices (should be 0)' as test_name, COUNT(*) as row_count
FROM invoices;

-- Reset to valid tenant
SET LOCAL app.current_tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu';

-- ============================================
-- Test 2: Test SUPER_ADMIN Access
-- ============================================
-- SUPER_ADMIN should be able to see users from all tenants

-- Test: Clear tenant context (SUPER_ADMIN mode)
SET LOCAL app.current_tenant_id = '';

-- Verify: SUPER_ADMIN should see all users
SELECT 'Test 2: SUPER_ADMIN user access (without tenant filter)' as test_name, COUNT(*) as row_count
FROM users
WHERE role = 'SUPER_ADMIN';

-- Verify: SUPER_ADMIN should see all TENANT_ADMIN users
SELECT 'Test 2b: SUPER_ADMIN sees all tenant admins' as test_name, COUNT(*) as row_count
FROM users
WHERE role = 'TENANT_ADMIN';

-- ============================================
-- Test 3: Test User Table Isolation
-- ============================================
-- Regular users should only see users in their tenant

-- Test: Set tenant context
SET LOCAL app.current_tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu';

-- Verify: Should see only users in this tenant
SELECT 'Test 3: Regular user sees only their tenant users' as test_name, COUNT(*) as row_count
FROM users
WHERE role NOT IN ('SUPER_ADMIN', 'SUPPORT');

-- ============================================
-- Test 4: Test Role Table Access
-- ============================================
-- System roles should be visible to all tenants

-- Test: Set tenant context
SET LOCAL app.current_tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu';

-- Verify: Should see system roles
SELECT 'Test 4a: System roles visible to all tenants' as test_name, COUNT(*) as row_count
FROM roles
WHERE is_system_role = true;

-- Verify: Should see tenant-specific roles
SELECT 'Test 4b: Tenant-specific roles visible only in tenant' as test_name, COUNT(*) as row_count
FROM roles
WHERE is_system_role = false;

-- ============================================
-- Test 5: Test AuditLog Access
-- ============================================
-- Tenant-specific audit logs only visible within tenant

-- Test: Set tenant context
SET LOCAL app.current_tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu';

-- Verify: Should see only tenant audit logs (tenantId IS NOT NULL)
SELECT 'Test 5a: Tenant audit logs visible' as test_name, COUNT(*) as row_count
FROM audit_logs
WHERE tenantId IS NOT NULL;

-- Test: SUPER_ADMIN access to system logs
-- Note: This requires SUPER_ADMIN role check in application layer
-- RLS alone won't filter based on current user role
SELECT 'Test 5b: System audit logs count' as test_name, COUNT(*) as row_count
FROM audit_logs
WHERE tenantId IS NULL;

-- ============================================
-- Test 6: Test Cross-Table Isolation
-- ============================================
-- Verify related tables are properly isolated

-- Test: Products should be tenant-isolated
SET LOCAL app.current_tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu';

SELECT 'Test 6a: Products in tenant' as test_name, COUNT(*) as row_count
FROM products;

-- Test: Product movements should be tenant-isolated
SELECT 'Test 6b: Product movements in tenant' as test_name, COUNT(*) as row_count
FROM product_movements;

-- Test: Stock moves should be tenant-isolated
SELECT 'Test 6c: Stock moves in tenant' as test_name, COUNT(*) as row_count
FROM stock_moves;

-- ============================================
-- Test 7: Test Financial Tables Isolation
-- ============================================

-- Test: Account movements should be tenant-isolated
SELECT 'Test 7a: Account movements in tenant' as test_name, COUNT(*) as row_count
FROM account_movements;

-- Test: Cashbox movements should be tenant-isolated
SELECT 'Test 7b: Cashbox movements in tenant' as test_name, COUNT(*) as row_count
FROM cashbox_movements;

-- Test: Collections should be tenant-isolated
SELECT 'Test 7c: Collections in tenant' as test_name, COUNT(*) as row_count
FROM collections;

-- ============================================
-- Test 8: Test Order & Quote Isolation
-- ============================================

-- Test: Quotes should be tenant-isolated
SELECT 'Test 8a: Quotes in tenant' as test_name, COUNT(*) as row_count
FROM quotes;

-- Test: Purchase orders should be tenant-isolated
SELECT 'Test 8b: Purchase orders in tenant' as test_name, COUNT(*) as row_count
FROM purchase_orders;

-- Test: Sales orders should be tenant-isolated
SELECT 'Test 8c: Sales orders in tenant' as test_name, COUNT(*) as row_count
FROM sales_orders;

-- ============================================
-- Test 9: Test Warehouse Isolation
-- ============================================

-- Test: Warehouses should be tenant-isolated
SELECT 'Test 9a: Warehouses in tenant' as test_name, COUNT(*) as row_count
FROM warehouses;

-- Test: Warehouse transfers should be tenant-isolated
SELECT 'Test 9b: Warehouse transfers in tenant' as test_name, COUNT(*) as row_count
FROM warehouse_transfers;

-- ============================================
-- Verification Summary
-- ============================================

-- Check RLS is enabled
SELECT 
  tablename,
  relrowsecurity as rls_enabled,
  CASE relrowsecurity
    WHEN true THEN '✓ RLS ACTIVE'
    ELSE '✗ RLS DISABLED'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('invoices', 'products', 'users', 'roles', 'audit_logs')
ORDER BY tablename;

-- Count policies
SELECT 
  COUNT(*) as total_policies,
  COUNT(*) FILTER (WHERE policyname LIKE '%_tenant_isolation') as tenant_policies
FROM pg_policies
WHERE schemaname = 'public';

SELECT 'TEST COMPLETED: Verify all tests passed' as status, NOW() as completed_at;