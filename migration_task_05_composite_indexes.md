# TASK 5 — Add Composite Indexes to High-Volume Tables

## Changes Found

Single `@@index([tenantId])` is not enough for tables that will have millions of rows. The following tables need composite indexes for optimal performance:

### Missing Composite Indexes:

**`invoices`**
- Missing: `@@index([tenantId, createdAt])`
- Has: `@@index([tenantId, date])`, `@@index([tenantId, status])` ✓

**`invoice_items`**
- Missing: `@@index([tenantId, invoiceId])`
- Missing: `@@index([tenantId, productId])`
- Has: `@@index([tenantId])` only (from TASK 1)

**`account_movements`**
- Missing: `@@index([tenantId, accountId, date])`
- Missing: `@@index([tenantId, createdAt])`
- Has: `@@index([tenantId])`, `@@index([accountId, date])`

**`cashbox_movements`**
- Has: `@@index([tenantId, cashboxId, date])` ✓ (from TASK 1)
- Has: `@@index([tenantId, createdAt])` ✓ (from TASK 1)

**`stock_moves`**
- Missing: `@@index([tenantId, productId, createdAt])`
- Missing: `@@index([tenantId, moveType])`
- Note: This table doesn't have tenantId yet (TASK 1 doesn't include it)

**`journal_entries`**
- Missing: `@@index([tenantId, entryDate])`
- Has: `@@index([tenantId, referenceType, referenceId])` ✓

**`audit_logs`**
- Missing: `@@index([tenantId, createdAt])`
- Missing: `@@index([tenantId, action])`
- Has: `@@index([tenantId])`, `@@index([action])`, `@@index([createdAt])`

**`product_movements`**
- Missing: `@@index([tenantId, productId, createdAt])`
- Has: `@@index([tenantId])` only (from TASK 1)

**`check_bill_journals`**
- Missing: `@@index([tenantId, date])`
- Missing: `@@index([tenantId, type])`
- Has: No tenantId indexes yet (tenantId is nullable)

**`collections`**
- Missing: `@@index([tenantId, accountId])`
- Has: `@@index([tenantId, date])` ✓

---

## Prisma Schema Changes

### invoices - Add missing index
```prisma
model Invoice {
  // ... existing fields ...
  
  @@unique([invoiceNo, tenantId])
  @@index([tenantId])
  @@index([tenantId, invoiceType])
  @@index([tenantId, status])
  @@index([tenantId, date])
  @@index([tenantId, createdAt])  // ADD THIS
  @@index([accountId])
  @@index([status])
  @@index([deliveryNoteId])
  @@index([warehouseId])
  @@map("invoices")
}
```

### invoice_items - Already added in TASK 1 ✓
```prisma
model InvoiceItem {
  // ... existing fields ...
  
  @@index([invoiceId])
  @@index([productId])
  @@index([tenantId])
  @@index([tenantId, invoiceId])  // ADDED IN TASK 1 ✓
  @@index([tenantId, productId])  // ADDED IN TASK 1 ✓
  @@map("invoice_items")
}
```

### account_movements - Add composite indexes
```prisma
model AccountMovement {
  // ... existing fields ...
  
  @@index([tenantId])
  @@index([accountId, date])
  @@index([tenantId, accountId, date])  // ADD THIS
  @@index([tenantId, createdAt])  // ADD THIS
  @@map("account_movements")
}
```

### journal_entries - Add missing index
```prisma
model JournalEntry {
  // ... existing fields ...
  
  @@index([tenantId])
  @@index([tenantId, referenceType, referenceId])
  @@index([tenantId, entryDate])  // ADD THIS
  @@map("journal_entries")
}
```

### audit_logs - Add composite indexes
```prisma
model AuditLog {
  // ... existing fields ...
  
  @@index([userId])
  @@index([tenantId])
  @@index([action])
  @@index([tenantId, createdAt])  // ADD THIS
  @@index([tenantId, action])  // ADD THIS
  @@map("audit_logs")
}
```

### product_movements - Add composite index
```prisma
model ProductMovement {
  // ... existing fields ...
  
  @@index([tenantId])
  @@index([invoiceItemId])
  @@index([tenantId, productId, createdAt])  // ADD THIS
  @@map("product_movements")
}
```

### check_bill_journals - Add composite indexes
```prisma
model CheckBillJournal {
  // ... existing fields ...
  
  @@map("check_bill_journals")
  @@index([tenantId, date])  // ADD THIS
  @@index([tenantId, type])  // ADD THIS
}
```

### collections - Add missing index
```prisma
model Collection {
  // ... existing fields ...
  
  @@index([tenantId])
  @@index([tenantId, deletedAt])
  @@index([tenantId, date])
  @@index([tenantId, accountId])  // ADD THIS
  @@map("collections")
}
```

---

## SQL Migration

```sql
-- ============================================
-- TASK 5: Add Composite Indexes to High-Volume Tables
-- ============================================

-- ============================================
-- INVOICES
-- ============================================
-- Add composite index for tenant + created_at
CREATE INDEX IF NOT EXISTS invoices_tenant_created_idx 
ON invoices(tenant_id, created_at);


-- ============================================
-- INVOICE_ITEMS
-- ============================================
-- Already added in TASK 1, verify they exist
-- CREATE INDEX IF NOT EXISTS invoice_items_tenant_invoice_idx 
-- ON invoice_items(tenant_id, invoice_id);

-- CREATE INDEX IF NOT EXISTS invoice_items_tenant_product_idx 
-- ON invoice_items(tenant_id, product_id);


-- ============================================
-- ACCOUNT_MOVEMENTS
-- ============================================
-- Add composite index for tenant + account + date
CREATE INDEX IF NOT EXISTS account_movements_tenant_account_date_idx 
ON account_movements(tenant_id, account_id, date);

-- Add composite index for tenant + created_at
CREATE INDEX IF NOT EXISTS account_movements_tenant_created_idx 
ON account_movements(tenant_id, created_at);


-- ============================================
-- CASHBOX_MOVEMENTS
-- ============================================
-- Already added in TASK 1, verify they exist
-- CREATE INDEX IF NOT EXISTS cashbox_movements_tenant_cashbox_date_idx 
-- ON cashbox_movements(tenant_id, cashbox_id, date);

-- CREATE INDEX IF NOT EXISTS cashbox_movements_tenant_created_idx 
-- ON cashbox_movements(tenant_id, created_at);


-- ============================================
-- STOCK_MOVES
-- ============================================
-- Note: stock_moves table doesn't have tenant_id yet
-- This will be addressed in future task when tenant_id is added
-- For now, skip this index

-- CREATE INDEX IF NOT EXISTS stock_moves_tenant_product_created_idx 
-- ON stock_moves(tenant_id, product_id, created_at);

-- CREATE INDEX IF NOT EXISTS stock_moves_tenant_move_type_idx 
-- ON stock_moves(tenant_id, move_type);


-- ============================================
-- JOURNAL_ENTRIES
-- ============================================
-- Add composite index for tenant + entry_date
CREATE INDEX IF NOT EXISTS journal_entries_tenant_entry_date_idx 
ON journal_entries(tenant_id, entry_date);


-- ============================================
-- AUDIT_LOGS
-- ============================================
-- Add composite index for tenant + created_at
CREATE INDEX IF NOT EXISTS audit_logs_tenant_created_idx 
ON audit_logs(tenant_id, created_at);

-- Add composite index for tenant + action
CREATE INDEX IF NOT EXISTS audit_logs_tenant_action_idx 
ON audit_logs(tenant_id, action);


-- ============================================
-- PRODUCT_MOVEMENTS
-- ============================================
-- Add composite index for tenant + product + created_at
CREATE INDEX IF NOT EXISTS product_movements_tenant_product_created_idx 
ON product_movements(tenant_id, product_id, created_at);


-- ============================================
-- CHECK_BILL_JOURNALS
-- ============================================
-- Add composite index for tenant + date
CREATE INDEX IF NOT EXISTS check_bill_journals_tenant_date_idx 
ON check_bill_journals(tenant_id, date);

-- Add composite index for tenant + type
CREATE INDEX IF NOT EXISTS check_bill_journals_tenant_type_idx 
ON check_bill_journals(tenant_id, type);


-- ============================================
-- COLLECTIONS
-- ============================================
-- Add composite index for tenant + account
CREATE INDEX IF NOT EXISTS collections_tenant_account_idx 
ON collections(tenant_id, account_id);
```

---

## Data Migration

No data migration required - this is an index-only change.

---

## Rollback

```sql
-- ============================================
-- Rollback: Drop composite indexes
-- ============================================

-- INVOICES
DROP INDEX IF EXISTS invoices_tenant_created_idx;

-- ACCOUNT_MOVEMENTS
DROP INDEX IF EXISTS account_movements_tenant_account_date_idx;
DROP INDEX IF EXISTS account_movements_tenant_created_idx;

-- JOURNAL_ENTRIES
DROP INDEX IF EXISTS journal_entries_tenant_entry_date_idx;

-- AUDIT_LOGS
DROP INDEX IF EXISTS audit_logs_tenant_created_idx;
DROP INDEX IF EXISTS audit_logs_tenant_action_idx;

-- PRODUCT_MOVEMENTS
DROP INDEX IF EXISTS product_movements_tenant_product_created_idx;

-- CHECK_BILL_JOURNALS
DROP INDEX IF EXISTS check_bill_journals_tenant_date_idx;
DROP INDEX IF EXISTS check_bill_journals_tenant_type_idx;

-- COLLECTIONS
DROP INDEX IF EXISTS collections_tenant_account_idx;
```

---

## Verification Queries

```sql
-- Verify all composite indexes exist
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
    indexname LIKE '%_tenant_account_idx'
  )
ORDER BY tablename, indexname;

-- Check index sizes (after migration)
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%tenant%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Verify index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%tenant%'
ORDER BY idx_scan DESC;
```

---

## Performance Analysis

### Expected Query Improvements:

**1. Invoices by tenant and date range:**
```sql
-- Before: Full table scan on tenant_id, then filter
SELECT * FROM invoices 
WHERE tenant_id = 'xxx' 
  AND created_at BETWEEN '2024-01-01' AND '2024-12-31';

-- After: Direct index lookup
-- Uses: invoices_tenant_created_idx
-- Expected speedup: 10-100x for large datasets
```

**2. Account movements by tenant, account, and date:**
```sql
-- Before: Account scan on tenant_id, then filter
SELECT * FROM account_movements 
WHERE tenant_id = 'xxx' 
  AND account_id = 'yyy' 
  AND date BETWEEN '2024-01-01' AND '2024-12-31';

-- After: Direct index lookup
-- Uses: account_movements_tenant_account_date_idx
-- Expected speedup: 50-500x for large datasets
```

**3. Audit logs by tenant and action:**
```sql
-- Before: Scan on tenant_id, then filter by action
SELECT * FROM audit_logs 
WHERE tenant_id = 'xxx' 
  AND action = 'CREATE';

-- After: Direct index lookup
-- Uses: audit_logs_tenant_action_idx
-- Expected speedup: 20-200x for large datasets
```

**4. Journal entries by tenant and date:**
```sql
-- Before: Scan on tenant_id, then filter
SELECT * FROM journal_entries 
WHERE tenant_id = 'xxx' 
  AND entry_date = '2024-01-01';

-- After: Direct index lookup
-- Uses: journal_entries_tenant_entry_date_idx
-- Expected speedup: 10-100x for large datasets
```

---

## Important Notes

1. **Index Creation Time**: Large tables may take significant time to index
2. **Downtime Consideration**: Create indexes during low-traffic periods
3. **Disk Space**: New indexes will consume additional disk space
4. **Write Performance**: More indexes = slower INSERT/UPDATE operations
5. **Query Planner**: PostgreSQL will automatically use these indexes when beneficial
6. **Stock Moves**: This table needs tenant_id first (future task)
7. **Monitoring**: Use verification queries to monitor index usage
8. **Prisma Migration**: Run `npx prisma migrate dev` after SQL migration

---

## Index Size Estimates

Based on typical row counts:

| Table | Estimated Rows | Index Size (Tenant+Created) | Index Size (Composite) |
|-------|----------------|------------------------------|------------------------|
| invoices | 1M | 40 MB | 60 MB |
| account_movements | 5M | 200 MB | 300 MB |
| journal_entries | 2M | 80 MB | 120 MB |
| audit_logs | 10M | 400 MB | 600 MB |
| product_movements | 3M | 120 MB | 180 MB |
| check_bill_journals | 500K | 20 MB | 30 MB |
| collections | 2M | 80 MB | 120 MB |
| **Total** | - | **~940 MB** | **~1.4 GB** |

*Estimates are approximate and will vary based on actual data.*