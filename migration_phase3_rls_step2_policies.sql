-- ============================================
-- Phase 3: Row Level Security (RLS) - Step 2
-- Create Tenant Isolation Policies
-- ============================================
-- IMPORTANT: This must run IMMEDIATELY after Step 1
-- because RLS blocks all access until policies exist
-- ============================================

BEGIN;

-- ============================================
-- Step 1: Create Standard Tenant Isolation Policies
-- ============================================

-- Financial Tables
CREATE POLICY account_movements_tenant_isolation ON account_movements
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY accounts_tenant_isolation ON accounts
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY cashbox_movements_tenant_isolation ON cashbox_movements
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY cashboxes_tenant_isolation ON cashboxes
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY banks_tenant_isolation ON banks
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY bank_accounts_tenant_isolation ON bank_accounts
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY bank_account_movements_tenant_isolation ON bank_account_movements
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY bank_loans_tenant_isolation ON bank_loans
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY bank_loan_plans_tenant_isolation ON bank_loan_plans
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY bank_transfers_tenant_isolation ON bank_transfers
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Invoice & Collection Tables
CREATE POLICY invoices_tenant_isolation ON invoices
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY invoice_items_tenant_isolation ON invoice_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY invoice_collections_tenant_isolation ON invoice_collections
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY collections_tenant_isolation ON collections
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY invoice_logs_tenant_isolation ON invoice_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Product & Stock Tables
CREATE POLICY products_tenant_isolation ON products
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY product_barcodes_tenant_isolation ON product_barcodes
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY product_shelves_tenant_isolation ON product_shelves
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY product_location_stocks_tenant_isolation ON product_location_stocks
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY stock_moves_tenant_isolation ON stock_moves
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY product_movements_tenant_isolation ON product_movements
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY stock_cost_history_tenant_isolation ON stock_cost_history
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Order & Quote Tables
CREATE POLICY quotes_tenant_isolation ON quotes
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY quote_items_tenant_isolation ON quote_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY quote_logs_tenant_isolation ON quote_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY purchase_orders_tenant_isolation ON purchase_orders
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY purchase_order_items_tenant_isolation ON purchase_order_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY purchase_delivery_notes_tenant_isolation ON purchase_delivery_notes
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY purchase_delivery_note_items_tenant_isolation ON purchase_delivery_note_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY purchase_delivery_note_logs_tenant_isolation ON purchase_delivery_note_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY sales_orders_tenant_isolation ON sales_orders
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY sales_order_items_tenant_isolation ON sales_order_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY sales_order_logs_tenant_isolation ON sales_order_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY sales_delivery_notes_tenant_isolation ON sales_delivery_notes
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY sales_delivery_note_items_tenant_isolation ON sales_delivery_note_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY sales_delivery_note_logs_tenant_isolation ON sales_delivery_note_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY simple_orders_tenant_isolation ON simple_orders
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

-- Warehouse Tables
CREATE POLICY warehouses_tenant_isolation ON warehouses
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY locations_tenant_isolation ON locations
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY warehouse_transfers_tenant_isolation ON warehouse_transfers
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY warehouse_transfer_items_tenant_isolation ON warehouse_transfer_items
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY warehouse_transfer_logs_tenant_isolation ON warehouse_transfer_logs
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY warehouse_critical_stocks_tenant_isolation ON warehouse_critical_stocks
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Journal Entry Tables
CREATE POLICY journal_entries_tenant_isolation ON journal_entries
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id')::text);

CREATE POLICY journal_entry_lines_tenant_isolation ON journal_entry_lines
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

COMMIT;

-- ============================================
-- Verification Query
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
  AND policyname LIKE '%_tenant_isolation'
ORDER BY tablename, policyname;

SELECT 'STEP 2 COMPLETED: Standard tenant isolation policies created' as status, COUNT(*) as policy_count, NOW() as completed_at
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE '%_tenant_isolation';