-- ============================================
-- Phase 3: Row Level Security (RLS) - Step 3
-- Special Policies for User, Role, AuditLog
-- ============================================
-- These tables have complex access rules beyond standard tenant isolation
-- ============================================

BEGIN;

-- ============================================
-- Step 1: Enable RLS on Special Tables
-- ============================================

-- Users (needs role-based access)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Roles (system vs tenant-specific)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- AuditLogs (system events allowed)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================
-- Step 2: Create User Table Policy
-- ============================================
-- SUPER_ADMIN and SUPPORT: Can access all users (no tenant filter)
-- Other roles: Can only access users in their tenant

BEGIN;

CREATE POLICY users_tenant_isolation ON users
  FOR ALL
  USING (
    role IN ('SUPER_ADMIN', 'SUPPORT') OR
    "tenantId" = current_setting('app.current_tenant_id')::text
  );

COMMIT;

-- ============================================
-- Step 3: Create Role Table Policy
-- ============================================
-- System roles (is_system_role = true): Accessible by all tenants
-- Tenant-specific roles (is_system_role = false): Only within tenant

BEGIN;

CREATE POLICY roles_tenant_isolation ON roles
  FOR ALL
  USING (
    is_system_role = true OR
    tenant_id = current_setting('app.current_tenant_id')::text
  );

COMMIT;

-- ============================================
-- Step 4: Create AuditLog Policy
-- ============================================
-- System audit logs (tenantId IS NULL): Only SUPER_ADMIN/SUPPORT can access
-- Tenant audit logs (tenantId IS NOT NULL): Within tenant

BEGIN;

CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  FOR ALL
  USING (
    -- System logs: Allow SUPER_ADMIN/SUPPORT users
    (tenantId IS NULL AND 
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = audit_logs.userId 
          AND role IN ('SUPER_ADMIN', 'SUPPORT')
      )
    ) OR
    -- Tenant logs: Only within tenant
    (tenantId IS NOT NULL AND 
      tenantId = current_setting('app.current_tenant_id')::text
    )
  );

COMMIT;

-- ============================================
-- Step 5: Enable RLS on Remaining Tenant Tables
-- ============================================
-- These are tenant-scoped but not in Step 1

BEGIN;

-- Employee Tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY employees_tenant_isolation ON employees
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Expense Tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY expenses_tenant_isolation ON expenses
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY expense_categories_tenant_isolation ON expense_categories
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Salary & Advance Tables
ALTER TABLE salary_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY salary_plans_tenant_isolation ON salary_plans
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY salary_payments_tenant_isolation ON salary_payments
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE salary_payment_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY salary_payment_details_tenant_isolation ON salary_payment_details
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
CREATE POLICY advances_tenant_isolation ON advances
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE advance_settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY advance_settlements_tenant_isolation ON advance_settlements
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Customer & Vehicle Tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY accounts_tenant_isolation ON accounts
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

ALTER TABLE company_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_vehicles_tenant_isolation ON company_vehicles
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE customer_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_vehicles_tenant_isolation ON customer_vehicles
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE vehicle_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY vehicle_expenses_tenant_isolation ON vehicle_expenses
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Checks & Bills Tables
ALTER TABLE checks_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY checks_bills_tenant_isolation ON checks_bills
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE check_bill_journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY check_bill_journals_tenant_isolation ON check_bill_journals
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

ALTER TABLE check_bill_journal_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY check_bill_journal_items_tenant_isolation ON check_bill_journal_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Credit Card Tables
ALTER TABLE company_credit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_credit_cards_tenant_isolation ON company_credit_cards
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE company_credit_card_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_credit_card_movements_tenant_isolation ON company_credit_card_movements
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE company_credit_card_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_credit_card_reminders_tenant_isolation ON company_credit_card_reminders
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Deleted Records Tables
ALTER TABLE deleted_bank_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY deleted_bank_transfers_tenant_isolation ON deleted_bank_transfers
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE deleted_checks_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY deleted_checks_bills_tenant_isolation ON deleted_checks_bills
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Service & Work Orders
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY work_orders_tenant_isolation ON work_orders
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE work_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY work_order_items_tenant_isolation ON work_order_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

ALTER TABLE work_order_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY work_order_activities_tenant_isolation ON work_order_activities
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Inventory
ALTER TABLE stocktakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY stocktakes_tenant_isolation ON stocktakes
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE stocktake_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY stocktake_items_tenant_isolation ON stocktake_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Order Picking
ALTER TABLE order_pickings ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_pickings_tenant_isolation ON order_pickings
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Price Lists
ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY price_lists_tenant_isolation ON price_lists
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE price_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY price_list_items_tenant_isolation ON price_list_items
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Brand & Category
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY brands_tenant_isolation ON brands
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_tenant_isolation ON categories
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Product Equivalents
ALTER TABLE product_equivalents ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_equivalents_tenant_isolation ON product_equivalents
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Part Requests
ALTER TABLE part_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY part_requests_tenant_isolation ON part_requests
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- POS
ALTER TABLE pos_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY pos_payments_tenant_isolation ON pos_payments
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY pos_sessions_tenant_isolation ON pos_sessions
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Sales Agents
ALTER TABLE sales_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY sales_agents_tenant_isolation ON sales_agents
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- System Parameters
ALTER TABLE system_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY system_parameters_tenant_isolation ON system_parameters
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Subscription & Tenant Settings
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_tenant_isolation ON subscriptions
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_settings_tenant_isolation ON tenant_settings
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Tenant Purge Audits
ALTER TABLE tenant_purge_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_purge_audits_tenant_isolation ON tenant_purge_audits
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

COMMIT;

-- ============================================
-- Verification Queries
-- ============================================

-- Check Special Policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  SUBSTRING(qual, 1, 100) as qual_preview
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'roles', 'audit_logs')
ORDER BY tablename, policyname;

-- Count All Policies
SELECT 
  COUNT(*) as total_policies,
  COUNT(*) FILTER (WHERE policyname LIKE '%_tenant_isolation') as tenant_isolation_policies,
  COUNT(*) FILTER (WHERE tablename IN ('users', 'roles', 'audit_logs')) as special_table_policies
FROM pg_policies 
WHERE schemaname = 'public';

SELECT 'STEP 3 COMPLETED: Special policies and additional tenant tables enabled' as status, NOW() as completed_at;