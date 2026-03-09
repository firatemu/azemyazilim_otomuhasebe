-- ============================================
-- TASK 1: Fix Nullable tenantId Columns (FINISH)
-- ============================================
-- Bu script tüm nullable tenantId/tenant_id sütunlarını NOT NULL yapar

-- ============================================
-- 1. Backfill NULL values to default tenant (cmmg5gp2v0007vmr8dgnfw7bu)
-- ============================================

-- Special case: users - Skip SUPER_ADMIN and SUPPORT roles
UPDATE users 
SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' 
WHERE "tenantId" IS NULL AND role NOT IN ('SUPER_ADMIN', 'SUPPORT');

-- All other tables with tenantId (camelCase)
UPDATE account_movements SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE advance_settlements SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE advances SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE bank_loan_plans SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE bank_loans SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE bank_transfers SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE check_bill_journal_items SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE check_bill_journals SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE checks_bills SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE collections SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE company_vehicles SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE customer_vehicles SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE expenses SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE inventory_transactions SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE invoice_collections SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE invoice_profit SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE invoices SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE journal_entries SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE part_requests SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE pos_payments SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE pos_sessions SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE price_lists SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE procurement_orders SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE product_movements SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE purchase_delivery_note_items SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE purchase_delivery_note_logs SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE purchase_delivery_notes SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE purchase_orders SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE quotes SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE roles SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE salary_payment_details SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE salary_payments SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE salary_plans SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE sales_agents SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE sales_delivery_note_items SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE sales_delivery_notes SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE sales_order_items SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE sales_orders SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE service_invoices SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE simple_orders SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE stocktakes SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE system_parameters SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE vehicle_expenses SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE warehouse_transfers SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE work_orders SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;

-- ============================================
-- 2. Set NOT NULL constraints for tenantId columns
-- ============================================

ALTER TABLE account_movements ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE advance_settlements ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE advances ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE bank_loan_plans ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE bank_loans ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE bank_transfers ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE check_bill_journal_items ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE check_bill_journals ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE checks_bills ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE collections ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE company_vehicles ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE customer_vehicles ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE inventory_transactions ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE invoice_collections ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE invoice_profit ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE journal_entries ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE part_requests ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE pos_payments ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE pos_sessions ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE price_lists ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE procurement_orders ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE product_movements ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE purchase_delivery_note_items ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE purchase_delivery_note_logs ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE purchase_delivery_notes ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE purchase_orders ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE quotes ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE roles ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE salary_payment_details ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE salary_payments ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE salary_plans ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE sales_agents ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE sales_delivery_note_items ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE sales_delivery_notes ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE sales_order_items ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE sales_orders ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE service_invoices ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE simple_orders ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE stocktakes ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE system_parameters ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE vehicle_expenses ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE warehouse_transfers ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE work_orders ALTER COLUMN "tenantId" SET NOT NULL;

-- Special case: users - allow NULL for SUPER_ADMIN and SUPPORT
-- Users table will NOT have NOT NULL constraint on tenantId
-- But we'll add a CHECK constraint instead

DO $$
BEGIN
    -- Drop existing constraint if exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_tenant_check'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_tenant_check;
    END IF;
    
    -- Add CHECK constraint for users
    ALTER TABLE users 
    ADD CONSTRAINT users_tenant_check
    CHECK (
        (role IN ('SUPER_ADMIN', 'SUPPORT') AND "tenantId" IS NULL) OR
        (role NOT IN ('SUPER_ADMIN', 'SUPPORT') AND "tenantId" IS NOT NULL)
    );
END $$;

-- ============================================
-- 3. Verification
-- ============================================

-- Check for remaining nullable tenant columns (excluding audit_logs, einvoice_inbox, and users)
SELECT 
    table_name,
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE column_name IN ('tenant_id', 'tenantId')
  AND table_schema = 'public'
  AND is_nullable = 'YES'
  AND table_name NOT IN ('audit_logs', 'einvoice_inbox', 'users')
ORDER BY table_name;

-- Summary
SELECT 
    'TASK 1 COMPLETED' AS status,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE column_name IN ('tenant_id', 'tenantId') 
       AND table_schema = 'public' 
       AND is_nullable = 'YES' 
       AND table_name NOT IN ('audit_logs', 'einvoice_inbox', 'users')) AS remaining_nullable;