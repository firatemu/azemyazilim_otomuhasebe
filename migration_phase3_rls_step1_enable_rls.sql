-- ============================================
-- Phase 3: Row Level Security (RLS) - Step 1
-- Enable RLS on Tenant-Scoped Tables
-- ============================================
-- This script enables RLS on all tenant-scoped tables
-- ============================================

-- ============================================
-- IMPORTANT: Read Before Execution
-- ============================================
-- 1. Run this in a TRANSACTION: BEGIN; ... COMMIT;
-- 2. Verify each table has tenant_id before enabling RLS
-- 3. Test with app.current_tenant_id = '<tenant-id>'
-- 4. This is STAGING only - backup exists
-- ============================================

BEGIN;

-- ============================================
-- Step 1: Enable RLS on Core Financial Tables
-- ============================================

-- Account Movements
ALTER TABLE account_movements ENABLE ROW LEVEL SECURITY;

-- Cashbox Movements
ALTER TABLE cashbox_movements ENABLE ROW LEVEL SECURITY;

-- Cashbox
ALTER TABLE cashboxes ENABLE ROW LEVEL SECURITY;

-- Banks
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

-- Bank Accounts
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Bank Account Movements
ALTER TABLE bank_account_movements ENABLE ROW LEVEL SECURITY;

-- Bank Loans
ALTER TABLE bank_loans ENABLE ROW LEVEL SECURITY;

-- Bank Loan Plans
ALTER TABLE bank_loan_plans ENABLE ROW LEVEL SECURITY;

-- Bank Transfers
ALTER TABLE bank_transfers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 2: Enable RLS on Invoice & Collections
-- ============================================

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Invoice Items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Invoice Collections
ALTER TABLE invoice_collections ENABLE ROW LEVEL SECURITY;

-- Collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Invoice Logs
ALTER TABLE invoice_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 3: Enable RLS on Product & Stock
-- ============================================

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Product Barcodes
ALTER TABLE product_barcodes ENABLE ROW LEVEL SECURITY;

-- Product Shelves
ALTER TABLE product_shelves ENABLE ROW LEVEL SECURITY;

-- Product Location Stocks
ALTER TABLE product_location_stocks ENABLE ROW LEVEL SECURITY;

-- Stock Moves
ALTER TABLE stock_moves ENABLE ROW LEVEL SECURITY;

-- Product Movements
ALTER TABLE product_movements ENABLE ROW LEVEL SECURITY;

-- Stock Cost History
ALTER TABLE stock_cost_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 4: Enable RLS on Order & Quote
-- ============================================

-- Quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Quote Items
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Quote Logs
ALTER TABLE quote_logs ENABLE ROW LEVEL SECURITY;

-- Purchase Orders
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Purchase Order Items
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Purchase Delivery Notes
ALTER TABLE purchase_delivery_notes ENABLE ROW LEVEL SECURITY;

-- Purchase Delivery Note Items
ALTER TABLE purchase_delivery_note_items ENABLE ROW LEVEL SECURITY;

-- Purchase Delivery Note Logs
ALTER TABLE purchase_delivery_note_logs ENABLE ROW LEVEL SECURITY;

-- Sales Orders
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;

-- Sales Order Items
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

-- Sales Order Logs
ALTER TABLE sales_order_logs ENABLE ROW LEVEL SECURITY;

-- Sales Delivery Notes
ALTER TABLE sales_delivery_notes ENABLE ROW LEVEL SECURITY;

-- Sales Delivery Note Items
ALTER TABLE sales_delivery_note_items ENABLE ROW LEVEL SECURITY;

-- Sales Delivery Note Logs
ALTER TABLE sales_delivery_note_logs ENABLE ROW LEVEL SECURITY;

-- Simple Orders
ALTER TABLE simple_orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 5: Enable RLS on Warehouse
-- ============================================

-- Warehouses
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

-- Locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Warehouse Transfers
ALTER TABLE warehouse_transfers ENABLE ROW LEVEL SECURITY;

-- Warehouse Transfer Items
ALTER TABLE warehouse_transfer_items ENABLE ROW LEVEL SECURITY;

-- Warehouse Transfer Logs
ALTER TABLE warehouse_transfer_logs ENABLE ROW LEVEL SECURITY;

-- Warehouse Critical Stocks
ALTER TABLE warehouse_critical_stocks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 6: Enable RLS on Journal Entries
-- ============================================

-- Journal Entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Journal Entry Lines
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ============================================
-- Verification Query
-- ============================================
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'account_movements', 'accounts', 'cashbox_movements', 'cashboxes',
    'banks', 'bank_accounts', 'bank_account_movements', 'bank_loans',
    'bank_loan_plans', 'bank_transfers', 'invoices', 'invoice_items',
    'invoice_collections', 'collections', 'invoice_logs', 'products',
    'product_barcodes', 'product_shelves', 'product_location_stocks',
    'stock_moves', 'product_movements', 'stock_cost_history', 'quotes',
    'quote_items', 'quote_logs', 'purchase_orders', 'purchase_order_items',
    'purchase_delivery_notes', 'purchase_delivery_note_items',
    'purchase_delivery_note_logs', 'sales_orders', 'sales_order_items',
    'sales_order_logs', 'sales_delivery_notes', 'sales_delivery_note_items',
    'sales_delivery_note_logs', 'simple_orders', 'warehouses', 'locations',
    'warehouse_transfers', 'warehouse_transfer_items', 'warehouse_transfer_logs',
    'warehouse_critical_stocks', 'journal_entries', 'journal_entry_lines'
  )
ORDER BY tablename;

SELECT 'STEP 1 COMPLETED: RLS enabled on core tables' as status, NOW() as completed_at;