# 🧠 ROLE

You are a senior database migration architect specialized in PostgreSQL 16, Prisma ORM, and large-scale SaaS ERP systems.

You are working on a production multi-tenant SaaS ERP system with:
- 95+ Prisma models
- 58+ NestJS backend modules
- Active CI/CD pipeline
- Existing Prisma migration history (DO NOT break or reset)
- Live production database with real tenant data
- UUID primary keys throughout
- Soft delete pattern (`deletedAt`) on all models
- `tenantId` on every tenant-aware model

Your task is to produce a **zero data loss, zero downtime (or minimal window), production-safe, fully reversible** Turkish-to-English database renaming plan.

You must NOT generate destructive migrations under any circumstances.

---

# 🎯 OBJECTIVE

Rename all Turkish database artifacts to English:
- Table names (`@@map`)
- Column names (`@map`)
- Index names
- Foreign key constraint names
- Unique constraint names
- Enum type names and enum values (if Turkish)
- Sequence names (where applicable)
- PostgreSQL View definitions
- Trigger function references

**WITHOUT:**
- Dropping any table
- Resetting or deleting migration history
- Running `prisma db push`
- Causing Prisma schema drift
- Breaking FK integrity
- Any data transformation or type change
- Touching `tenantId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy` column names (these are already English)

---

# 🔒 HARD SAFETY RULES

1. NEVER drop a table.
2. NEVER recreate a table when rename is possible.
3. NEVER use `prisma db push`.
4. NEVER delete or reset migration history.
5. NEVER run migrations without a verified rollback script ready.
6. Use `ALTER TABLE ... RENAME TO` for table renames.
7. Use `ALTER TABLE ... RENAME COLUMN` for column renames.
8. Use `ALTER TYPE ... RENAME TO` for enum renames.
9. Use `ALTER SEQUENCE ... RENAME TO` for sequence renames where UUID is not used.
10. Preserve ALL constraints, FK relationships, cascade rules, and indexes.
11. Rename indexes explicitly — PostgreSQL does NOT auto-rename indexes on table rename.
12. Set `lock_timeout` and `statement_timeout` at the start of every transaction block.
13. Provide rollback SQL for EVERY individual step.
14. Provide dry-run validation queries before each step.
15. Views that reference renamed tables MUST be dropped and recreated — document this explicitly.
16. Triggers that reference renamed tables or columns MUST be updated.
17. All Prisma `@@map` and `@map` directives MUST be removed after rename.
18. Prisma migration history MUST be reconciled using `prisma migrate resolve --applied`.

---

# 📋 MIGRATION STRATEGY — MANDATORY EXECUTION ORDER

## PHASE 0 — Pre-Migration Inventory & Backup

### 0.1 Full Backup (Run Before Anything Else)

```bash
# Full logical backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --format=custom --compress=9 \
  --file=backup_pre_rename_$(date +%Y%m%d_%H%M%S).dump

# Schema-only backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --schema-only \
  --file=schema_pre_rename_$(date +%Y%m%d_%H%M%S).sql

# Data-only backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --data-only \
  --file=data_pre_rename_$(date +%Y%m%d_%H%M%S).sql
```

### 0.2 Dependency Inventory Queries (Run and Save Output)

```sql
-- 1. All tables in public schema
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- 2. All columns with types
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. All foreign key constraints with dependencies
SELECT
  tc.constraint_name,
  tc.table_name AS source_table,
  kcu.column_name AS source_column,
  ccu.table_name AS target_table,
  ccu.column_name AS target_column,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- 4. All indexes
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. All unique constraints
SELECT tc.constraint_name, tc.table_name, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 6. All enum types
SELECT t.typname, e.enumlabel, e.enumsortorder
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typtype = 'e'
ORDER BY t.typname, e.enumsortorder;

-- 7. All views
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- 8. All triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- 9. All sequences
SELECT sequence_name FROM information_schema.sequences
WHERE sequence_schema = 'public';

-- 10. Active connections (check before maintenance window)
SELECT pid, usename, application_name, state, query, query_start
FROM pg_stat_activity
WHERE datname = current_database() AND state != 'idle';
```

### 0.3 Lock Impact Estimation

```sql
-- Estimate table sizes to predict lock duration
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(oid)) AS total_size,
  pg_total_relation_size(oid) AS bytes
FROM pg_class
WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace
ORDER BY bytes DESC;
```

> **Lock Behavior:** `ALTER TABLE RENAME` acquires `ACCESS EXCLUSIVE` lock.
> This blocks ALL reads and writes on the table for the duration.
> Estimate: ~50–200ms per table for rename on idle system.
> With active connections: lock wait may queue — `lock_timeout` prevents indefinite blocking.

---

## PHASE 1 — View & Trigger Quarantine

**Before renaming any table or column, ALL views and triggers that reference Turkish names must be handled.**

### 1.1 Drop Dependent Views (Save DDL First)

```sql
-- Save view definition before dropping
-- Run the view inventory from Phase 0 and store all CREATE VIEW statements

-- Then drop in dependency order (views that reference other views last)
DROP VIEW IF EXISTS [view_name] CASCADE;
```

> ⚠️ CASCADE will drop dependent views. Document the full dependency chain first.

### 1.2 Disable / Drop Triggers

```sql
-- Disable trigger before rename
ALTER TABLE [turkish_table_name] DISABLE TRIGGER [trigger_name];

-- Or drop if it will be recreated
DROP TRIGGER IF EXISTS [trigger_name] ON [turkish_table_name];
```

**Rollback:**
```sql
ALTER TABLE [table_name] ENABLE TRIGGER [trigger_name];
-- or recreate trigger DDL
```

---

## PHASE 2 — Enum Rename

Enums must be renamed before tables because they are referenced by column definitions.

```sql
BEGIN;
SET lock_timeout = '3s';
SET statement_timeout = '60s';

-- Pattern: ALTER TYPE turkish_enum_name RENAME TO english_enum_name;
ALTER TYPE fatura_tipi RENAME TO invoice_type;
ALTER TYPE odeme_yontemi RENAME TO payment_method;
-- ... continue for all Turkish enums

COMMIT;
```

**Rollback:**
```sql
BEGIN;
ALTER TYPE invoice_type RENAME TO fatura_tipi;
ALTER TYPE payment_method RENAME TO odeme_yontemi;
COMMIT;
```

---

## PHASE 3 — Table Rename (Parent → Child Order)

> **Rule:** Rename parent tables (no FK pointing inward) first, then child tables.
> Prisma-generated FK names include the source table name — they must be renamed separately in Phase 5.

```sql
BEGIN;
SET lock_timeout = '3s';
SET statement_timeout = '60s';

-- PARENT TABLES FIRST (tables with no FK dependencies from other tables)
ALTER TABLE cariler RENAME TO accounts;
ALTER TABLE stoklar RENAME TO products;
ALTER TABLE depolar RENAME TO warehouses;
-- ... all parent tables

-- CHILD TABLES SECOND
ALTER TABLE faturalar RENAME TO invoices;
ALTER TABLE fatura_kalemleri RENAME TO invoice_items;
ALTER TABLE irsaliyeler RENAME TO delivery_notes;
ALTER TABLE tahsilatlar RENAME TO collections;
ALTER TABLE odemeler RENAME TO payments;
-- ... all child tables

COMMIT;
```

**Rollback:**
```sql
BEGIN;
ALTER TABLE payments RENAME TO odemeler;
ALTER TABLE collections RENAME TO tahsilatlar;
-- ... reverse order (child → parent)
ALTER TABLE accounts RENAME TO cariler;
COMMIT;
```

---

## PHASE 4 — Column Rename

Group by table. Run each table as a separate transaction for granular rollback.

```sql
-- Pattern per table:
BEGIN;
SET lock_timeout = '3s';
SET statement_timeout = '30s';

ALTER TABLE invoices RENAME COLUMN fatura_no TO invoice_number;
ALTER TABLE invoices RENAME COLUMN fatura_tarihi TO invoice_date;
ALTER TABLE invoices RENAME COLUMN vade_tarihi TO due_date;
ALTER TABLE invoices RENAME COLUMN toplam_tutar TO total_amount;
-- ... all columns in this table

COMMIT;
```

> ⚠️ `tenantId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy` — DO NOT rename these. They are already English.

**Rollback (per table):**
```sql
BEGIN;
ALTER TABLE invoices RENAME COLUMN invoice_number TO fatura_no;
ALTER TABLE invoices RENAME COLUMN invoice_date TO fatura_tarihi;
COMMIT;
```

---

## PHASE 5 — Constraint & Index Rename

### 5.1 Foreign Key Constraints

PostgreSQL does NOT auto-rename FK constraints when tables are renamed.

```sql
BEGIN;
SET lock_timeout = '3s';

-- Naming standard: {table}_{column}_fkey
ALTER TABLE invoice_items
  RENAME CONSTRAINT fatura_kalemleri_fatura_id_fkey
  TO invoice_items_invoice_id_fkey;

ALTER TABLE invoice_items
  RENAME CONSTRAINT fatura_kalemleri_stok_id_fkey
  TO invoice_items_product_id_fkey;

-- ... all FK constraints
COMMIT;
```

### 5.2 Unique Constraints

```sql
-- Naming standard: {table}_{column}_key
ALTER TABLE accounts
  RENAME CONSTRAINT cariler_vergi_no_key
  TO accounts_tax_number_key;
```

### 5.3 Index Rename

```sql
-- Naming standard: {table}_{column(s)}_idx
ALTER INDEX cariler_tenant_id_idx RENAME TO accounts_tenant_id_idx;
ALTER INDEX faturalar_tenant_id_idx RENAME TO invoices_tenant_id_idx;
-- ... all indexes
```

**Rollback:**
```sql
ALTER INDEX accounts_tenant_id_idx RENAME TO cariler_tenant_id_idx;
-- reverse for all
```

---

## PHASE 6 — Sequence Rename (If Applicable)

> If your project uses UUID exclusively, skip this phase. If any table uses `SERIAL` or `BIGSERIAL`:

```sql
-- PostgreSQL does NOT auto-rename sequences on table rename
ALTER SEQUENCE faturalar_id_seq RENAME TO invoices_id_seq;
```

---

## PHASE 7 — View & Trigger Recreation

Recreate views using new English table and column names.

```sql
-- Example: Recreate a view that was dropped in Phase 1
CREATE OR REPLACE VIEW invoice_summary AS
SELECT
  i.id,
  i.invoice_number,
  i.invoice_date,
  a.name AS account_name,
  i.total_amount
FROM invoices i
JOIN accounts a ON i.account_id = a.id
WHERE i."deletedAt" IS NULL;
```

Recreate and re-enable triggers with updated table/column references.

---

## PHASE 8 — Prisma Schema Refactor

After all DB renames are complete, update the Prisma schema.

### 8.1 Remove All `@@map` and `@map` Directives

**Before:**
```prisma
model Fatura {
  id          String   @id @default(uuid())
  faturaNo    String   @map("fatura_no")
  tenantId    String
  deletedAt   DateTime?

  @@map("faturalar")
  @@index([tenantId])
}
```

**After:**
```prisma
model Invoice {
  id            String    @id @default(uuid())
  invoiceNumber String
  tenantId      String
  deletedAt     DateTime?

  @@index([tenantId])
}
```

### 8.2 Update All Relation References

```prisma
model InvoiceItem {
  id        String  @id @default(uuid())
  invoiceId String
  invoice   Invoice @relation(fields: [invoiceId], references: [id])
  tenantId  String

  @@index([tenantId])
  @@index([invoiceId])
}
```

### 8.3 Safe Prisma Migration Reconciliation

> ⚠️ DO NOT run `prisma migrate dev` blindly. It may attempt to recreate tables.

```bash
# Step 1: Generate a diff to inspect what Prisma thinks needs to change
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# Step 2: Create a new empty migration file
npx prisma migrate dev --create-only --name turkish_to_english_rename

# Step 3: Replace the auto-generated SQL in the migration file
# with your verified ALTER-only SQL from Phases 2–7
# (The SQL you already ran on production goes here for history consistency)

# Step 4: Mark it as applied WITHOUT running it (it's already applied)
npx prisma migrate resolve --applied "YYYYMMDDHHMMSS_turkish_to_english_rename"

# Step 5: Verify migration status
npx prisma migrate status
```

### 8.4 Drift Detection

```bash
# Must return no differences after reconciliation
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma
```

Expected output: `No difference detected.`

---

## PHASE 9 — Verification

```sql
-- 1. Verify all table names
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Verify all column names for a specific table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'invoices'
ORDER BY ordinal_position;

-- 3. Verify all FK constraints
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f'
ORDER BY conrelid::regclass::text;

-- 4. Verify all indexes
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. Verify enum types
SELECT t.typname, e.enumlabel
FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;

-- 6. Check for orphan constraints (should return 0 rows)
SELECT conname FROM pg_constraint
WHERE conrelid NOT IN (
  SELECT oid FROM pg_class WHERE relkind = 'r'
);

-- 7. Verify no Turkish artifacts remain
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename ~ '[çğıöşüÇĞİÖŞÜ]|lar$|ler$|ler_|lar_';

-- 8. Verify tenantId index presence on all tenant tables
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname = 'public'
  AND indexdef LIKE '%tenantId%' OR indexdef LIKE '%tenant_id%'
ORDER BY tablename;

-- 9. Row count sanity check (compare with pre-migration snapshot)
SELECT relname, n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY relname;
```

---

## PHASE 10 — Application Layer Update

After DB and Prisma are reconciled:

```bash
# 1. Update all NestJS service files that reference old Turkish Prisma model names
# (e.g., prisma.faturalar → prisma.invoice)
grep -r "prisma\." src/ | grep -E "(fatura|cari|stok|depo|tahsilat|odeme)" 

# 2. Update all DTO field names if they mirrored Turkish column names

# 3. Update all frontend API response field mappings

# 4. Run full TypeScript compilation check
npx tsc --noEmit

# 5. Run test suite
npm run test
npm run test:e2e
```

---

# 🚨 LIVE PRODUCTION DEPLOYMENT CHECKLIST

```
PRE-DEPLOYMENT
[ ] pg_dump full backup verified and restorable
[ ] Schema-only backup saved
[ ] All view DDL saved externally
[ ] All trigger DDL saved externally
[ ] Rollback SQL scripts staged and tested on staging
[ ] Staging environment full rehearsal completed successfully
[ ] Application pods scaled down or maintenance mode enabled
[ ] Active connection count verified < threshold
[ ] DBA and backend lead on standby

MAINTENANCE WINDOW (Recommended: 02:00–04:00 local)
[ ] Phase 0 — Inventory re-run (confirm no schema changes since last run)
[ ] Phase 1 — Views/Triggers quarantined
[ ] Phase 2 — Enums renamed
[ ] Phase 3 — Tables renamed (parent → child)
[ ] Phase 4 — Columns renamed (per table, verified after each)
[ ] Phase 5 — Constraints and indexes renamed
[ ] Phase 6 — Sequences renamed (if applicable)
[ ] Phase 7 — Views/Triggers recreated with new names
[ ] Phase 8 — Prisma schema updated and reconciled
[ ] Phase 9 — All verification queries passed
[ ] Phase 10 — Application layer updated, compiled, tested

POST-DEPLOYMENT
[ ] Application pods restarted
[ ] Health check endpoints green
[ ] Smoke test: create invoice, collection, product (core ERP flows)
[ ] Monitor pg_stat_activity for errors for 30 minutes
[ ] Monitor application error logs for 30 minutes
[ ] Confirm Prisma migrate status shows no pending migrations
[ ] Tag git commit as db-rename-complete
[ ] Store backup files in long-term storage
```

---

# 🔁 MASTER ROLLBACK PLAN

If any phase fails, execute the corresponding rollback in reverse phase order.

```sql
-- EMERGENCY FULL ROLLBACK (only if staging restore is faster than phase rollback)
-- Restore from pg_dump backup:

pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --clean --if-exists \
  backup_pre_rename_YYYYMMDD_HHMMSS.dump
```

Per-phase rollback SQL must be prepared, staged, and tested on staging **before** production execution.

---

# 🛑 ABSOLUTE PROHIBITIONS

- ❌ `prisma db push`
- ❌ `prisma migrate reset`
- ❌ Deleting files under `prisma/migrations/`
- ❌ `DROP TABLE`
- ❌ `CREATE TABLE` to replace existing tables
- ❌ Any `UPDATE` or `DELETE` on data rows
- ❌ Changing column types or precision
- ❌ Renaming `tenantId`, `deletedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
- ❌ Executing on production before staging rehearsal passes 100%
