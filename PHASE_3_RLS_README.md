# Phase 3: Row Level Security (RLS) Implementation

## Overview

Phase 3 implements PostgreSQL Row Level Security (RLS) to provide database-level tenant isolation. This is a critical security feature that ensures tenants can only access their own data, even if application-level filtering fails.

## What is RLS?

Row Level Security (RLS) is a PostgreSQL feature that automatically filters database rows based on policies. With RLS enabled:
- Every query automatically includes `WHERE tenant_id = current_setting('app.current_tenant_id')`
- Database enforces tenant isolation at the lowest level
- Application bugs cannot leak data between tenants
- SUPER_ADMIN users can bypass tenant filtering

## Prerequisites

### Phase 2 Complete ✅
- All tenant-scoped tables have `tenant_id` or `tenantId` columns
- All tenant columns are indexed
- User table has role-based check constraint
- Multi-currency architecture implemented

### Backup Created ✅
- `phase3_backup_20260309_090108.sql` (448KB)

## Architecture

### Tenant Isolation Pattern

```sql
-- Application sets tenant context on every connection
SET LOCAL app.current_tenant_id = '<tenant-uuid>';

-- RLS policy automatically filters queries
CREATE POLICY tenant_isolation ON invoices
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::text);
```

### Special Cases

1. **User Table**: SUPER_ADMIN/SUPPORT bypass tenant filter
2. **Role Table**: System roles (`is_system_role = true`) visible to all
3. **AuditLog**: System logs (`tenantId IS NULL`) only for SUPER_ADMIN

## Files Created

### Migration Files

1. **`migration_phase3_rls_step1_enable_rls.sql`**
   - Enables RLS on 45 core tables
   - Financial, invoice, product, order, warehouse, journal tables
   - ~400 lines

2. **`migration_phase3_rls_step2_policies.sql`**
   - Creates standard tenant isolation policies
   - 45 policies for Step 1 tables
   - Must run IMMEDIATELY after Step 1
   - ~400 lines

3. **`migration_phase3_rls_step3_special_policies.sql`**
   - Enables RLS on remaining 54 tenant tables
   - Creates special policies for User, Role, AuditLog
   - ~600 lines

### Test File

4. **`migration_phase3_rls_test.sql`**
   - 9 test cases verifying tenant isolation
   - Tests SUPER_ADMIN access
   - Tests cross-table isolation
   - ~200 lines

### Application Code

5. **`rls_middleware_example.ts`**
   - Prisma middleware for automatic tenant context
   - Express/NestJS middleware examples
   - Usage examples and error handling
   - ~250 lines

## Execution Plan

### Step 1: Verify Backup
```bash
ls -lh phase3_backup_*.sql
# Should show: phase3_backup_20260309_090108.sql (448K)
```

### Step 2: Run Migrations

**IMPORTANT**: Steps must be executed in order with minimal delay!

```bash
# Execute Step 1 (Enable RLS)
docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage < migration_phase3_rls_step1_enable_rls.sql

# IMMEDIATELY execute Step 2 (Create Policies)
docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage < migration_phase3_rls_step2_policies.sql

# Execute Step 3 (Special Policies)
docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage < migration_phase3_rls_step3_special_policies.sql
```

### Step 3: Verify RLS

```bash
# Check RLS is enabled
docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage -c "
SELECT tablename, relrowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND relrowsecurity = true
ORDER BY tablename;"

# Should show 99 tables with relrowsecurity = true
```

### Step 4: Test RLS

```bash
# Run test script
docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage < migration_phase3_rls_test.sql
```

### Step 5: Deploy Application Changes

**CRITICAL**: Application MUST set `app.current_tenant_id` before any queries!

#### For Prisma Applications

Install the middleware:

```typescript
// Add to your Prisma client initialization
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add RLS middleware
prisma.$use(async (params, next) => {
  const tenantId = (prisma as any)._meta.tenantId;
  
  if (tenantId) {
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
  }
  
  return next(params);
});

export { prisma };
```

Set tenant context in auth middleware:

```typescript
// Express middleware
app.use((req, res, next) => {
  const user = req.user;
  
  if (user && !['SUPER_ADMIN', 'SUPPORT'].includes(user.role)) {
    (prisma as any)._meta.tenantId = user.tenantId;
  } else {
    (prisma as any)._meta.tenantId = null;
  }
  
  next();
});
```

See `rls_middleware_example.ts` for full examples.

## RLS Coverage

### Tables with RLS (99 tables)

**Financial** (10 tables):
- accounts, account_movements
- banks, bank_accounts, bank_account_movements, bank_loans, bank_loan_plans, bank_transfers
- cashboxes, cashbox_movements

**Invoice & Collections** (5 tables):
- invoices, invoice_items, invoice_collections, collections, invoice_logs

**Product & Stock** (7 tables):
- products, product_barcodes, product_shelves, product_location_stocks
- stock_moves, product_movements, stock_cost_history

**Orders & Quotes** (15 tables):
- quotes, quote_items, quote_logs
- purchase_orders, purchase_order_items
- purchase_delivery_notes, purchase_delivery_note_items, purchase_delivery_note_logs
- sales_orders, sales_order_items, sales_order_logs
- sales_delivery_notes, sales_delivery_note_items, sales_delivery_note_logs
- simple_orders

**Warehouse** (6 tables):
- warehouses, locations, warehouse_transfers, warehouse_transfer_items, warehouse_transfer_logs, warehouse_critical_stocks

**Journal** (2 tables):
- journal_entries, journal_entry_lines

**Employee** (8 tables):
- employees, salary_plans, salary_payments, salary_payment_details, advances, advance_settlements

**Customer & Vehicle** (4 tables):
- accounts, company_vehicles, customer_vehicles, vehicle_expenses

**Checks & Bills** (3 tables):
- checks_bills, check_bill_journals, check_bill_journal_items

**Credit Cards** (3 tables):
- company_credit_cards, company_credit_card_movements, company_credit_card_reminders

**Service** (3 tables):
- work_orders, work_order_items, work_order_activities

**Other** (23 tables):
- expenses, expense_categories, stocktakes, stocktake_items, order_pickings
- price_lists, price_list_items, brands, categories, product_equivalents
- part_requests, pos_payments, pos_sessions, sales_agents, system_parameters
- subscriptions, tenant_settings, tenant_purge_audits
- deleted_bank_transfers, deleted_checks_bills

**Special** (3 tables):
- users (role-based access)
- roles (system vs tenant)
- audit_logs (system logs allowed)

### Tables WITHOUT RLS (20 tables - System Tables)

**Core System** (5 tables):
- tenants, plans, modules, permissions

**Reference Data** (2 tables):
- vehicle_catalog, postal_codes

**Authentication** (3 tables):
- sessions, hizli_tokens, code_templates

**EFatura** (2 tables):
- einvoice_inbox, einvoice_xml

**Subscription** (3 tables):
- payments, subscriptions, user_licenses, module_licenses

**Other** (5 tables):
- (Additional system tables as needed)

## Rollback Plan

If issues occur:

```sql
-- Disable RLS on all tables
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND relrowsecurity = true
  LOOP
    EXECUTE 'ALTER TABLE ' || table_name || ' DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- Drop all policies
DROP POLICY IF EXISTS users_tenant_isolation ON users;
DROP POLICY IF EXISTS roles_tenant_isolation ON roles;
DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs;
-- ... (drop all tenant_isolation policies)

-- Or restore from backup
docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage < phase3_backup_20260309_090108.sql
```

## Testing Checklist

- [ ] Backup verified
- [ ] Step 1 executed successfully
- [ ] Step 2 executed within 30 seconds of Step 1
- [ ] Step 3 executed successfully
- [ ] RLS enabled on 99 tables verified
- [ ] Policies created (99 policies) verified
- [ ] Test script executed and passed
- [ ] Application middleware implemented
- [ ] Application sets tenant context on every request
- [ ] SUPER_ADMIN can access all data
- [ ] Regular users see only their tenant's data
- [ ] No application errors after RLS enable
- [ ] Performance impact acceptable (<10% query time increase)

## Performance Considerations

### Expected Impact
- **Query Time**: +5-10% overhead from policy evaluation
- **Connection Pool**: No impact (SET LOCAL is session-scoped)
- **Index Usage**: Existing tenant_id indexes work efficiently

### Optimization Tips
1. Ensure all tenant_id columns are indexed (already done ✅)
2. Use composite indexes for common query patterns (already done ✅)
3. Monitor slow queries with `EXPLAIN ANALYZE`
4. Consider partial indexes for special cases

### Monitoring

```sql
-- Monitor RLS performance
SELECT schemaname, tablename, calls, total_time, mean_time
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY total_time DESC
LIMIT 10;
```

## Security Benefits

### Before RLS
```typescript
// Application-layer filtering only (vulnerable to bugs)
const invoices = await prisma.invoice.findMany({
  where: { tenantId: user.tenantId }
});
// If developer forgets this where clause -> DATA LEAK!
```

### After RLS
```typescript
// Database-level filtering (always enforced)
const invoices = await prisma.invoice.findMany();
// RLS automatically adds: WHERE tenant_id = current_setting('app.current_tenant_id')
// Even if app forgets filtering -> DATA STAYS ISOLATED!
```

## Production Deployment Checklist

### Pre-Deployment
- [ ] Test on staging environment
- [ ] Verify all tests pass
- [ ] Performance testing completed
- [ ] Rollback plan documented
- [ ] Team trained on RLS middleware

### Deployment Steps
1. **Low-traffic window**: Deploy during off-peak hours
2. **Deploy database migrations**: Execute all 3 steps
3. **Deploy application changes**: Update with RLS middleware
4. **Monitor logs**: Watch for RLS-related errors
5. **Verify functionality**: Test tenant isolation
6. **Monitor performance**: Check query times

### Post-Deployment
- [ ] Monitor error logs for 24 hours
- [ ] Check database performance metrics
- [ ] Verify no tenant data leaks
- [ ] Document any issues found

## Common Issues & Solutions

### Issue 1: Application gets "permission denied" errors
**Cause**: Not setting `app.current_tenant_id`
**Solution**: Ensure RLS middleware is installed and working

### Issue 2: SUPER_ADMIN can't see all data
**Cause**: SUPER_ADMIN still has tenant context set
**Solution**: Clear tenant context for SUPER_ADMIN users
```typescript
if (user.role === 'SUPER_ADMIN') {
  prisma._meta.tenantId = null;
}
```

### Issue 3: Performance degraded significantly
**Cause**: Missing indexes on tenant_id
**Solution**: Verify indexes exist (already done ✅)

### Issue 4: AuditLogs not showing system events
**Cause**: AuditLog policy too restrictive
**Solution**: Verify policy allows SUPER_ADMIN/SUPPORT access

## Next Steps

After Phase 3 complete:
1. ✅ Database-level tenant isolation enforced
2. ✅ Security hardened against data leaks
3. ✅ Ready for production deployment
4. 🔄 Monitor performance in production
5. 🔄 Consider table partitioning for large tables
6. 🔄 Implement data retention policies

## Questions?

Refer to:
- `db_migration_agent_prompt_v2.md` - Phase 3 requirements
- `PHASE_2_STATUS_REPORT.md` - Phase 2 completion status
- `rls_middleware_example.ts` - Application integration examples