-- ============================================
-- TASK 1: Fix Nullable tenantId Columns (COMPLETE)
-- ============================================
-- Bu script tüm tablolarda tenantId/tenant_id NULL değerlerini temizler
-- Demo tenant UUID: cmmg5gp2v0007vmr8dgnfw7bu

-- ============================================
-- 1. Backfill NULL tenantId/tenant_id values
-- ============================================

-- 1.1 Tables with tenantId (camelCase) - Backfill to default tenant
UPDATE accounts SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE products SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE banks SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE warehouses SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE cashboxes SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE employees SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE sales_agents SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE price_lists SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE journal_entries SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE check_bill_journals SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE bank_loans SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE bank_loan_plans SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE advances SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE advance_settlements SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE salary_plans SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE salary_payments SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE salary_payment_details SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE company_vehicles SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE vehicle_expenses SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE invoices SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE sales_orders SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE purchase_orders SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE purchase_delivery_notes SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE sales_delivery_notes SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE warehouse_transfers SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE checks_bills SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE expenses SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE quotes SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE procurement_orders SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE stocktakes SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE work_orders SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE roles SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE collections SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE invoice_collections SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE pos_payments SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE pos_sessions SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE bank_transfers SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE customer_vehicles SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE part_requests SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE inventory_transactions SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE product_movements SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE simple_orders SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE system_parameters SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE tenant_settings SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE subscriptions SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE invitations SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE code_templates SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE service_invoices SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE invoice_profit SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE check_bill_journal_items SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE purchase_delivery_note_items SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE sales_delivery_note_items SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE sales_order_items SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL;
UPDATE users SET \"tenantId\" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE \"tenantId\" IS NULL AND role NOT IN ('SUPER_ADMIN', 'SUPPORT');

-- 1.2 Tables with tenant_id (snake_case) - Backfill from related tables or default
UPDATE role_permissions rp
SET tenant_id = COALESCE(
    (SELECT r.\"tenantId\" FROM roles r WHERE r.id = rp.role_id LIMIT 1),
    'cmmg5gp2v0007vmr8dgnfw7bu'
)
WHERE tenant_id IS NULL;

-- ============================================
-- 2. Set NOT NULL constraints
-- ============================================

-- 2.1 tenantId (camelCase) columns
ALTER TABLE accounts ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE products ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE banks ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE warehouses ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE cashboxes ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE employees ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE sales_agents ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE price_lists ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE journal_entries ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE check_bill_journals ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE bank_loans ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE bank_loan_plans ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE advances ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE advance_settlements ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE salary_plans ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE salary_payments ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE salary_payment_details ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE company_vehicles ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE vehicle_expenses ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE sales_orders ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE purchase_orders ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE purchase_delivery_notes ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE sales_delivery_notes ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE warehouse_transfers ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE checks_bills ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE quotes ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE procurement_orders ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE stocktakes ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE work_orders ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE roles ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE collections ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE invoice_collections ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE pos_payments ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE pos_sessions ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE bank_transfers ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE customer_vehicles ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE part_requests ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE inventory_transactions ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE product_movements ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE simple_orders ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE system_parameters ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE tenant_settings ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE invitations ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE code_templates ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE service_invoices ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE invoice_profit ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE check_bill_journal_items ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE purchase_delivery_note_items ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE sales_delivery_note_items ALTER COLUMN \"tenantId\" SET NOT NULL;
ALTER TABLE sales_order_items ALTER COLUMN \"tenantId\" SET NOT NULL;

-- 2.2 tenant_id (snake_case) columns
ALTER TABLE role_permissions ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- 3. Verification Queries
-- ============================================

-- 3.1 Check for remaining NULL tenantId/tenant_id values (excluding audit_logs and einvoice_inbox)
SELECT 
    table_name,
    column_name,
    COUNT(*) AS null_count
FROM information_schema.columns c
JOIN (
    SELECT 'accounts' AS table_name UNION ALL
    SELECT 'products' UNION ALL
    SELECT 'role_permissions'
) t ON t.table_name = c.table_name
WHERE c.column_name IN ('tenant_id', 'tenantId')
  AND c.table_schema = 'public'
  AND c.table_name = t.table_name;

-- 3.2 Check NULL values in important tables
SELECT 
    'accounts' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN \"tenantId\" IS NULL THEN 1 END) AS null_tenant
FROM accounts
UNION ALL
SELECT 'products', COUNT(*), COUNT(CASE WHEN \"tenantId\" IS NULL THEN 1 END) FROM products
UNION ALL
SELECT 'role_permissions', COUNT(*), COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) FROM role_permissions
UNION ALL
SELECT 'invoices', COUNT(*), COUNT(CASE WHEN \"tenantId\" IS NULL THEN 1 END) FROM invoices
UNION ALL
SELECT 'warehouses', COUNT(*), COUNT(CASE WHEN \"tenantId\" IS NULL THEN 1 END) FROM warehouses;

-- ============================================
-- 4. Summary
-- ============================================

-- Count tables with each naming convention
SELECT 
    'TASK 1 Complete' AS status,
    (SELECT COUNT(DISTINCT table_name) FROM information_schema.columns WHERE column_name = 'tenantId' AND table_schema = 'public') AS tenantid_tables,
    (SELECT COUNT(DISTINCT table_name) FROM information_schema.columns WHERE column_name = 'tenant_id' AND table_schema = 'public') AS tenant_id_tables,
    (SELECT COUNT(*) FROM information_schema.columns WHERE column_name IN ('tenant_id', 'tenantId') AND is_nullable = 'YES' AND table_schema = 'public' AND table_name NOT IN ('audit_logs', 'einvoice_inbox')) AS remaining_nullable;