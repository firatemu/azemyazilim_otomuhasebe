# TASK 9 — Normalize Product.brand Field

## Changes Found

`Product.brand` is a free-text TEXT field causing data inconsistency:

### Current State:

**`Product.brand`** - TEXT field (inconsistent data)
- Examples: "Toyota", "toyota", "TOYOTA", "Toyota ", "Toyota Motors", "TM"
- No foreign key to `brands` table
- No validation
- Difficult to query/report

### Related Table:

**`brands`** - Normalized brand reference table ✓
- `id` (UUID)
- `name` (TEXT)
- `code` (TEXT)
- `isActive` (BOOLEAN)
- `tenantId` (String)

### Problem:

`Product.brand` should reference `brands.id` instead of storing free text.

---

## Prisma Schema Changes

### Product - Add brandId relation
```prisma
model Product {
  id                     String                 @id @default(uuid())
  tenantId                String                 @map("tenant_id")
  tenant                  Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  code                    String                 @unique
  barcode                 String?                @unique @map("barcode")
  name                    String
  description             String?                @db.Text
  brandId                 String?                @map("brand_id")
  brand                   Brand?                 @relation(fields: [brandId], references: [id], onDelete: SetNull)  // NEW RELATION
  brandName               String?                @map("brand_name")  // KEEP FOR MIGRATION
  mainCategoryId          String?                @map("main_category_id")
  mainCategory            Category?              @relation("ProductMainCategory", fields: [mainCategoryId], references: [id], onDelete: SetNull)
  subCategoryId           String?                @map("sub_category_id")
  subCategory            Category?              @relation("ProductSubCategory", fields: [subCategoryId], references: [id], onDelete: SetNull)
  brandText              String                 @map("brand")  // RENAME TO brandText
  category               String                 @map("category")
  costPrice              Decimal                @default(0) @map("cost_price") @db.Decimal(12, 2)
  salePrice              Decimal                @default(0) @map("sale_price") @db.Decimal(12, 2)
  currency               String                 @default("TRY")
  vatRate                Int                    @default(20) @map("vat_rate")
  unit                   String                 @default("adet")
  stockQuantity           Int                    @default(0) @map("stock_quantity")
  minStock               Int                    @default(0) @map("min_stock")
  maxStock               Int                    @default(0) @map("max_stock")
  stockLocation          String?                @map("stock_location")
  shelf                  String?                @map("shelf")
  isActive               Boolean                @default(true) @map("is_active")
  weight                 Decimal?               @map("weight") @db.Decimal(10, 3)
  dimensions            Json?                  @map("dimensions")
  warrantyMonths         Int?                   @map("warranty_months")
  notes                  String?                @map("notes")
  imageUrl               String?                @map("image_url")
  tags                   String[]               @default([])
  meta                   Json?                  @map("meta")
  equivalencyGroupId     String?                @map("equivalency_group_id")
  equivalencyGroup       EquivalencyGroup?      @relation(fields: [equivalencyGroupId], references: [id])
  createdAt              DateTime               @default(now()) @map("created_at")
  updatedAt              DateTime               @updatedAt @map("updated_at")

  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([tenantId, brandId])  // NEW INDEX
  @@index([tenantId, mainCategoryId])
  @@index([tenantId, subCategoryId])
  @@index([tenantId, isActive])
  @@index([tenantId, code])
  @@index([tenantId, barcode])
  @@index([tenantId, name])
  @@index([brandText])  // NEW INDEX FOR MIGRATION
  @@index([category])
  @@index([barcode])
  @@map("products")
}
```

---

## SQL Migration

```sql
-- ============================================
-- TASK 9: Normalize Product.brand Field
-- ============================================

-- ============================================
-- STEP 1: Add brandId column
-- ============================================
ALTER TABLE products 
ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- ============================================
-- STEP 2: Add indexes
-- ============================================
CREATE INDEX products_tenant_brand_idx ON products(tenant_id, brand_id);
CREATE INDEX products_brand_text_idx ON products(brand);  -- For migration queries

-- ============================================
-- STEP 3: Migrate data - Match brands by name
-- ============================================
-- First pass: Exact match
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE p.brand_id IS NULL 
  AND p.brand IS NOT NULL
  AND TRIM(p.brand) != ''
  AND b.tenant_id IS NULL  -- Match with system/global brands
  AND LOWER(TRIM(p.brand)) = LOWER(TRIM(b.name));

-- Second pass: Case-insensitive partial match
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE p.brand_id IS NULL 
  AND p.brand IS NOT NULL
  AND TRIM(p.brand) != ''
  AND b.tenant_id IS NULL
  AND LOWER(p.brand) LIKE CONCAT('%', LOWER(b.name), '%')
  AND (
    -- Prioritize brands with longer names (more specific)
    LENGTH(b.name) >= (
      SELECT MAX(LENGTH(b2.name))
      FROM brands b2
      WHERE b2.tenant_id IS NULL
        AND LOWER(p.brand) LIKE CONCAT('%', LOWER(b2.name), '%')
    )
  );

-- ============================================
-- STEP 4: Create missing brands for unmatched products
-- ============================================
-- Extract unique brand names from products
INSERT INTO brands (id, name, code, is_active, created_at)
SELECT 
    gen_random_uuid() AS id,
    UPPER(TRIM(p.brand)) AS name,
    UPPER(TRIM(p.brand)) AS code,
    true AS is_active,
    NOW() AS created_at
FROM products p
WHERE p.brand IS NOT NULL 
  AND TRIM(p.brand) != ''
  AND p.brand_id IS NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM brands b 
    WHERE b.tenant_id IS NULL 
      AND LOWER(TRIM(p.brand)) = LOWER(TRIM(b.name))
  )
GROUP BY UPPER(TRIM(p.brand));

-- ============================================
-- STEP 5: Link products to newly created brands
-- ============================================
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE p.brand_id IS NULL 
  AND p.brand IS NOT NULL
  AND TRIM(p.brand) != ''
  AND b.tenant_id IS NULL
  AND LOWER(TRIM(p.brand)) = LOWER(TRIM(b.name));

-- ============================================
-- STEP 6: Verify migration
-- ============================================
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN brand IS NOT NULL THEN 1 END) AS products_with_brand_text,
    COUNT(CASE WHEN brand_id IS NOT NULL THEN 1 END) AS products_with_brand_id,
    COUNT(CASE WHEN brand IS NOT NULL AND brand_id IS NULL THEN 1 END) AS unmatched_products,
    COUNT(CASE WHEN brand IS NULL AND brand_id IS NULL THEN 1 END) AS products_without_brand
FROM products;

-- Show unmatched brands for manual review
SELECT 
    brand AS brand_text,
    COUNT(*) AS product_count
FROM products
WHERE brand IS NOT NULL 
  AND TRIM(brand) != ''
  AND brand_id IS NULL
GROUP BY brand
ORDER BY product_count DESC
LIMIT 20;

-- ============================================
-- STEP 7: Rename brand column to brandText (keep for reference)
-- ============================================
ALTER TABLE products RENAME COLUMN brand TO brand_text;

-- ============================================
-- STEP 8: (OPTIONAL) Remove brandText column after verification
-- ============================================
-- Uncomment this after confirming migration is successful
-- ALTER TABLE products DROP COLUMN brand_text;
```

---

## Data Migration Strategy

### Phase 1: Exact Match (Automated)

Match products to brands with exact name comparison:
```sql
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE LOWER(TRIM(p.brand)) = LOWER(TRIM(b.name));
```

### Phase 2: Fuzzy Match (Automated)

Match products to brands with partial name matching:
```sql
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE LOWER(p.brand) LIKE CONCAT('%', LOWER(b.name), '%');
```

### Phase 3: Create Missing Brands (Automated)

Create brand records for unmatched product brands:
```sql
INSERT INTO brands (name, code, is_active)
SELECT DISTINCT brand, brand, true
FROM products
WHERE brand_id IS NULL AND brand IS NOT NULL;
```

### Phase 4: Manual Review (Required)

Review unmatched brands and create/match manually:
```sql
SELECT brand, COUNT(*) 
FROM products 
WHERE brand_id IS NULL 
GROUP BY brand 
ORDER BY COUNT(*) DESC;
```

---

## Rollback

```sql
-- ============================================
-- Rollback: Revert brand normalization
-- ============================================

-- Step 1: Rename brand_text back to brand
ALTER TABLE products RENAME COLUMN brand_text TO brand;

-- Step 2: Drop brand_id column
ALTER TABLE products DROP COLUMN IF EXISTS brand_id;

-- Step 3: Drop indexes
DROP INDEX IF EXISTS products_tenant_brand_idx;
DROP INDEX IF EXISTS products_brand_text_idx;

-- Step 4: Remove brands created during migration (optional)
-- WARNING: This removes brands created for product brands
-- DELETE FROM brands WHERE id IN (brand_ids_created_during_migration);
```

---

## Verification Queries

```sql
-- Verify brand_id column exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
  AND column_name = 'brand_id';

-- Verify indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'products'
  AND indexname LIKE '%brand%';

-- Verify migration statistics
SELECT 
    'Migration Statistics' AS metric,
    COUNT(*) AS total_products
FROM products

UNION ALL

SELECT 
    'Products with brand_text',
    COUNT(*)
FROM products
WHERE brand_text IS NOT NULL

UNION ALL

SELECT 
    'Products with brand_id',
    COUNT(*)
FROM products
WHERE brand_id IS NOT NULL

UNION ALL

SELECT 
    'Matched brands (brand_text = brand.name)',
    COUNT(*)
FROM products p
JOIN brands b ON p.brand_id = b.id
WHERE LOWER(TRIM(p.brand_text)) = LOWER(TRIM(b.name))

UNION ALL

SELECT 
    'Unmatched brands (manual review needed)',
    COUNT(*)
FROM products
WHERE brand_text IS NOT NULL 
  AND brand_id IS NULL;

-- Verify data integrity
SELECT 
    p.id AS product_id,
    p.code AS product_code,
    p.brand_text AS old_brand,
    b.name AS new_brand,
    CASE 
        WHEN p.brand_text IS NOT NULL AND b.name IS NULL THEN 'UNMATCHED'
        WHEN LOWER(TRIM(p.brand_text)) = LOWER(TRIM(b.name)) THEN 'EXACT MATCH'
        WHEN LOWER(p.brand_text) LIKE CONCAT('%', LOWER(b.name), '%') THEN 'FUZZY MATCH'
        ELSE 'UNKNOWN'
    END AS match_type
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.brand_text IS NOT NULL
ORDER BY match_type, p.brand_text
LIMIT 50;

-- Verify brand distribution
SELECT 
    b.name AS brand_name,
    COUNT(p.id) AS product_count,
    SUM(p.stock_quantity) AS total_stock
FROM brands b
LEFT JOIN products p ON b.id = p.brand_id
WHERE b.tenant_id IS NULL
GROUP BY b.name
ORDER BY product_count DESC
LIMIT 20;
```

---

## Important Notes

1. **Manual Review Required**: Some brands won't match automatically
2. **Brand Text Preservation**: Keep `brandText` column for reference until verified
3. **Duplicate Brands**: May create duplicate brand entries
4. **Tenant-Specific Brands**: Current migration matches with global brands only
5. **Performance**: Migration may take time for large product catalogs
6. **Backup**: Backup before migration
7. **Application Updates**: Update queries to use `brandId` instead of `brandText`
8. **Prisma Migration**: Run `npx prisma migrate dev` after SQL migration

---

## Application Code Updates

### Before:

```typescript
// Query products by brand text
const products = await prisma.product.findMany({
  where: {
    brand: {
      contains: 'Toyota'
    }
  }
});
```

### After:

```typescript
// Query products by brand ID (recommended)
const products = await prisma.product.findMany({
  where: {
    brandId: toyotaBrandId
  },
  include: {
    brand: true
  }
});

// Or query by brand name with relation
const products = await prisma.product.findMany({
  where: {
    brand: {
      name: {
        equals: 'Toyota',
        mode: 'insensitive'
      }
    }
  },
  include: {
    brand: true
  }
});
```

---

## Best Practices

1. **Use Foreign Keys**: Always reference brands by ID, not text
2. **Normalize Early**: Normalize data before it grows too large
3. **Data Quality**: Maintain brand list with proper names/codes
4. **Search Indexes**: Add indexes for brand name searches
5. **Brand Management**: Create UI for managing brands
6. **Audit Trail**: Track brand changes for historical accuracy

---

## Future Enhancements

1. **Brand Management UI**: Admin interface for managing brands
2. **Brand Suggestions**: Suggest brands based on product name
3. **Brand Analytics**: Reports by brand performance
4. **Auto-Creation**: Auto-create brands on product import
5. **Brand Validation**: Validate brand names against master list
6. **Brand Synonyms**: Handle brand name variations (Toyota, TM, Toyota Motors)