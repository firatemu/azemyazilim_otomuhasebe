# TASK 13 — Row Level Security (RLS) Preparation Check

## Objective

Verify that all tables are properly prepared for Row Level Security (RLS) implementation by ensuring every table has a `tenantId` column.

---

## RLS Requirements

For Row Level Security to work effectively, every table must:

1. ✅ Have a `tenantId` column (UUID or String)
2. ✅ `tenantId` should be indexed for performance
3. ✅ `tenantId` should have a foreign key to `tenants` table (optional but recommended)
4. ✅ `tenantId` should be nullable only for system/global records (e.g., brands, categories)
5. ✅ Application code should filter by `tenantId` in all queries

---

## Table Audit Results

### Tables WITH tenantId (Ready for RLS):

✅ **tenants** - `tenantId` (primary key)
✅ **users** - `tenantId` (indexed)
✅ **accounts** - `tenantId` (indexed)
✅ **invoices** - `tenantId` (indexed)
✅ **invoice_items** - `tenantId` (indexed)
✅ **quotes** - `tenantId` (indexed)
✅ **quote_items** - `tenantId` (indexed)
✅ **purchase_orders** - `tenantId` (indexed)
✅ **purchase_order_items** - `tenantId` (indexed)
✅ **collections** - `tenantId` (indexed)
✅ **products** - `tenantId` (indexed, unique with code)
✅ **cashboxes** - `tenantId` (indexed)
✅ **cashbox_movements** - `tenantId` (indexed)
✅ **bank_accounts** - `tenantId` (indexed)
✅ **bank_account_movements** - `tenantId` (indexed)
✅ **warehouses** - `tenantId` (indexed)
✅ **locations** - `tenantId` (indexed)
✅ **employees** - `tenantId` (indexed)
✅ **salary_payments** - `tenantId` (indexed)
✅ **advances** - `tenantId` (indexed)
✅ **service_invoices** - `tenantId` (indexed)
✅ **service_invoice_items** - `tenantId` (indexed)
✅ **check_bills** - `tenantId` (indexed)
✅ **price_cards** - `tenantId` (indexed) ✓ (Fixed in TASK 1)
✅ **expense_categories** - `tenantId` (indexed) ✓ (Fixed in TASK 2)

### Tables WITHOUT tenantId (Need Attention):

❌ **brands** - Missing `tenantId` (system/global table)
❌ **categories** - Missing `tenantId` (system/global table)
❌ **units** - Missing `tenantId` (system/global table)
❌ **product_vehicle_compatibilities** - Missing `tenantId` (from TASK 11)
❌ **product_movements** - Missing `tenantId` (financial data!)
❌ **stock_moves** - Missing `tenantId` (financial data!)
❌ **equivalency_groups** - Missing `tenantId` (product data)
❌ **account_movements** - Missing `tenantId` (financial data!) ⚠️ CRITICAL

---

## Critical Issues

### 1. Financial Tables Missing tenantId

**account_movements** - CRITICAL
- Contains sensitive financial data
- No tenant isolation
- Major security risk
- **Action Required**: Add `tenantId` column

**product_movements** - HIGH
- Contains inventory tracking data
- No tenant isolation
- Security risk
- **Action Required**: Add `tenantId` column

**stock_moves** - HIGH
- Contains inventory tracking data
- No tenant isolation
- Security risk
- **Action Required**: Add `tenantId` column

### 2. Product Vehicle Compatibility Missing tenantId

**product_vehicle_compatibilities** - MEDIUM
- Created in TASK 11
- Missing `tenantId` column
- Should inherit from product
- **Action Required**: Add `tenantId` column

### 3. Equivalency Groups Missing tenantId

**equivalency_groups** - MEDIUM
- Product grouping data
- No tenant isolation
- **Action Required**: Add `tenantId` column

### 4. System/Global Tables (Nullable tenantId)

**brands** - LOW
- System/global table
- Should have nullable `tenantId` for custom tenant brands
- **Action Recommended**: Add `tenantId` column (nullable)

**categories** - LOW
- System/global table
- Should have nullable `tenantId` for custom tenant categories
- **Action Recommended**: Add `tenantId` column (nullable)

**units** - LOW
- System/global table
- Should have nullable `tenantId` for custom tenant units
- **Action Recommended**: Add `tenantId` column (nullable)

---

## Prisma Schema Changes

### account_movements - Add tenantId (CRITICAL)
```prisma
model AccountMovement {
  id           String        @id @default(uuid())
  accountId    String        @map("account_id")
  type         DebitCredit   @map("type")
  amount       Decimal       @map("amount") @db.Decimal(12, 2)
  balance      Decimal       @map("balance") @db.Decimal(12, 2)
  documentType DocumentType? @map("document_type")
  documentNo   String?       @map("document_no")
  date         DateTime      @default(now()) @map("date")
  notes        String        @map("notes")
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  tenantId     String        @map("tenant_id")  // ADD THIS
  tenant       Tenant?       @relation(fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS
  currency     String        @default("TRY")
  exchangeRate Decimal       @default(1) @db.Decimal(10, 4)
  localAmount  Decimal       @db.Decimal(12, 2)
  account      Account       @relation(fields: [accountId], references: [id])

  @@index([tenantId])  // ADD THIS
  @@index([accountId, date])
  @@index([tenantId, accountId, date])
  @@index([tenantId, createdAt])
  @@map("account_movements")
}
```

### product_movements - Add tenantId (HIGH)
```prisma
model ProductMovement {
  id               String           @id @default(uuid())
  productId        String           @map("product_id")
  quantity         Decimal          @map("quantity") @db.Decimal(10, 4)
  price            Decimal          @map("price") @db.Decimal(12, 2)
  movementType     MovementType     @map("movement_type")
  invoiceItemId    String?          @map("invoice_item_id")
  locationId       String?          @map("location_id")
  movementDate     DateTime         @map("movement_date")
  createdAt        DateTime         @default(now())
  tenantId         String           @map("tenant_id")  // ADD THIS
  tenant           Tenant?          @relation(fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS
  location         Location?        @relation(fields: [locationId], references: [id])
  product          Product          @relation(fields: [productId], references: [id], onDelete: Cascade)
  invoiceItem      InvoiceItem?     @relation(fields: [invoiceItemId], references: [id])

  @@index([tenantId])  // ADD THIS
  @@index([invoiceItemId])
  @@index([tenantId, productId, createdAt])
  @@index([productId])
  @@index([movementType])
  @@map("product_movements")
}
```

### stock_moves - Add tenantId (HIGH)
```prisma
model StockMove {
  id               String      @id @default(uuid())
  productId        String      @map("product_id")
  quantity         Decimal     @map("quantity") @db.Decimal(10, 4)
  price            Decimal     @map("price") @db.Decimal(12, 2)
  moveType         MoveType    @map("move_type")
  moveDate         DateTime    @map("move_date")
  createdAt        DateTime    @default(now())
  tenantId         String      @map("tenant_id")  // ADD THIS
  tenant           Tenant?     @relation(fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS
  productIdProduct  Product     @relation(fields: [productId], references: [id])

  @@index([tenantId])  // ADD THIS
  @@index([productId])
  @@map("stock_moves")
}
```

### product_vehicle_compatibilities - Add tenantId (MEDIUM)
```prisma
model ProductVehicleCompatibility {
  id          String   @id @default(uuid())
  productId   String   @map("product_id")
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  brandId     String   @map("brand_id")
  brand       Brand    @relation(fields: [brandId], references: [id])
  model       String   @map("model")
  startYear   Int?     @map("start_year")
  endYear     Int?     @map("end_year")
  notes       String?  @map("notes")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  tenantId    String   @map("tenant_id")  // ADD THIS

  @@unique([productId, brandId, model, startYear, endYear])
  @@index([tenantId])  // ADD THIS
  @@index([productId])
  @@index([brandId])
  @@index([tenantId, brandId, model])
  @@map("product_vehicle_compatibilities")
}
```

### equivalency_groups - Add tenantId (MEDIUM)
```prisma
model EquivalencyGroup {
  id          String    @id @default(uuid())
  name        String    @map("name")
  code        String    @map("code")
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  tenantId    String    @map("tenant_id")  // ADD THIS
  tenant      Tenant?   @relation(fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS
  products    Product[]

  @@index([tenantId])  // ADD THIS
  @@map("equivalency_groups")
}
```

### brands - Add nullable tenantId (LOW)
```prisma
model Brand {
  id        String    @id @default(uuid())
  name      String    @map("name")
  code      String    @map("code")
  isActive  Boolean   @default(true) @map("is_active")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  tenantId  String?   @map("tenant_id")  // ADD THIS (nullable)
  tenant    Tenant?   @relation(fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS

  products  Product[]
  productVehicleCompatibilities ProductVehicleCompatibility[]

  @@index([tenantId])  // ADD THIS
  @@map("brands")
}
```

### categories - Add nullable tenantId (LOW)
```prisma
model Category {
  id             String     @id @default(uuid())
  name           String     @map("name")
  code           String     @map("code")
  mainCategoryId String?    @map("main_category_id")
  mainCategory   Category?  @relation("CategoryMain", fields: [mainCategoryId], references: [id], onDelete: SetNull)
  subCategories  Category[] @relation("CategoryMain")
  productsMain   Product[]  @relation("ProductMainCategory")
  productsSub    Product[]  @relation("ProductSubCategory")
  isActive       Boolean    @default(true) @map("is_active")
  createdAt      DateTime   @default(now()) @map("created_at")
  updatedAt      DateTime   @updatedAt @map("updated_at")
  tenantId       String?    @map("tenant_id")  // ADD THIS (nullable)
  tenant         Tenant?    @relation(fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS

  @@index([tenantId])  // ADD THIS
  @@index([mainCategoryId])
  @@map("categories")
}
```

### units - Add nullable tenantId (LOW)
```prisma
model Unit {
  id        String    @id @default(uuid())
  name      String    @map("name")
  code      String    @map("code")
  isActive  Boolean   @default(true) @map("is_active")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  tenantId  String?   @map("tenant_id")  // ADD THIS (nullable)
  tenant    Tenant?   @relation(fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS

  products  Product[]

  @@index([tenantId])  // ADD THIS
  @@map("units")
}
```

---

## SQL Migration

```sql
-- ============================================
-- TASK 13: Add Missing tenantId Columns for RLS
-- ============================================

-- ============================================
-- CRITICAL: account_movements (Financial Data)
-- ============================================
ALTER TABLE account_movements 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX am_tenant_idx ON account_movements(tenant_id);

-- Migrate data: Get tenant_id from account
UPDATE account_movements am
SET tenant_id = (
    SELECT tenant_id 
    FROM accounts 
    WHERE id = am.account_id
);

-- Add NOT NULL after migration
ALTER TABLE account_movements ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- HIGH: product_movements (Inventory Data)
-- ============================================
ALTER TABLE product_movements 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX pm_tenant_idx ON product_movements(tenant_id);

-- Migrate data: Get tenant_id from product
UPDATE product_movements pm
SET tenant_id = (
    SELECT tenant_id 
    FROM products 
    WHERE id = pm.product_id
);

-- Add NOT NULL after migration
ALTER TABLE product_movements ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- HIGH: stock_moves (Inventory Data)
-- ============================================
ALTER TABLE stock_moves 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX sm_tenant_idx ON stock_moves(tenant_id);

-- Migrate data: Get tenant_id from product
UPDATE stock_moves sm
SET tenant_id = (
    SELECT tenant_id 
    FROM products 
    WHERE id = sm.product_id
);

-- Add NOT NULL after migration
ALTER TABLE stock_moves ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- MEDIUM: product_vehicle_compatibilities
-- ============================================
ALTER TABLE product_vehicle_compatibilities 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX pvc_tenant_idx ON product_vehicle_compatibilities(tenant_id);

-- Migrate data: Get tenant_id from product
UPDATE product_vehicle_compatibilities pvc
SET tenant_id = (
    SELECT tenant_id 
    FROM products 
    WHERE id = pvc.product_id
);

-- Add NOT NULL after migration
ALTER TABLE product_vehicle_compatibilities ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- MEDIUM: equivalency_groups
-- ============================================
ALTER TABLE equivalency_groups 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX eg_tenant_idx ON equivalency_groups(tenant_id);

-- Migrate data: Get tenant_id from any product in the group
UPDATE equivalency_groups eg
SET tenant_id = (
    SELECT DISTINCT tenant_id 
    FROM products 
    WHERE equivalency_group_id = eg.id
    LIMIT 1
);

-- Add NOT NULL after migration
ALTER TABLE equivalency_groups ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- LOW: brands (System/Global Table)
-- ============================================
ALTER TABLE brands 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX brands_tenant_idx ON brands(tenant_id);

-- Keep as nullable for system/global brands
-- Existing brands remain NULL (system/global)
-- New tenant-specific brands will have tenant_id

-- ============================================
-- LOW: categories (System/Global Table)
-- ============================================
ALTER TABLE categories 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX categories_tenant_idx ON categories(tenant_id);

-- Keep as nullable for system/global categories
-- Existing categories remain NULL (system/global)
-- New tenant-specific categories will have tenant_id

-- ============================================
-- LOW: units (System/Global Table)
-- ============================================
ALTER TABLE units 
ADD COLUMN tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE;

CREATE INDEX units_tenant_idx ON units(tenant_id);

-- Keep as nullable for system/global units
-- Existing units remain NULL (system/global)
-- New tenant-specific units will have tenant_id
```

---

## Verification Queries

```sql
-- ============================================
-- Verify all tables have tenantId column
-- ============================================
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = t.table_name 
              AND column_name = 'tenant_id'
        ) THEN '✓ HAS tenantId'
        ELSE '✗ MISSING tenantId'
    END AS status,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
              AND tablename = t.table_name 
              AND indexname LIKE '%tenant%'
        ) THEN '✓ HAS index'
        ELSE '✗ MISSING index'
    END AS index_status
FROM (
    SELECT tablename AS table_name
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
) t
WHERE table_name NOT LIKE 'pg_%'
  AND table_name NOT LIKE '_prisma_migrations%'
ORDER BY 
    CASE 
        WHEN status = '✗ MISSING tenantId' THEN 1
        ELSE 2
    END,
    table_name;

-- ============================================
-- Verify data integrity for critical tables
-- ============================================

-- account_movements
SELECT 
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) AS with_tenant_id,
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) AS without_tenant_id
FROM account_movements;

-- product_movements
SELECT 
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) AS with_tenant_id,
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) AS without_tenant_id
FROM product_movements;

-- stock_moves
SELECT 
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) AS with_tenant_id,
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) AS without_tenant_id
FROM stock_moves;

-- ============================================
-- Verify tenant isolation
-- ============================================

-- Check for orphaned records (records without tenant_id that should have one)
SELECT 
    'account_movements' AS table_name,
    COUNT(*) AS orphaned_count
FROM account_movements
WHERE tenant_id IS NULL

UNION ALL

SELECT 
    'product_movements',
    COUNT(*)
FROM product_movements
WHERE tenant_id IS NULL

UNION ALL

SELECT 
    'stock_moves',
    COUNT(*)
FROM stock_moves
WHERE tenant_id IS NULL

UNION ALL

SELECT 
    'product_vehicle_compatibilities',
    COUNT(*)
FROM product_vehicle_compatibilities
WHERE tenant_id IS NULL

UNION ALL

SELECT 
    'equivalency_groups',
    COUNT(*)
FROM equivalency_groups
WHERE tenant_id IS NULL;
```

---

## RLS Implementation Plan (Future)

### Phase 1: Enable RLS on All Tables

```sql
-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
-- ... continue for all tables
```

### Phase 2: Create RLS Policies

```sql
-- Create policy to allow access only to tenant's own data
CREATE POLICY tenant_isolation_policy ON accounts
    FOR ALL
    TO authenticated_users
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Phase 3: Test RLS Policies

```sql
-- Set tenant context
SET app.current_tenant_id = 'tenant-uuid';

-- Query should only return tenant's own data
SELECT * FROM accounts;
```

---

## Important Notes

1. **Critical Priority**: Fix `account_movements` tenantId immediately (security risk)
2. **High Priority**: Fix `product_movements` and `stock_moves` tenantId (data isolation)
3. **Data Migration**: All tenantId values must be migrated from related tables
4. **Indexing**: Add indexes on tenantId for all tables
5. **Application Updates**: Update application code to filter by tenantId
6. **Testing**: Test tenant isolation thoroughly
7. **Backup**: Backup before migration
8. **Prisma Migration**: Run `npx prisma migrate dev` after SQL migration

---

## RLS Best Practices

1. **Always Filter by tenantId**: Every query should include `WHERE tenant_id = ?`
2. **Use Application Context**: Set tenant context at application startup
3. **Implement RLS Policies**: Use database-level row security
4. **Monitor Access Logs**: Monitor for unauthorized access attempts
5. **Regular Audits**: Regularly audit tenant isolation
6. **Test Edge Cases**: Test with null tenantId, system tables, etc.

---

## Security Implications

### Without tenantId on Financial Tables:

❌ **Data Leakage**: Tenant A can see Tenant B's financial data
❌ **Privacy Violation**: Violates data privacy regulations (GDPR, KVKK)
❌ **Financial Risk**: Potential for financial fraud
❌ **Legal Liability**: Legal liability for data breaches

### With Proper RLS:

✅ **Data Isolation**: Each tenant can only access their own data
✅ **Compliance**: Complies with data privacy regulations
✅ **Security**: Database-level security enforcement
✅ **Audit Trail**: Clear audit trail for all data access

---

## Next Steps

1. ✅ Run TASK 13 migration to add missing tenantId columns
2. ✅ Verify all tables have tenantId
3. ✅ Test tenant isolation
4. ⏳ Implement RLS policies (future task)
5. ⏳ Test RLS policies thoroughly (future task)
6. ⏳ Monitor for security issues (ongoing)