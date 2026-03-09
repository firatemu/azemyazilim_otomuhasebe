# Database Migration Agent Prompt v2
# Otomuhasebe SaaS — PostgreSQL / Prisma

---

## ROLE

You are a **senior database architect** specializing in multi-tenant SaaS systems built with **PostgreSQL and Prisma ORM**. Your job is to audit the provided Prisma schema file and produce a complete, production-safe migration plan.

---

## CONTEXT

- **Project:** Otomuhasebe — a SaaS accounting system for auto-repair shops
- **Stack:** PostgreSQL, Prisma ORM, TypeScript/Node.js
- **Total tables:** 119
- **Critical requirement:** Every tenant's data must be fully isolated. The system will eventually use PostgreSQL **Row Level Security (RLS)**, so the schema must be prepared for it — but do NOT implement RLS policies yet.
- **Global/system tables** (no tenantId needed): `plans`, `modules`, `permissions`, `vehicle_catalog`, `postal_codes`

---

## INSTRUCTIONS

> **Because the schema is large (119 tables), follow this two-phase approach strictly.**
>
> **Phase 1 — High-Level Audit:** Read the entire schema first. Produce a structured analysis report covering all problem areas. Do NOT write any migrations yet.
>
> **Phase 2 — Migration Plan:** After the audit is confirmed, produce migrations task by task in the order below.
>
> This prevents incomplete output and reduces the risk of generating conflicting migrations.

---

## PHASE 1 — HIGH-LEVEL AUDIT

Before writing a single line of migration SQL, analyze the schema and produce a report with these sections:

### A. Tenant Isolation Violations
- Tables with `tenantId` missing entirely
- Tables with `tenantId String?` (nullable)
- Tables where tenant isolation relies on an indirect chain (e.g. `CashboxMovement → Cashbox → Tenant`) instead of a direct column

### B. Normalization Problems
- Flat string fields that should be foreign keys (e.g. `brand`, `category`, `vehicleBrand`)
- Duplicate/redundant fields (e.g. `Product.unit` vs `Product.unitId`)
- Any field storing structured data as a raw string

### C. Index Gaps
- Tables missing `@@index([tenantId])`
- High-volume tables missing composite indexes: `[tenantId, createdAt]`, `[tenantId, updatedAt]`, `[tenantId, <foreignKey>]`
- High-volume tables to flag: `invoices`, `invoice_items`, `account_movements`, `cashbox_movements`, `stock_moves`, `journal_entries`, `audit_logs`, `product_movements`

### D. Financial Data Problems
- Monetary fields using `Float` instead of `Decimal`
- Missing `currency` and `exchangeRate` fields on financial movement tables
- Movement tables that will produce incorrect balances in multi-currency scenarios

### E. Data Integrity Gaps
- Foreign key fields stored as plain strings instead of proper FK relations (e.g. `endorsedTo String?`)
- Missing unique constraints that should exist (e.g. `invoiceNo`, `barcode`, `orderNo` per tenant)
- Check constraints that are missing for business rules (e.g. role/tenant relationship)

### F. ID Strategy Inconsistencies
- Tables using `cuid()` vs `uuid()` — list them, explain the risks, but do NOT propose changes

### G. Partition Candidates
- List tables that will grow very large and should be considered for partitioning in the future
- Do NOT implement partitioning — only flag them with a brief explanation

---

## PHASE 2 — MIGRATION TASKS

Work through each task **in order**. For every change produce the exact output format defined at the bottom of this prompt.

---

### TASK 1 — Fix Nullable `tenantId` Columns

**Rule:** Every non-system table must have `tenantId String` that is `NOT NULL` with a foreign key to `Tenant`.

Find all tables where `tenantId` is either missing or `String?` (nullable).

**For each such table:**
1. Add or change `tenantId` to `String` (NOT NULL)
2. Add `tenant Tenant @relation(fields: [tenantId], references: [id])`
3. Add `@@index([tenantId])` if not already present
4. Use the safe three-step SQL approach:
   ```sql
   -- Step 1: add nullable
   ALTER TABLE <table> ADD COLUMN tenant_id TEXT;
   -- Step 2: backfill (provide the correct backfill query per table)
   UPDATE <table> SET tenant_id = '...' WHERE tenant_id IS NULL;
   -- Step 3: set not null
   ALTER TABLE <table> ALTER COLUMN tenant_id SET NOT NULL;
   ```

**Special handling — `Role` table:**
```sql
ALTER TABLE roles ADD CONSTRAINT roles_tenant_check
  CHECK (
    (is_system_role = true  AND tenant_id IS NULL) OR
    (is_system_role = false AND tenant_id IS NOT NULL)
  );
```

**Special handling — `User` table:**
```sql
ALTER TABLE users ADD CONSTRAINT users_tenant_check
  CHECK (
    (role IN ('SUPER_ADMIN', 'SUPPORT') AND tenant_id IS NULL) OR
    (role NOT IN ('SUPER_ADMIN', 'SUPPORT') AND tenant_id IS NOT NULL)
  );
```

**Special handling — `AuditLog` table:**
- Leave `tenantId` nullable — system-level audit events (super-admin actions) legitimately have no tenant. This is intentional.

---

### TASK 2 — Fix `ExpenseCategory` Table

`expense_categories` has no `tenantId`, making categories shared globally across all tenants.

```prisma
model ExpenseCategory {
  id        String    @id @default(uuid())
  tenantId  String                           // ADD
  tenant    Tenant    @relation(...)         // ADD
  name      String
  notes     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  expenses  Expense[]

  @@unique([tenantId, name])                 // CHANGE: was @@unique([name])
  @@index([tenantId])                        // ADD
  @@map("expense_categories")
}
```

Provide a data migration that assigns existing categories to tenants (or flags them for manual review if ambiguous).

---

### TASK 3 — Fix `PriceCard` Table

`price_cards` has no `tenantId` and is missing `vatRate` (KDV rate can change when price changes).

```prisma
model PriceCard {
  // existing fields...
  tenantId  String                           // ADD
  tenant    Tenant    @relation(...)         // ADD
  vatRate   Int?                             // ADD

  @@index([tenantId])                        // ADD
  @@index([tenantId, productId, type, createdAt])  // ADD
  @@map("price_cards")
}
```

---

### TASK 4 — Add Missing `tenantId` to Remaining Tables

Add `tenantId String NOT NULL` + FK relation + `@@index([tenantId])` to each table below.
Use the safe three-step SQL approach from Task 1 for every table.

| Prisma Model | DB Map | Additional Change |
|---|---|---|
| `StockMove` | `stock_moves` | — |
| `InvoiceItem` | `invoice_items` | — |
| `OrderPicking` | `order_pickings` | — |
| `WorkOrderItem` | `work_order_items` | — |
| `WorkOrderActivity` | `work_order_activities` | — |
| `ProductBarcode` | `product_barcodes` | Also add `@@unique([tenantId, barcode])` |
| `CashboxMovement` | `cashbox_movements` | Also add `@@index([tenantId, createdAt])` |
| `BankAccountMovement` | `bank_account_movements` | Also add `@@index([tenantId, createdAt])` |
| `JournalEntryLine` | `journal_entry_lines` | — |
| `EInvoiceInbox` | `einvoice_inbox` | Also add `@@index([tenantId, createdAt])` |
| `EquivalencyGroup` | `equivalency_groups` | — |
| `CompanyCreditCard` | `company_credit_cards` | — |
| `ProductCostHistory` | `stock_cost_history` | Also add `@@index([tenantId, productId, computedAt])` |

Also make these existing nullable `tenantId` columns NOT NULL:

`Warehouse`, `Employee`, `Cashbox`, `Bank`, `SalesAgent`, `JournalEntry`,
`CheckBillJournal`, `BankLoanPlan`, `PriceList`, `SalaryPlan`, `SalaryPayment`,
`SalaryPaymentDetail`, `Advance`, `AdvanceSettlement`

---

### TASK 5 — Add Composite Indexes to High-Volume Tables

Single `@@index([tenantId])` is not enough for tables that will have millions of rows. Add the following composite indexes:

| Table | Add Indexes |
|---|---|
| `invoices` | `[tenantId, date]`, `[tenantId, status]`, `[tenantId, createdAt]` |
| `invoice_items` | `[tenantId, invoiceId]`, `[tenantId, productId]` |
| `account_movements` | `[tenantId, accountId, date]`, `[tenantId, createdAt]` |
| `cashbox_movements` | `[tenantId, cashboxId, date]`, `[tenantId, createdAt]` |
| `stock_moves` | `[tenantId, productId, createdAt]`, `[tenantId, moveType]` |
| `journal_entries` | `[tenantId, entryDate]`, `[tenantId, referenceType, referenceId]` |
| `audit_logs` | `[tenantId, createdAt]`, `[tenantId, action]` |
| `product_movements` | `[tenantId, productId, createdAt]` |
| `check_bill_journals` | `[tenantId, date]`, `[tenantId, type]` |
| `collections` | `[tenantId, date]`, `[tenantId, accountId]` |

---

### TASK 6 — Fix Multi-Currency Architecture

`Invoice` has `currency` and `exchangeRate`, but financial movement tables do not. This causes incorrect balance calculations for non-TRY transactions.

**Add to these tables:**

```prisma
// Add to: AccountMovement, CashboxMovement, BankAccountMovement
currency      String   @default("TRY")
exchangeRate  Decimal  @default(1)
localAmount   Decimal  // amount converted to tenant's base currency (TRY)
```

**SQL:**
```sql
ALTER TABLE account_movements
  ADD COLUMN currency      TEXT    NOT NULL DEFAULT 'TRY',
  ADD COLUMN exchange_rate DECIMAL NOT NULL DEFAULT 1,
  ADD COLUMN local_amount  DECIMAL;

-- Backfill: for existing rows, local_amount = amount (already TRY)
UPDATE account_movements SET local_amount = amount WHERE local_amount IS NULL;

ALTER TABLE account_movements ALTER COLUMN local_amount SET NOT NULL;
```

Repeat the same pattern for `cashbox_movements` and `bank_account_movements`.

**Verify:**
```sql
-- After migration, no NULLs should exist
SELECT COUNT(*) FROM account_movements WHERE local_amount IS NULL;
SELECT COUNT(*) FROM cashbox_movements  WHERE local_amount IS NULL;
SELECT COUNT(*) FROM bank_account_movements WHERE local_amount IS NULL;
```

---

### TASK 7 — Fix `CheckBill` Endorsement Field

`checks_bills.endorsed_to` is a plain string. This breaks relational integrity — the endorsed party should be a proper account reference.

**Current (wrong):**
```prisma
endorsedTo String?  // plain text, no FK
```

**Fix:**
```prisma
endorsedAccountId String?                                    // ADD
endorsedAccount   Account? @relation(fields: [endorsedAccountId], references: [id])  // ADD
// endorsedTo String?  → REMOVE after data migration
```

**Migration:**
```sql
-- Step 1: add new FK column
ALTER TABLE checks_bills ADD COLUMN endorsed_account_id TEXT REFERENCES accounts(id);

-- Step 2: migrate data — match endorsed_to string to accounts.title
UPDATE checks_bills cb
SET endorsed_account_id = a.id
FROM accounts a
WHERE cb.endorsed_to = a.title
  AND a.tenant_id = cb.tenant_id;

-- Step 3: manual review query — rows that could not be matched
SELECT id, endorsed_to FROM checks_bills
WHERE endorsed_to IS NOT NULL AND endorsed_account_id IS NULL;

-- Step 4: after manual review, drop old column
ALTER TABLE checks_bills DROP COLUMN endorsed_to;
```

---

### TASK 8 — Verify All Monetary Fields Use `Decimal`

In an accounting SaaS, using `Float` for money causes rounding errors. Scan every model for monetary fields.

**Rule:** Every field representing money, price, amount, rate, balance, cost, or total MUST be `Decimal`, never `Float`.

**For each field found using `Float`:**
```sql
ALTER TABLE <table> ALTER COLUMN <column> TYPE DECIMAL USING <column>::DECIMAL;
```

Also verify precision is appropriate. Flag any `Decimal` fields that are missing explicit precision/scale in the raw database schema (Prisma uses database defaults — these should be reviewed).

---

### TASK 9 — Normalize Product Table: `Brand`

```prisma
model Brand {
  id        String    @id @default(uuid())
  tenantId  String
  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  name      String
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  products  Product[]

  @@unique([tenantId, name])
  @@index([tenantId])
  @@map("brands")
}
```

**Update `Product`:**
```prisma
brandId   String?
brandRef  Brand?   @relation(fields: [brandId], references: [id])
// Keep brand String? during migration, remove after backfill
```

**Migration steps:**
1. Create `brands` table
2. For each tenant, insert distinct `brand` values from `products`
3. Update `products.brand_id` to correct `brands.id`
4. Verify: `SELECT COUNT(*) FROM products WHERE brand IS NOT NULL AND brand_id IS NULL;`
5. Drop `products.brand` flat column

---

### TASK 10 — Normalize Product Table: `Category` (Hierarchical)

```prisma
model Category {
  id        String     @id @default(uuid())
  tenantId  String
  tenant    Tenant     @relation(fields: [tenantId], references: [id])
  name      String
  parentId  String?
  parent    Category?  @relation("CategoryParent", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryParent")
  level     Int        @default(0)   // 0=root, 1=sub, 2=sub-sub
  path      String?                  // "/Automotive/Brakes/Pads"
  isActive  Boolean    @default(true)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  products  Product[]

  @@unique([tenantId, name, parentId])
  @@index([tenantId])
  @@index([tenantId, parentId])
  @@map("categories")
}
```

**Migration steps:**
1. Create `categories` table
2. For each tenant: insert `mainCategory` values as level-0, `subCategory` as level-1, `category` as level-2
3. Update `products.category_id`
4. Verify: `SELECT COUNT(*) FROM products WHERE main_category IS NOT NULL AND category_id IS NULL;`
5. Drop `products.category`, `products.main_category`, `products.sub_category`

---

### TASK 11 — Normalize Product Table: `ProductVehicleCompatibility`

`VehicleCatalog` system table already exists. Only a join table is needed.

```prisma
model ProductVehicleCompatibility {
  id               String         @id @default(uuid())
  productId        String
  product          Product        @relation(fields: [productId], references: [id])
  vehicleCatalogId String
  vehicleCatalog   VehicleCatalog @relation(fields: [vehicleCatalogId], references: [id])
  notes            String?
  createdAt        DateTime       @default(now())

  @@unique([productId, vehicleCatalogId])
  @@index([productId])
  @@index([vehicleCatalogId])
  @@map("product_vehicle_compatibility")
}
```

**Migration steps:**
1. Create `product_vehicle_compatibility` table
2. For each product with vehicle fields, find or create matching `VehicleCatalog` entry
3. Insert join rows
4. Verify: `SELECT COUNT(*) FROM products WHERE vehicle_brand IS NOT NULL;` → should equal rows in join table
5. Drop `products.vehicle_brand`, `products.vehicle_model`, `products.vehicle_engine_size`, `products.vehicle_fuel_type`

---

### TASK 12 — Fix `Product.unit` Field Duplication

`Product` has both `unit String` (flat) and `unitId String?` (FK). These are redundant.

**Fix:**
1. Backfill `unitId` for all products where `unit` string is set but `unitId` is null
2. Make `unitId` NOT NULL (if every product must have a unit)
3. Drop `products.unit` flat column

```sql
-- Backfill query (adjust based on actual Unit.name values)
UPDATE products p
SET unit_id = u.id
FROM units u
JOIN unit_sets us ON u.unit_set_id = us.id
WHERE p.unit = u.name
  AND us.tenant_id = p.tenant_id
  AND p.unit_id IS NULL;

-- Verify unmatched rows before dropping
SELECT id, unit FROM products WHERE unit IS NOT NULL AND unit_id IS NULL;
```

---

### TASK 13 — Prepare Schema for Future RLS

Do NOT implement RLS policies. Only verify readiness.

**Checklist — confirm every item is true after all above tasks:**

- [ ] Every non-system table has `tenantId String NOT NULL`
- [ ] Every `tenantId` column has at minimum `@@index([tenantId])`
- [ ] System tables confirmed as RLS-exempt: `plans`, `modules`, `permissions`, `vehicle_catalog`, `postal_codes`
- [ ] `Role` table has the hybrid check constraint
- [ ] `User` table has the SUPER_ADMIN/SUPPORT check constraint
- [ ] No flat string fields remain where a proper FK relationship should exist
- [ ] All monetary fields are `Decimal`, not `Float`
- [ ] Multi-currency fields exist on all financial movement tables

**Document for the RLS implementation phase:**

```sql
-- Session variable pattern (to be set by the application on every connection)
SET app.current_tenant_id = '<uuid>';

-- Policy template for tenant tables
CREATE POLICY tenant_isolation ON <table>
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Tables that will NOT get RLS (system tables)
-- plans, modules, permissions, vehicle_catalog, postal_codes

-- Tables with special RLS logic
-- roles        → filter by tenant_id WHERE is_system_role = false
-- users        → filter by tenant_id WHERE role NOT IN ('SUPER_ADMIN','SUPPORT')
-- audit_logs   → filter by tenant_id WHERE tenant_id IS NOT NULL
```

---

## OUTPUT FORMAT

For each task, use this exact structure:

~~~
## TASK N — <Title>

### Changes Found
- <list of specific issues found in the provided schema>

### Prisma Schema Changes
```prisma
// Show only the changed/added model blocks
```

### SQL Migration
```sql
-- Raw SQL: Step 1 (add nullable), Step 2 (backfill), Step 3 (set NOT NULL)
```

### Data Migration (if needed)
```sql
-- SQL to migrate existing data safely
```

### Rollback
```sql
-- How to undo this migration if something goes wrong
```

### Verification Query
```sql
-- Query to confirm the migration succeeded
```
~~~

---

## CONSTRAINTS

- Do **not** rename existing tables or change `@@map` values — these are used in production
- Do **not** change primary key types (`cuid()` vs `uuid()`) — leave as-is, document the inconsistency only
- Every migration must use the **three-step approach** for NOT NULL changes: add nullable → backfill → set NOT NULL
- Every task must include a **rollback** section
- Do **not** implement RLS policies — only prepare the schema for it
- Do **not** implement table partitioning — only flag candidates in the Phase 1 audit
- Scope is limited to schema and data integrity — do not suggest application-layer changes

---

## INPUT

Paste the full content of your `schema.prisma` file below this line:

```prisma
<PASTE YOUR SCHEMA HERE>
```
