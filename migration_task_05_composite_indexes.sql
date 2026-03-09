-- ============================================
-- TASK 5: Add Composite Indexes to High-Volume Tables
-- ============================================

-- ============================================
-- INVOICES - Add composite index for tenant + created_at
-- ============================================
CREATE INDEX IF NOT EXISTS invoices_tenant_created_idx 
ON invoices("tenantId", "createdAt");

-- ============================================
-- INVOICE_ITEMS - Already added in TASK 1, verify they exist
-- ============================================
CREATE INDEX IF NOT EXISTS invoice_items_tenant_invoice_idx 
ON invoice_items(tenant_id, "invoiceId");

CREATE INDEX IF NOT EXISTS invoice_items_tenant_product_idx 
ON invoice_items(tenant_id, "productId");

-- ============================================
-- ACCOUNT_MOVEMENTS - Add composite indexes
-- ============================================
-- Add composite index for tenant + account + date
CREATE INDEX IF NOT EXISTS account_movements_tenant_account_date_idx 
ON account_movements("tenantId", "accountId", date);

-- Add composite index for tenant + created_at
CREATE INDEX IF NOT EXISTS account_movements_tenant_created_idx 
ON account_movements("tenantId", "createdAt");

-- ============================================
-- CASHBOX_MOVEMENTS - Already added in TASK 1, verify they exist
-- ============================================
-- CREATE INDEX IF NOT EXISTS cashbox_movements_tenant_cashbox_date_idx 
-- ON cashbox_movements("tenantId", "cashboxId", date);

-- CREATE INDEX IF NOT EXISTS cashbox_movements_tenant_created_idx 
-- ON cashbox_movements("tenantId", "createdAt");

-- ============================================
-- JOURNAL_ENTRIES - Add composite index for tenant + entry_date
-- ============================================
CREATE INDEX IF NOT EXISTS journal_entries_tenant_entry_date_idx 
ON journal_entries("tenantId", "entryDate");

-- ============================================
-- AUDIT_LOGS - Add composite indexes
-- ============================================
-- Add composite index for tenant + created_at
CREATE INDEX IF NOT EXISTS audit_logs_tenant_created_idx 
ON audit_logs("tenantId", "createdAt");

-- Add composite index for tenant + action
CREATE INDEX IF NOT EXISTS audit_logs_tenant_action_idx 
ON audit_logs("tenantId", action);

-- ============================================
-- PRODUCT_MOVEMENTS - Add composite index for tenant + product + created_at
-- ============================================
CREATE INDEX IF NOT EXISTS product_movements_tenant_product_created_idx 
ON product_movements("tenantId", "productId", "createdAt");

-- ============================================
-- CHECK_BILL_JOURNALS - Add composite indexes
-- ============================================
-- Add composite index for tenant + date
CREATE INDEX IF NOT EXISTS check_bill_journals_tenant_date_idx 
ON check_bill_journals("tenantId", date);

-- Add composite index for tenant + type
CREATE INDEX IF NOT EXISTS check_bill_journals_tenant_type_idx 
ON check_bill_journals("tenantId", type);

-- ============================================
-- COLLECTIONS - Add composite index for tenant + account
-- ============================================
CREATE INDEX IF NOT EXISTS collections_tenant_account_idx 
ON collections("tenantId", "accountId");

-- ============================================
-- Verification - Check all composite indexes exist
-- ============================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE '%_tenant_created_idx' OR
    indexname LIKE '%_tenant_account_date_idx' OR
    indexname LIKE '%_tenant_entry_date_idx' OR
    indexname LIKE '%_tenant_action_idx' OR
    indexname LIKE '%_tenant_product_created_idx' OR
    indexname LIKE '%_tenant_date_idx' OR
    indexname LIKE '%_tenant_type_idx' OR
    indexname LIKE '%_tenant_account_idx' OR
    indexname LIKE '%_tenant_invoice_idx' OR
    indexname LIKE '%_tenant_product_idx'
  )
ORDER BY tablename, indexname;

-- ============================================
-- Summary
-- ============================================
SELECT 
    'TASK 5 COMPLETED' AS status,
    COUNT(*) AS indexes_created
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%tenant%'
  AND indexname LIKE '%_idx';