# Database Migration Final Checklist

## Overview

This document provides a comprehensive checklist for verifying the successful completion of all database migration tasks.

---

## Migration Tasks Summary

### Completed Migration Tasks:

✅ **TASK 1**: Fix Nullable tenantId Columns
- Added `tenantId` to `price_cards`, `expense_categories`
- Made `tenantId` NOT NULL where required
- Added indexes on `tenantId` columns

✅ **TASK 2**: Fix ExpenseCategory Normalization
- Replaced text with `categoryId` foreign key
- Migrated existing expense categories

✅ **TASK 3**: Fix PriceCard Missing vatRate
- Added `vatRate` column to `price_cards`
- Backfilled with default values

✅ **TASK 4**: Fix Missing tenantId References
- Added `tenantId` to tables missing it
- Migrated data from related tables

✅ **TASK 5**: Add Composite Indexes
- Added `(tenantId, code)` composite index to `products`
- Added `(tenantId, accountId, date)` index to `account_movements`
- Added other tenant-aware indexes

✅ **TASK 6**: Fix Multi-Currency Architecture
- Added `currency`, `exchangeRate`, `localAmount` to financial tables
- Updated `account_movements`, `cashbox_movements`, `bank_account_movements`
- Updated `collections`, `invoice_collections`, `salary_payments`, `advances`

✅ **TASK 7**: Fix CheckBill Endorsement Field Names
- Renamed `endorserName` → `firstEndorserName`
- Renamed `endorserTcNo` → `firstEndorserTcNo`
- Renamed `endorserPhone` → `firstEndorserPhone`

✅ **TASK 8**: Convert Float to Decimal
- Converted `quantity` Float → Decimal(10,4) in `product_movements`
- Converted `price` Float → Decimal(12,2) in `product_movements`
- Converted `quantity` Float → Decimal(10,4) in `stock_moves`
- Converted `price` Float → Decimal(12,2) in `stock_moves`

✅ **TASK 9**: Normalize Product.brand Field
- Added `brandId` foreign key to `products`
- Migrated data from `brand` text to `brandId`
- Renamed `brand` → `brandText` (keep for reference)

✅ **TASK 10**: Normalize Product.category Field
- Renamed `category` → `categoryText`
- Migrated data to `mainCategoryId` and `subCategoryId`
- Created missing categories as needed

✅ **TASK 11**: Create ProductVehicleCompatibility Table
- Created `product_vehicle_compatibilities` table
- Migrated data from `vehicleCompatibility` JSON
- Added indexes for performance

✅ **TASK 12**: Fix Product.unit Duplication
- Added `unitId` foreign key to `products`
- Migrated data from `unit` text to `unitId`
- Renamed `unit` → `unitText` (keep for reference)

✅ **TASK 13**: RLS Preparation Check
- Added `tenantId` to `account_movements` (CRITICAL)
- Added `tenantId` to `product_movements` (HIGH)
- Added `tenantId` to `stock_moves` (HIGH)
- Added `tenantId` to `product_vehicle_compatibilities` (MEDIUM)
- Added `tenantId` to `equivalency_groups` (MEDIUM)
- Added `tenantId` to `brands`, `categories`, `units` (LOW, nullable)

---

## Pre-Migration Checklist

### 1. Backup Database

```bash
# Create full backup
pg_dump -U username -d database_name > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backup_before_migration_*.sql
```

### 2. Review Migration Plans

- [ ] Read all migration task documents
- [ ] Understand data migration strategies
- [ ] Review rollback procedures
- [ ] Identify potential risks
- [ ] Plan for downtime (if needed)

### 3. Prepare Environment

- [ ] Set up staging environment
- [ ] Test migrations on staging database
- [ ] Prepare rollback scripts
- [ ] Notify stakeholders of scheduled maintenance
- [ ] Schedule maintenance window

### 4. Application Updates

- [ ] Update Prisma schema
- [ ] Update application code for field renames
- [ ] Update API endpoints
- [ ] Update frontend components
- [ ] Update queries to use new relations
- [ ] Test application changes

---

## Migration Execution Checklist

### Phase 1: Schema Changes (TASK 1-5)

Run migrations in order:

```bash
# TASK 1: Nullable tenantId Columns
psql -U username -d database_name -f migration_task_01_nullable_tenantid.sql

# TASK 2: ExpenseCategory Normalization
psql -U username -d database_name -f migration_task_02_expense_category.sql

# TASK 3: PriceCard vatRate
psql -U username -d database_name -f migration_task_03_pricecard_vatrate.sql

# TASK 4: Missing tenantId
psql -U username -d database_name -f migration_task_04_missing_tenantid.sql

# TASK 5: Composite Indexes
psql -U username -d database_name -f migration_task_05_composite_indexes.sql
```

### Phase 2: Financial & Currency (TASK 6-8)

```bash
# TASK 6: Multi-Currency
psql -U username -d database_name -f migration_task_06_multi_currency.sql

# TASK 7: CheckBill Endorsement
psql -U username -d database_name -f migration_task_07_checkbill_endorsement.sql

# TASK 8: Float to Decimal
psql -U username -d database_name -f migration_task_08_float_to_decimal.sql
```

### Phase 3: Product Normalization (TASK 9-12)

```bash
# TASK 9: Product.brand
psql -U username -d database_name -f migration_task_09_product_brand.sql

# TASK 10: Product.category
psql -U username -d database_name -f migration_task_10_product_category.sql

# TASK 11: ProductVehicleCompatibility
psql -U username -d database_name -f migration_task_11_product_vehicle_compatibility.sql

# TASK 12: Product.unit
psql -U username -d database_name -f migration_task_12_product_unit_duplication.sql
```

### Phase 4: RLS Preparation (TASK 13)

```bash
# TASK 13: RLS Preparation
psql -U username -d database_name -f migration_task_13_rls_preparation_check.sql
```

---

## Post-Migration Verification Checklist

### 1. Schema Verification

```sql
-- Verify all new columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN (
    'tenant_id', 'currency', 'exchange_rate', 'local_amount',
    'brand_id', 'category_text', 'brand_text', 'unit_text',
    'first_endorser_name', 'first_endorser_tc_no', 'first_endorser_phone'
  )
ORDER BY table_name, column_name;
```

### 2. Index Verification

```sql
-- Verify all new indexes exist
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE '%tenant%' OR
    indexname LIKE '%brand%' OR
    indexname LIKE '%category%' OR
    indexname LIKE '%unit%' OR
    indexname LIKE '%composite%'
  )
ORDER BY tablename, indexname;
```

### 3. Data Integrity Verification

```sql
-- TASK 1: Nullable tenantId
SELECT 
    'price_cards' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) AS null_tenant_id
FROM price_cards

UNION ALL

SELECT 
    'expense_categories',
    COUNT(*),
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END)
FROM expense_categories;

-- TASK 6: Multi-Currency
SELECT 
    'account_movements' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN currency IS NULL THEN 1 END) AS null_currency,
    COUNT(CASE WHEN exchange_rate IS NULL THEN 1 END) AS null_exchange_rate,
    COUNT(CASE WHEN local_amount IS NULL THEN 1 END) AS null_local_amount
FROM account_movements

UNION ALL

SELECT 
    'collections',
    COUNT(*),
    COUNT(CASE WHEN currency IS NULL THEN 1 END),
    COUNT(CASE WHEN exchange_rate IS NULL THEN 1 END),
    COUNT(CASE WHEN local_amount IS NULL THEN 1 END)
FROM collections;

-- TASK 8: Float to Decimal
SELECT 
    'product_movements' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN quantity IS NULL THEN 1 END) AS null_quantity,
    COUNT(CASE WHEN price IS NULL THEN 1 END) AS null_price
FROM product_movements

UNION ALL

SELECT 
    'stock_moves',
    COUNT(*),
    COUNT(CASE WHEN quantity IS NULL THEN 1 END),
    COUNT(CASE WHEN price IS NULL THEN 1 END)
FROM stock_moves;

-- TASK 9: Product.brand
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN brand_id IS NOT NULL THEN 1 END) AS with_brand_id,
    COUNT(CASE WHEN brand_text IS NOT NULL AND brand_id IS NULL THEN 1 END) AS unmatched_brands
FROM products;

-- TASK 10: Product.category
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN main_category_id IS NOT NULL THEN 1 END) AS with_main_category,
    COUNT(CASE WHEN sub_category_id IS NOT NULL THEN 1 END) AS with_sub_category
FROM products;

-- TASK 11: ProductVehicleCompatibility
SELECT 
    COUNT(*) AS total_compatibilities,
    COUNT(DISTINCT product_id) AS unique_products,
    COUNT(DISTINCT brand_id) AS unique_brands
FROM product_vehicle_compatibilities;

-- TASK 13: RLS tenantId
SELECT 
    'account_movements' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) AS null_tenant_id
FROM account_movements

UNION ALL

SELECT 
    'product_movements',
    COUNT(*),
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END)
FROM product_movements

UNION ALL

SELECT 
    'stock_moves',
    COUNT(*),
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END)
FROM stock_moves;
```

### 4. Foreign Key Verification

```sql
-- Verify all foreign keys exist
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

### 5. Performance Verification

```sql
-- Check query performance (example)
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE tenant_id = 'your-tenant-id' AND code LIKE 'PROD-%'
LIMIT 100;

-- Should use tenant-aware index
```

---

## Application Testing Checklist

### 1. Functional Testing

- [ ] Login and authentication works
- [ ] Tenant isolation verified
- [ ] CRUD operations work correctly
- [ ] Multi-currency calculations accurate
- [ ] Financial calculations correct
- [ ] Inventory tracking accurate
- [ ] Search/filter functions work
- [ ] Reports generate correctly
- [ ] Data exports work
- [ ] Data imports work

### 2. Integration Testing

- [ ] API endpoints return correct data
- [ ] Frontend displays data correctly
- [ ] Database queries perform well
- [ ] External integrations work
- [ ] Background jobs run correctly
- [ ] Real-time updates work

### 3. Performance Testing

- [ ] Query response times acceptable
- [ ] Page load times acceptable
- [ ] Database query plans efficient
- [ ] Index usage verified
- [ ] No full table scans
- [ ] Memory usage acceptable

### 4. Security Testing

- [ ] Tenant isolation verified
- [ ] No cross-tenant data access
- [ ] Authentication works
- [ ] Authorization works
- [ ] SQL injection prevented
- [ ] XSS prevented

---

## Rollback Plan

### When to Rollback

- [ ] Data integrity issues detected
- [ ] Critical application failures
- [ ] Performance degradation
- [ ] Security issues discovered
- [ ] Migration errors not recoverable

### Rollback Procedure

```bash
# 1. Stop application
pm2 stop all

# 2. Restore database backup
psql -U username -d database_name < backup_before_migration_YYYYMMDD_HHMMSS.sql

# 3. Verify restoration
psql -U username -d database_name -c "SELECT COUNT(*) FROM products;"

# 4. Restart application
pm2 start all

# 5. Verify application
curl http://localhost:3000/health
```

---

## Documentation Checklist

### 1. Update Documentation

- [ ] Update database schema documentation
- [ ] Update API documentation
- [ ] Update deployment guides
- [ ] Update troubleshooting guides
- [ ] Create migration summary report

### 2. Team Communication

- [ ] Notify team of completion
- [ ] Share migration results
- [ ] Document lessons learned
- [ ] Update project status
- [ ] Schedule follow-up review

### 3. Monitoring Setup

- [ ] Set up database monitoring
- [ ] Set up application monitoring
- [ ] Set up alerting for issues
- [ ] Set up log aggregation
- [ ] Set up performance metrics

---

## Post-Migration Optimization

### 1. Cleanup

```sql
-- Remove legacy columns after verification (uncomment when ready)
-- ALTER TABLE products DROP COLUMN brand_text;
-- ALTER TABLE products DROP COLUMN category_text;
-- ALTER TABLE products DROP COLUMN unit_text;
-- ALTER TABLE products DROP COLUMN vehicle_compatibility;

-- Vacuum and analyze database
VACUUM ANALYZE;

-- Reindex database
REINDEX DATABASE database_name;
```

### 2. Prisma Migration

```bash
# Generate Prisma migration
npx prisma migrate dev --name "database_migration_tasks_1_13"

# Apply migration to production
npx prisma migrate deploy
```

### 3. Performance Tuning

```sql
-- Update database statistics
ANALYZE;

-- Check for bloat
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

---

## Success Criteria

### Migration Success Defined As:

✅ **All migrations executed without errors**
✅ **All data migrated correctly**
✅ **No data loss**
✅ **No data corruption**
✅ **All verification queries pass**
✅ **Application functions normally**
✅ **Performance meets requirements**
✅ **Security verified**
✅ **Documentation updated**
✅ **Team notified**

---

## Contact Information

### Migration Team

- **Database Administrator**: [Name] - [Email]
- **Lead Developer**: [Name] - [Email]
- **Project Manager**: [Name] - [Email]
- **QA Lead**: [Name] - [Email]

### Emergency Contacts

- **On-Call DBA**: [Name] - [Phone]
- **On-Call Developer**: [Name] - [Phone]
- **Infrastructure Lead**: [Name] - [Phone]

---

## Appendix: Quick Reference

### Migration Files Location

```
/home/azem/projects/otomuhasebe/
├── migration_task_01_nullable_tenantid.sql
├── migration_task_02_expense_category.sql
├── migration_task_03_pricecard_vatrate.sql
├── migration_task_04_missing_tenantid.sql
├── migration_task_05_composite_indexes.sql
├── migration_task_06_multi_currency.sql
├── migration_task_07_checkbill_endorsement.sql
├── migration_task_08_float_to_decimal.sql
├── migration_task_09_product_brand.sql
├── migration_task_10_product_category.sql
├── migration_task_11_product_vehicle_compatibility.sql
├── migration_task_12_product_unit_duplication.sql
└── migration_task_13_rls_preparation_check.sql
```

### Common Commands

```bash
# Connect to database
psql -U username -d database_name

# Execute migration file
psql -U username -d database_name -f migration_file.sql

# Backup database
pg_dump -U username -d database_name > backup.sql

# Restore database
psql -U username -d database_name < backup.sql

# Check database size
psql -U username -d database_name -c "SELECT pg_size_pretty(pg_database_size('database_name'));"

# Check table sizes
psql -U username -d database_name -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;"
```

---

## Conclusion

This checklist provides a comprehensive guide for verifying the successful completion of all database migration tasks. Follow each step carefully and ensure all checks pass before considering the migration complete.

**Migration Status**: 🔄 In Progress

**Last Updated**: 2026-03-08

**Next Review**: After migration completion