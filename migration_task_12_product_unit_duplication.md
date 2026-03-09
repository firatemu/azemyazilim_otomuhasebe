# TASK 12 — Fix Product.unit Duplication

## Changes Found

`Product.unit` duplicates information already stored in `units` table:

### Current State:

**`Product.unit`** - TEXT field (duplicate data)
- Stores unit name as text (e.g., "adet", "kg", "lt", "metre")
- No foreign key to `units` table
- Inconsistent with `units` table
- Violates normalization principles

### Related Table:

**`units`** - Normalized unit reference table ✓
- `id` (UUID)
- `name` (TEXT) - e.g., "Adet", "Kilogram", "Litre", "Metre"
- `code` (TEXT) - e.g., "ADET", "KG", "LT", "M"
- `isActive` (BOOLEAN)
- `tenantId` (String)

### Problem:

`Product.unit` should reference `units.id` instead of storing free text.

---

## Prisma Schema Changes

### Product - Add unitId relation
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
  brand                   Brand?                 @relation(fields: [brandId], references: [id], onDelete: SetNull)
  brandText               String?                @map("brand_text")
  mainCategoryId          String?                @map("main_category_id")
  mainCategory            Category?              @relation("ProductMainCategory", fields: [mainCategoryId], references: [id], onDelete: SetNull)
  subCategoryId           String?                @map("sub_category_id")
  subCategory            Category?              @relation("ProductSubCategory", fields: [subCategoryId], references: [id], onDelete: SetNull)
  categoryText            String                 @map("category_text")
  costPrice              Decimal                @default(0) @map("cost_price") @db.Decimal(12, 2)
  salePrice              Decimal                @default(0) @map("sale_price") @db.Decimal(12, 2)
  currency               String                 @default("TRY")
  vatRate                Int                    @default(20) @map("vat_rate")
  unitId                 String?                @map("unit_id")  // NEW RELATION
  unit                   Unit?                  @relation(fields: [unitId], references: [id], onDelete: SetNull)  // NEW RELATION
  unitText                String                 @default("adet") @map("unit")  // RENAME TO unitText
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
  vehicleCompatibility   Json?                  @map("vehicle_compatibility")
  createdAt              DateTime               @default(now()) @map("created_at")
  updatedAt              DateTime               @updatedAt @map("updated_at")

  vehicleCompatibilities ProductVehicleCompatibility[] @relation("ProductVehicles")

  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([tenantId, brandId])
  @@index([tenantId, mainCategoryId])
  @@index([tenantId, subCategoryId])
  @@index([tenantId, isActive])
  @@index([tenantId, code])
  @@index([tenantId, barcode])
  @@index([tenantId, name])
  @@index([brandText])
  @@index([categoryText])
  @@index([tenantId, unitId])  // NEW INDEX
  @@map("products")
}
```

---

## SQL Migration

```sql
-- ============================================
-- TASK 12: Fix Product.unit Duplication
-- ============================================

-- ============================================
-- STEP 1: Add unitId column
-- ============================================
ALTER TABLE products 
ADD COLUMN unit_id UUID REFERENCES units(id) ON DELETE SET NULL;

-- ============================================
-- STEP 2: Add index
-- ============================================
CREATE INDEX products_tenant_unit_idx ON products(tenant_id, unit_id);

-- ============================================
-- STEP 3: Analyze unit data
-- ============================================
-- Show unit distribution
SELECT 
    unit AS unit_text,
    COUNT(*) AS product_count,
    COUNT(DISTINCT tenant_id) AS unique_tenants
FROM products
WHERE unit IS NOT NULL 
  AND TRIM(unit) != ''
GROUP BY unit
ORDER BY product_count DESC
LIMIT 20;

-- Check which units exist in units table
SELECT 
    p.unit AS unit_text,
    COUNT(*) AS product_count,
    COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) AS matching_units_count,
    COUNT(CASE WHEN u.id IS NULL THEN 1 END) AS unmatched_units_count
FROM products p
LEFT JOIN units u ON LOWER(TRIM(p.unit)) = LOWER(TRIM(u.name))
  AND u.tenant_id IS NULL  -- Match with system/global units
WHERE p.unit IS NOT NULL 
  AND TRIM(p.unit) != ''
GROUP BY p.unit
ORDER BY product_count DESC
LIMIT 20;

-- ============================================
-- STEP 4: Migrate data - Match units by name
-- ============================================
-- Match products to units with exact name comparison
UPDATE products p
SET unit_id = u.id
FROM units u
WHERE p.unit_id IS NULL 
  AND p.unit IS NOT NULL
  AND TRIM(p.unit) != ''
  AND u.tenant_id IS NULL  -- Match with system/global units
  AND LOWER(TRIM(p.unit)) = LOWER(TRIM(u.name));

-- Case-insensitive partial match
UPDATE products p
SET unit_id = u.id
FROM units u
WHERE p.unit_id IS NULL 
  AND p.unit IS NOT NULL
  AND TRIM(p.unit) != ''
  AND u.tenant_id IS NULL
  AND LOWER(p.unit) LIKE CONCAT('%', LOWER(u.name), '%')
  AND (
    -- Prioritize units with longer names (more specific)
    LENGTH(u.name) >= (
      SELECT MAX(LENGTH(u2.name))
      FROM units u2
      WHERE u2.tenant_id IS NULL
        AND LOWER(p.unit) LIKE CONCAT('%', LOWER(u2.name), '%')
    )
  );

-- ============================================
-- STEP 5: Create missing units
-- ============================================
-- Extract unique unit names from products
INSERT INTO units (id, name, code, is_active, tenant_id, created_at)
SELECT 
    gen_random_uuid() AS id,
    -- Capitalize first letter, lowercase rest
    INITCAP(TRIM(LOWER(p.unit))) AS name,
    -- Generate code from name
    UPPER(REGEXP_REPLACE(
        INITCAP(TRIM(LOWER(p.unit))), 
        '[^a-zA-Z]', 
        ''
    )) AS code,
    true AS is_active,
    NULL AS tenant_id,
    NOW() AS created_at
FROM products p
WHERE p.unit IS NOT NULL 
  AND TRIM(p.unit) != ''
  AND p.unit_id IS NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM units u 
    WHERE u.tenant_id IS NULL 
      AND LOWER(TRIM(p.unit)) = LOWER(TRIM(u.name))
  )
GROUP BY INITCAP(TRIM(LOWER(p.unit)));

-- ============================================
-- STEP 6: Link products to newly created units
-- ============================================
UPDATE products p
SET unit_id = u.id
FROM units u
WHERE p.unit_id IS NULL 
  AND p.unit IS NOT NULL
  AND TRIM(p.unit) != ''
  AND u.tenant_id IS NULL
  AND LOWER(TRIM(p.unit)) = LOWER(TRIM(u.name));

-- ============================================
-- STEP 7: Handle common unit name variations
-- ============================================
-- Map common variations to standard units
UPDATE products p
SET unit_id = (
    SELECT u.id
    FROM units u
    WHERE u.tenant_id IS NULL
    ORDER BY 
      CASE 
        WHEN LOWER(TRIM(p.unit)) = 'adet' AND LOWER(u.name) = 'adet' THEN 1
        WHEN LOWER(TRIM(p.unit)) = 'kg' AND LOWER(u.name) = 'kilogram' THEN 1
        WHEN LOWER(TRIM(p.unit)) = 'lt' AND LOWER(u.name) = 'litre' THEN 1
        WHEN LOWER(TRIM(p.unit)) = 'm' AND LOWER(u.name) = 'metre' THEN 1
        WHEN LOWER(TRIM(p.unit)) = 'cm' AND LOWER(u.name) = 'santimetre' THEN 1
        WHEN LOWER(TRIM(p.unit)) = 'm2' AND LOWER(u.name) = 'metrekare' THEN 1
        WHEN LOWER(TRIM(p.unit)) = 'm3' AND LOWER(u.name) = 'metreküp' THEN 1
        ELSE 99
      END
    LIMIT 1
)
WHERE p.unit_id IS NULL 
  AND p.unit IS NOT NULL
  AND TRIM(p.unit) != '';

-- ============================================
-- STEP 8: Verify migration
-- ============================================
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN unit IS NOT NULL THEN 1 END) AS products_with_unit_text,
    COUNT(CASE WHEN unit_id IS NOT NULL THEN 1 END) AS products_with_unit_id,
    COUNT(CASE WHEN unit IS NOT NULL AND unit_id IS NULL THEN 1 END) AS unmatched_products,
    COUNT(CASE WHEN unit IS NULL AND unit_id IS NULL THEN 1 END) AS products_without_unit
FROM products;

-- Show unmatched units for manual review
SELECT 
    unit AS unit_text,
    COUNT(*) AS product_count
FROM products
WHERE unit IS NOT NULL 
  AND TRIM(unit) != ''
  AND unit_id IS NULL
GROUP BY unit
ORDER BY product_count DESC
LIMIT 20;

-- ============================================
-- STEP 9: Rename unit column to unitText (keep for reference)
-- ============================================
ALTER TABLE products RENAME COLUMN unit TO unit_text;

-- ============================================
-- STEP 10: (OPTIONAL) Remove unitText column after verification
-- ============================================
-- Uncomment this after confirming migration is successful
-- ALTER TABLE products DROP COLUMN unit_text;
```

---

## Data Migration Strategy

### Phase 1: Exact Match (Automated)

Match products to units with exact name comparison:
```sql
UPDATE products p
SET unit_id = u.id
FROM units u
WHERE LOWER(TRIM(p.unit)) = LOWER(TRIM(u.name));
```

### Phase 2: Fuzzy Match (Automated)

Match products to units with partial name matching:
```sql
UPDATE products p
SET unit_id = u.id
FROM units u
WHERE LOWER(p.unit) LIKE CONCAT('%', LOWER(u.name), '%');
```

### Phase 3: Create Missing Units (Automated)

Create unit records for unmatched product units:
```sql
INSERT INTO units (name, code, is_active)
SELECT DISTINCT INITCAP(unit), UPPER(unit), true
FROM products
WHERE unit_id IS NULL AND unit IS NOT NULL;
```

### Phase 4: Handle Common Variations (Automated)

Map common unit name variations:
```sql
-- adet -> Adet
-- kg -> Kilogram
-- lt -> Litre
-- m -> Metre
-- cm -> Santimetre
```

### Phase 5: Manual Review (Required)

Review unmatched units and create/match manually:
```sql
SELECT unit, COUNT(*) 
FROM products 
WHERE unit_id IS NULL 
GROUP BY unit 
ORDER BY COUNT(*) DESC;
```

---

## Rollback

```sql
-- ============================================
-- Rollback: Revert unit normalization
-- ============================================

-- Step 1: Rename unit_text back to unit
ALTER TABLE products RENAME COLUMN unit_text TO unit;

-- Step 2: Drop unit_id column
ALTER TABLE products DROP COLUMN IF EXISTS unit_id;

-- Step 3: Drop index
DROP INDEX IF EXISTS products_tenant_unit_idx;

-- Step 4: Remove units created during migration (optional)
-- WARNING: This removes units created for product units
-- DELETE FROM units WHERE id IN (unit_ids_created_during_migration);
```

---

## Verification Queries

```sql
-- Verify unit_id column exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
  AND column_name = 'unit_id';

-- Verify index exists
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'products'
  AND indexname LIKE '%unit%';

-- Verify migration statistics
SELECT 
    'Migration Statistics' AS metric,
    COUNT(*) AS total_products
FROM products

UNION ALL

SELECT 
    'Products with unit_text',
    COUNT(*)
FROM products
WHERE unit_text IS NOT NULL

UNION ALL

SELECT 
    'Products with unit_id',
    COUNT(*)
FROM products
WHERE unit_id IS NOT NULL

UNION ALL

SELECT 
    'Matched units (unit_text = unit.name)',
    COUNT(*)
FROM products p
JOIN units u ON p.unit_id = u.id
WHERE LOWER(TRIM(p.unit_text)) = LOWER(TRIM(u.name))

UNION ALL

SELECT 
    'Unmatched units (manual review needed)',
    COUNT(*)
FROM products
WHERE unit_text IS NOT NULL 
  AND unit_id IS NULL;

-- Verify data integrity
SELECT 
    p.id AS product_id,
    p.code AS product_code,
    p.unit_text AS old_unit,
    u.name AS new_unit,
    CASE 
        WHEN p.unit_text IS NOT NULL AND u.name IS NULL THEN 'UNMATCHED'
        WHEN LOWER(TRIM(p.unit_text)) = LOWER(TRIM(u.name)) THEN 'EXACT MATCH'
        WHEN LOWER(p.unit_text) LIKE CONCAT('%', LOWER(u.name), '%') THEN 'FUZZY MATCH'
        ELSE 'UNKNOWN'
    END AS match_type
FROM products p
LEFT JOIN units u ON p.unit_id = u.id
WHERE p.unit_text IS NOT NULL
ORDER BY match_type, p.unit_text
LIMIT 50;

-- Verify unit distribution
SELECT 
    u.name AS unit_name,
    COUNT(p.id) AS product_count,
    SUM(p.stock_quantity) AS total_stock
FROM units u
LEFT JOIN products p ON u.id = p.unit_id
WHERE u.tenant_id IS NULL
GROUP BY u.name
ORDER BY product_count DESC
LIMIT 20;
```

---

## Important Notes

1. **Manual Review Required**: Some units won't match automatically
2. **Unit Text Preservation**: Keep `unitText` column for reference until verified
3. **Duplicate Units**: May create duplicate unit entries
4. **Common Variations**: Handle common unit name variations (kg/Kilogram, lt/Litre)
5. **Tenant-Specific Units**: Current migration matches with global units only
6. **Performance**: Migration may take time for large product catalogs
7. **Backup**: Backup before migration
8. **Application Updates**: Update queries to use `unitId` instead of `unitText`
9. **Prisma Migration**: Run `npx prisma migrate dev` after SQL migration

---

## Application Code Updates

### Before:

```typescript
// Query products by unit text
const products = await prisma.product.findMany({
  where: {
    unit: {
      contains: 'kg'
    }
  }
});

// Get unit name
const productName = product.name;
const unitName = product.unit;  // e.g., "kg"
```

### After:

```typescript
// Query products by unit ID (recommended)
const products = await prisma.product.findMany({
  where: {
    unitId: kilogramUnitId
  },
  include: {
    unit: true
  }
});

// Or query by unit name with relation
const products = await prisma.product.findMany({
  where: {
    unit: {
      name: {
        equals: 'Kilogram',
        mode: 'insensitive'
      }
    }
  },
  include: {
    unit: true
  }
});

// Get unit name
const productName = product.name;
const unitName = product.unit?.name;  // e.g., "Kilogram"
```

---

## Best Practices

1. **Use Foreign Keys**: Always reference units by ID, not text
2. **Normalize Early**: Normalize data before it grows too large
3. **Data Quality**: Maintain unit list with proper names/codes
4. **Search Indexes**: Add indexes for unit name searches
5. **Unit Management**: Create UI for managing units
6. **Audit Trail**: Track unit changes for historical accuracy

---

## Common Unit Mappings

| Input Text | Standard Unit | Unit Code |
|------------|---------------|-----------|
| adet | Adet | ADET |
| kg, kilogram | Kilogram | KG |
| lt, litre | Litre | LT |
| m, metre | Metre | M |
| cm, santimetre | Santimetre | CM |
| m2, metrekare | Metrekare | M2 |
| m3, metreküp | Metreküp | M3 |
| gr, gram | Gram | GR |
| ton | Ton | TON |

---

## Future Enhancements

1. **Unit Management UI**: Admin interface for managing units
2. **Unit Conversion**: Unit conversion support (kg → gr, m → cm)
3. **Unit Validation**: Validate unit names against master list
4. **Unit Categories**: Group units by category (weight, length, volume)
5. **Auto-Creation**: Auto-create units on product import
6. **Unit Analytics**: Reports by unit usage