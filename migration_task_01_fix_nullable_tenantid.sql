-- ============================================
-- TASK 1: Fix Nullable/Missing tenantId Columns
-- ============================================

-- Set tenant UUID variable
\set tenantUUID '\''cmmg5gp2v0007vmr8dgnfw7bu'\''

-- ============================================
-- EXPENSE_CATEGORIES - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE expense_categories ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill - Assign to first tenant
UPDATE expense_categories 
SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' 
WHERE tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE expense_categories 
ADD CONSTRAINT expense_categories_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE expense_categories ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Drop old unique constraint if exists
ALTER TABLE expense_categories DROP CONSTRAINT IF EXISTS expense_categories_name_key;

-- Step 6: Add new unique constraint
ALTER TABLE expense_categories 
ADD CONSTRAINT expense_categories_tenant_name_unique 
UNIQUE (tenant_id, name);

-- Step 7: Add index
CREATE INDEX IF NOT EXISTS expense_categories_tenant_idx ON expense_categories(tenant_id);


-- ============================================
-- PRICE_CARDS - Add tenantId and vatRate
-- ============================================
-- Step 1: Add nullable columns
ALTER TABLE price_cards ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE price_cards ADD COLUMN IF NOT EXISTS vat_rate INTEGER;

-- Step 2: Backfill tenantId from products
UPDATE price_cards pc
SET tenant_id = p.tenant_id
FROM products p
WHERE pc.product_id = p.id AND pc.tenant_id IS NULL;

-- Step 3: Backfill vatRate from products (or use NULL)
UPDATE price_cards pc
SET vat_rate = p.vat_rate
FROM products p
WHERE pc.product_id = p.id AND pc.vat_rate IS NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE price_cards 
ADD CONSTRAINT price_cards_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 5: Set NOT NULL for tenantId
ALTER TABLE price_cards ALTER COLUMN tenant_id SET NOT NULL;

-- Step 6: Add indexes
CREATE INDEX IF NOT EXISTS price_cards_tenant_idx ON price_cards(tenant_id);
CREATE INDEX IF NOT EXISTS price_cards_tenant_product_type_created_idx 
ON price_cards(tenant_id, product_id, type, created_at);


-- ============================================
-- INVOICE_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from invoices
UPDATE invoice_items ii
SET tenant_id = i.tenant_id
FROM invoices i
WHERE ii.invoice_id = i.id AND ii.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE invoice_items 
ADD CONSTRAINT invoice_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE invoice_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS invoice_items_tenant_idx ON invoice_items(tenant_id);
CREATE INDEX IF NOT EXISTS invoice_items_tenant_invoice_idx ON invoice_items(tenant_id, invoice_id);
CREATE INDEX IF NOT EXISTS invoice_items_tenant_product_idx ON invoice_items(tenant_id, product_id);


-- ============================================
-- ORDER_PICKINGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE order_pickings ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from sales_orders
UPDATE order_pickings op
SET tenant_id = so."tenantId"
FROM sales_orders so
WHERE op.order_id = so.id AND op.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE order_pickings 
ADD CONSTRAINT order_pickings_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE order_pickings ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS order_pickings_tenant_idx ON order_pickings(tenant_id);


-- ============================================
-- WORK_ORDER_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE work_order_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from work_orders
UPDATE work_order_items woi
SET tenant_id = wo."tenantId"
FROM work_orders wo
WHERE woi."workOrderId" = wo.id AND woi.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE work_order_items 
ADD CONSTRAINT work_order_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE work_order_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS work_order_items_tenant_idx ON work_order_items(tenant_id);


-- ============================================
-- WORK_ORDER_ACTIVITIES - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE work_order_activities ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from work_orders
UPDATE work_order_activities woa
SET tenant_id = wo."tenantId"
FROM work_orders wo
WHERE woa.work_order_id = wo.id AND woa.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE work_order_activities 
ADD CONSTRAINT work_order_activities_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE work_order_activities ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS work_order_activities_tenant_idx ON work_order_activities(tenant_id);


-- ============================================
-- PRODUCT_BARCODES - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE product_barcodes ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from products
UPDATE product_barcodes pb
SET tenant_id = p.tenant_id
FROM products p
WHERE pb.product_id = p.id AND pb.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE product_barcodes 
ADD CONSTRAINT product_barcodes_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE product_barcodes ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Drop old unique constraint if exists
ALTER TABLE product_barcodes DROP CONSTRAINT IF EXISTS product_barcodes_barcode_key;

-- Step 6: Add new unique constraint
ALTER TABLE product_barcodes 
ADD CONSTRAINT product_barcodes_tenant_barcode_unique 
UNIQUE (tenant_id, barcode);

-- Step 7: Add index
CREATE INDEX IF NOT EXISTS product_barcodes_tenant_idx ON product_barcodes(tenant_id);


-- ============================================
-- CASHBOX_MOVEMENTS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE cashbox_movements ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from cashboxes
UPDATE cashbox_movements cm
SET tenant_id = c.tenant_id
FROM cashboxes c
WHERE cm.cashbox_id = c.id AND cm.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE cashbox_movements 
ADD CONSTRAINT cashbox_movements_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE cashbox_movements ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS cashbox_movements_tenant_idx ON cashbox_movements(tenant_id);
CREATE INDEX IF NOT EXISTS cashbox_movements_tenant_cashbox_date_idx 
ON cashbox_movements(tenant_id, cashbox_id, date);
CREATE INDEX IF NOT EXISTS cashbox_movements_tenant_created_idx 
ON cashbox_movements(tenant_id, created_at);


-- ============================================
-- BANK_ACCOUNT_MOVEMENTS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE bank_account_movements ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from bank_accounts -> banks
UPDATE bank_account_movements bam
SET tenant_id = b.tenant_id
FROM bank_accounts ba
JOIN banks b ON ba.bank_id = b.id
WHERE bam.bank_account_id = ba.id AND bam.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE bank_account_movements 
ADD CONSTRAINT bank_account_movements_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE bank_account_movements ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS bank_account_movements_tenant_idx ON bank_account_movements(tenant_id);


-- ============================================
-- JOURNAL_ENTRY_LINES - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE journal_entry_lines ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from journal_entries
UPDATE journal_entry_lines jel
SET tenant_id = je.tenant_id
FROM journal_entries je
WHERE jel.journal_entry_id = je.id AND jel.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE journal_entry_lines 
ADD CONSTRAINT journal_entry_lines_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE journal_entry_lines ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS journal_entry_lines_tenant_idx ON journal_entry_lines(tenant_id);


-- ============================================
-- EQUIVALENCY_GROUPS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE equivalency_groups ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from first product in group
UPDATE equivalency_groups eg
SET tenant_id = (
  SELECT p.tenant_id 
  FROM products p 
  WHERE p.equivalency_group_id = eg.id 
  LIMIT 1
)
WHERE tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE equivalency_groups 
ADD CONSTRAINT equivalency_groups_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE equivalency_groups ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS equivalency_groups_tenant_idx ON equivalency_groups(tenant_id);


-- ============================================
-- COMPANY_CREDIT_CARDS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE company_credit_cards ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from cashboxes
UPDATE company_credit_cards ccc
SET tenant_id = c.tenant_id
FROM cashboxes c
WHERE ccc.cashbox_id = c.id AND ccc.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE company_credit_cards 
ADD CONSTRAINT company_credit_cards_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE company_credit_cards ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS company_credit_cards_tenant_idx ON company_credit_cards(tenant_id);


-- ============================================
-- PRODUCT_COST_HISTORY - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE stock_cost_history ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from products
UPDATE stock_cost_history pch
SET tenant_id = p.tenant_id
FROM products p
WHERE pch.product_id = p.id AND pch.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE stock_cost_history 
ADD CONSTRAINT stock_cost_history_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE stock_cost_history ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS stock_cost_history_tenant_idx ON stock_cost_history(tenant_id);
CREATE INDEX IF NOT EXISTS stock_cost_history_tenant_product_computed_idx 
ON stock_cost_history(tenant_id, product_id, computed_at);


-- ============================================
-- QUOTE_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from quotes
UPDATE quote_items qi
SET tenant_id = q.tenant_id
FROM quotes q
WHERE qi.quote_id = q.id AND qi.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE quote_items 
ADD CONSTRAINT quote_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE quote_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS quote_items_tenant_idx ON quote_items(tenant_id);


-- ============================================
-- STOCKTAKE_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE stocktake_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from stocktakes
UPDATE stocktake_items si
SET tenant_id = s.tenant_id
FROM stocktakes s
WHERE si.stocktake_id = s.id AND si.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE stocktake_items 
ADD CONSTRAINT stocktake_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE stocktake_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS stocktake_items_tenant_idx ON stocktake_items(tenant_id);


-- ============================================
-- SHELF - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE shelves ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from warehouses
UPDATE shelves s
SET tenant_id = w.tenant_id
FROM warehouses w
WHERE s.warehouse_id = w.id AND s.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE shelves 
ADD CONSTRAINT shelves_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE shelves ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS shelves_tenant_idx ON shelves(tenant_id);


-- ============================================
-- PRODUCT_SHELF - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE product_shelves ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from products
UPDATE product_shelves ps
SET tenant_id = p.tenant_id
FROM products p
WHERE ps.product_id = p.id AND ps.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE product_shelves 
ADD CONSTRAINT product_shelves_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE product_shelves ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS product_shelves_tenant_idx ON product_shelves(tenant_id);


-- ============================================
-- PRODUCT_LOCATION_STOCKS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE product_location_stocks ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from warehouses
UPDATE product_location_stocks pls
SET tenant_id = w.tenant_id
FROM warehouses w
WHERE pls.warehouse_id = w.id AND pls.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE product_location_stocks 
ADD CONSTRAINT product_location_stocks_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE product_location_stocks ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS product_location_stocks_tenant_idx ON product_location_stocks(tenant_id);


-- ============================================
-- SALES_DELIVERY_NOTE_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE sales_delivery_note_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from sales_delivery_notes
UPDATE sales_delivery_note_items sdni
SET tenant_id = sdn."tenantId"
FROM sales_delivery_notes sdn
WHERE sdni.delivery_note_id = sdn.id AND sdni.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE sales_delivery_note_items 
ADD CONSTRAINT sales_delivery_note_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE sales_delivery_note_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS sales_delivery_note_items_tenant_idx ON sales_delivery_note_items(tenant_id);


-- ============================================
-- PURCHASE_DELIVERY_NOTE_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE purchase_delivery_note_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from purchase_delivery_notes
UPDATE purchase_delivery_note_items pdni
SET tenant_id = pdn."tenantId"
FROM purchase_delivery_notes pdn
WHERE pdni.delivery_note_id = pdn.id AND pdni.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE purchase_delivery_note_items 
ADD CONSTRAINT purchase_delivery_note_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE purchase_delivery_note_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS purchase_delivery_note_items_tenant_idx ON purchase_delivery_note_items(tenant_id);


-- ============================================
-- PURCHASE_DELIVERY_NOTE_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE purchase_delivery_note_logs ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from purchase_delivery_notes
UPDATE purchase_delivery_note_logs pdnl
SET tenant_id = pdn."tenantId"
FROM purchase_delivery_notes pdn
WHERE pdnl.delivery_note_id = pdn.id AND pdnl.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE purchase_delivery_note_logs 
ADD CONSTRAINT purchase_delivery_note_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE purchase_delivery_note_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS purchase_delivery_note_logs_tenant_idx ON purchase_delivery_note_logs(tenant_id);


-- ============================================
-- PURCHASE_ORDER_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from purchase_orders
UPDATE purchase_order_items poi
SET tenant_id = po.tenant_id
FROM purchase_orders po
WHERE poi.purchase_order_id = po.id AND poi.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE purchase_order_items 
ADD CONSTRAINT purchase_order_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE purchase_order_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS purchase_order_items_tenant_idx ON purchase_order_items(tenant_id);


-- ============================================
-- PROCUREMENT_ORDER_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE purchase_order_local_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from procurement_orders
UPDATE purchase_order_local_items poi
SET tenant_id = po."tenantId"
FROM procurement_orders po
WHERE poi.order_id = po.id AND poi.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE purchase_order_local_items 
ADD CONSTRAINT purchase_order_local_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE purchase_order_local_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS purchase_order_local_items_tenant_idx ON purchase_order_local_items(tenant_id);


-- ============================================
-- WAREHOUSE_TRANSFER_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE warehouse_transfer_items ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from warehouse_transfers
UPDATE warehouse_transfer_items wti
SET tenant_id = wt."tenantId"
FROM warehouse_transfers wt
WHERE wti."transferId" = wt.id AND wti.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE warehouse_transfer_items 
ADD CONSTRAINT warehouse_transfer_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE warehouse_transfer_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS warehouse_transfer_items_tenant_idx ON warehouse_transfer_items(tenant_id);


-- ============================================
-- ACCOUNT_CONTACTS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE account_contacts ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from accounts
UPDATE account_contacts ac
SET tenant_id = a.tenant_id
FROM accounts a
WHERE ac.account_id = a.id AND ac.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE account_contacts 
ADD CONSTRAINT account_contacts_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE account_contacts ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS account_contacts_tenant_idx ON account_contacts(tenant_id);


-- ============================================
-- ACCOUNT_ADDRESSES - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE account_addresses ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from accounts
UPDATE account_addresses aa
SET tenant_id = a.tenant_id
FROM accounts a
WHERE aa.account_id = a.id AND aa.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE account_addresses 
ADD CONSTRAINT account_addresses_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE account_addresses ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS account_addresses_tenant_idx ON account_addresses(tenant_id);


-- ============================================
-- ACCOUNT_BANKS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE account_banks ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from accounts
UPDATE account_banks ab
SET tenant_id = a.tenant_id
FROM accounts a
WHERE ab.account_id = a.id AND ab.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE account_banks 
ADD CONSTRAINT account_banks_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE account_banks ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS account_banks_tenant_idx ON account_banks(tenant_id);


-- ============================================
-- INVOICE_PAYMENT_PLANS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE invoice_payment_plans ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from invoices
UPDATE invoice_payment_plans ipp
SET tenant_id = i.tenant_id
FROM invoices i
WHERE ipp.invoice_id = i.id AND ipp.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE invoice_payment_plans 
ADD CONSTRAINT invoice_payment_plans_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE invoice_payment_plans ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS invoice_payment_plans_tenant_idx ON invoice_payment_plans(tenant_id);


-- ============================================
-- INVOICE_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE invoice_logs ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from invoices
UPDATE invoice_logs il
SET tenant_id = i.tenant_id
FROM invoices i
WHERE il.invoice_id = i.id AND il.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE invoice_logs 
ADD CONSTRAINT invoice_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE invoice_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS invoice_logs_tenant_idx ON invoice_logs(tenant_id);


-- ============================================
-- SALES_ORDER_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE sales_order_logs ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from sales_orders
UPDATE sales_order_logs sol
SET tenant_id = so."tenantId"
FROM sales_orders so
WHERE sol.order_id = so.id AND sol.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE sales_order_logs 
ADD CONSTRAINT sales_order_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE sales_order_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS sales_order_logs_tenant_idx ON sales_order_logs(tenant_id);


-- ============================================
-- QUOTE_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE quote_logs ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from quotes
UPDATE quote_logs ql
SET tenant_id = q.tenant_id
FROM quotes q
WHERE ql.quote_id = q.id AND ql.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE quote_logs 
ADD CONSTRAINT quote_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE quote_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS quote_logs_tenant_idx ON quote_logs(tenant_id);


-- ============================================
-- BANK_TRANSFER_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE bank_transfer_logs ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from bank_transfers
UPDATE bank_transfer_logs btl
SET tenant_id = bt.tenant_id
FROM bank_transfers bt
WHERE btl.bank_transfer_id = bt.id AND btl.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE bank_transfer_logs 
ADD CONSTRAINT bank_transfer_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE bank_transfer_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS bank_transfer_logs_tenant_idx ON bank_transfer_logs(tenant_id);


-- ============================================
-- CHECK_BILL_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE check_bill_logs ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from checks_bills
UPDATE check_bill_logs cbl
SET tenant_id = cb.tenant_id
FROM checks_bills cb
WHERE cbl.check_bill_id = cb.id AND cbl.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE check_bill_logs 
ADD CONSTRAINT check_bill_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE check_bill_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS check_bill_logs_tenant_idx ON check_bill_logs(tenant_id);


-- ============================================
-- EMPLOYEE_PAYMENTS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE employee_payments ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from employees
UPDATE employee_payments ep
SET tenant_id = e.tenant_id
FROM employees e
WHERE ep.employee_id = e.id AND ep.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE employee_payments 
ADD CONSTRAINT employee_payments_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE employee_payments ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS employee_payments_tenant_idx ON employee_payments(tenant_id);


-- ============================================
-- WAREHOUSE_CRITICAL_STOCKS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE warehouse_critical_stocks ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from warehouses
UPDATE warehouse_critical_stocks wcs
SET tenant_id = w.tenant_id
FROM warehouses w
WHERE wcs.warehouse_id = w.id AND wcs.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE warehouse_critical_stocks 
ADD CONSTRAINT warehouse_critical_stocks_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE warehouse_critical_stocks ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS warehouse_critical_stocks_tenant_idx ON warehouse_critical_stocks(tenant_id);


-- ============================================
-- WAREHOUSE_TRANSFER_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE warehouse_transfer_logs ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from warehouse_transfers
UPDATE warehouse_transfer_logs wtl
SET tenant_id = wt."tenantId"
FROM warehouse_transfers wt
WHERE wtl.transfer_id = wt.id AND wtl.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE warehouse_transfer_logs 
ADD CONSTRAINT warehouse_transfer_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE warehouse_transfer_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS warehouse_transfer_logs_tenant_idx ON warehouse_transfer_logs(tenant_id);


-- ============================================
-- ROLE_PERMISSIONS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from roles
UPDATE role_permissions rp
SET tenant_id = r.tenant_id
FROM roles r
WHERE rp.role_id = r.id AND rp.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE role_permissions 
ADD CONSTRAINT role_permissions_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE role_permissions ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS role_permissions_tenant_idx ON role_permissions(tenant_id);


-- ============================================
-- Fix nullable tenantId to NOT NULL
-- ============================================

-- WAREHOUSE
UPDATE warehouses SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE warehouses ALTER COLUMN tenant_id SET NOT NULL;

-- EMPLOYEE
UPDATE employees SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE employees ALTER COLUMN tenant_id SET NOT NULL;

-- CASHBOX
UPDATE cashboxes SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE cashboxes ALTER COLUMN tenant_id SET NOT NULL;

-- BANK
UPDATE banks SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE banks ALTER COLUMN tenant_id SET NOT NULL;

-- SALES_AGENT
UPDATE sales_agents SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE sales_agents ALTER COLUMN tenant_id SET NOT NULL;

-- JOURNAL_ENTRY
UPDATE journal_entries SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE journal_entries ALTER COLUMN tenant_id SET NOT NULL;

-- CHECK_BILL_JOURNAL
UPDATE check_bill_journals SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE check_bill_journals ALTER COLUMN tenant_id SET NOT NULL;

-- BANK_LOAN_PLAN
UPDATE bank_loan_plans SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE bank_loan_plans ALTER COLUMN tenant_id SET NOT NULL;

-- PRICE_LIST
UPDATE price_lists SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE price_lists ALTER COLUMN tenant_id SET NOT NULL;

-- SALARY_PLAN
UPDATE salary_plans SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE salary_plans ALTER COLUMN tenant_id SET NOT NULL;

-- SALARY_PAYMENT
UPDATE salary_payments SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE salary_payments ALTER COLUMN tenant_id SET NOT NULL;

-- SALARY_PAYMENT_DETAIL
UPDATE salary_payment_details SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE salary_payment_details ALTER COLUMN tenant_id SET NOT NULL;

-- ADVANCE
UPDATE advances SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE advances ALTER COLUMN tenant_id SET NOT NULL;

-- ADVANCE_SETTLEMENT
UPDATE advance_settlements SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE advance_settlements ALTER COLUMN tenant_id SET NOT NULL;

-- COMPANY_VEHICLE
UPDATE company_vehicles SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE company_vehicles ALTER COLUMN tenant_id SET NOT NULL;

-- VEHICLE_EXPENSE
UPDATE vehicle_expenses SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE vehicle_expenses ALTER COLUMN tenant_id SET NOT NULL;

-- INVOICE_COLLECTIONS
UPDATE invoice_collections SET tenant_id = i.tenant_id
FROM invoices i
WHERE invoice_collections.invoice_id = i.id AND invoice_collections.tenant_id IS NULL;
ALTER TABLE invoice_collections ALTER COLUMN tenant_id SET NOT NULL;

-- POS_PAYMENTS
UPDATE pos_payments SET tenant_id = i.tenant_id
FROM invoices i
WHERE pos_payments.invoice_id = i.id AND pos_payments.tenant_id IS NULL;
ALTER TABLE pos_payments ALTER COLUMN tenant_id SET NOT NULL;

-- POS_SESSIONS
UPDATE pos_sessions SET tenant_id = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE tenant_id IS NULL;
ALTER TABLE pos_sessions ALTER COLUMN tenant_id SET NOT NULL;

-- CHECK_BILL_JOURNAL_ITEMS
UPDATE check_bill_journal_items SET tenant_id = j.tenant_id
FROM check_bill_journals j
WHERE check_bill_journal_items.journal_id = j.id AND check_bill_journal_items.tenant_id IS NULL;
ALTER TABLE check_bill_journal_items ALTER COLUMN tenant_id SET NOT NULL;

-- SALES_DELIVERY_NOTE_LOGS
UPDATE sales_delivery_note_logs SET tenant_id = sdn."tenantId"
FROM sales_delivery_notes sdn
WHERE sales_delivery_note_logs.delivery_note_id = sdn.id AND sales_delivery_note_logs.tenant_id IS NULL;
ALTER TABLE sales_delivery_note_logs ALTER COLUMN tenant_id SET NOT NULL;


-- ============================================
-- Special Handling: Role Table
-- ============================================
ALTER TABLE roles 
ADD CONSTRAINT roles_tenant_check
CHECK (
  (is_system_role = true  AND tenant_id IS NULL) OR
  (is_system_role = false AND tenant_id IS NOT NULL)
);


-- ============================================
-- Special Handling: User Table
-- ============================================
ALTER TABLE users 
ADD CONSTRAINT users_tenant_check
CHECK (
  (role IN ('SUPER_ADMIN', 'SUPPORT') AND tenant_id IS NULL) OR
  (role NOT IN ('SUPER_ADMIN', 'SUPPORT') AND tenant_id IS NOT NULL)
);