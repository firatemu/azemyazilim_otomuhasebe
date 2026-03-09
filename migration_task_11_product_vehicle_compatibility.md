# TASK 11 — Create ProductVehicleCompatibility Table

## Changes Found

`Product` table stores vehicle compatibility data as JSON in `vehicleCompatibility` field:

### Current State:

**`Product.vehicleCompatibility`** - JSON field (non-normalized)
- Structure: `[{ brand: "Toyota", model: "Corolla", year: "2020-2022" }, ...]`
- No validation
- Difficult to query/report
- Cannot index efficiently
- No referential integrity

### Problem:

Vehicle compatibility should be a separate table with proper relations to `Brand` and vehicle models.

---

## Prisma Schema Changes

### Create ProductVehicleCompatibility model
```prisma
model ProductVehicleCompatibility {
  id          String   @id @default(uuid())
  productId   String   @map("product_id")
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  brandId     String   @map("brand_id")
  brand       Brand    @relation(fields: [brandId], references: [id])
  model       String   @map("model")  // Vehicle model name (e.g., "Corolla", "Civic")
  startYear   Int?     @map("start_year")  // Start year of compatibility (e.g., 2020)
  endYear     Int?     @map("end_year")  // End year of compatibility (e.g., 2022, NULL for all years)
  notes       String?  @map("notes")  // Additional notes (e.g., "Only 1.6L engine")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  tenantId    String   @map("tenant_id")

  @@unique([productId, brandId, model, startYear, endYear])
  @@index([tenantId])
  @@index([productId])
  @@index([brandId])
  @@index([tenantId, brandId, model])
  @@map("product_vehicle_compatibilities")
}

model Product {
  id                     String                         @id @default(uuid())
  tenantId                String                         @map("tenant_id")
  tenant                  Tenant                         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  code                    String                         @unique
  barcode                 String?                        @unique @map("barcode")
  name                    String
  description             String?                        @db.Text
  brandId                 String?                        @map("brand_id")
  brand                   Brand?                         @relation(fields: [brandId], references: [id], onDelete: SetNull)
  brandText               String?                        @map("brand_text")
  mainCategoryId          String?                        @map("main_category_id")
  mainCategory            Category?                      @relation("ProductMainCategory", fields: [mainCategoryId], references: [id], onDelete: SetNull)
  subCategoryId           String?                        @map("sub_category_id")
  subCategory            Category?                      @relation("ProductSubCategory", fields: [subCategoryId], references: [id], onDelete: SetNull)
  categoryText            String                         @map("category_text")
  costPrice              Decimal                        @default(0) @map("cost_price") @db.Decimal(12, 2)
  salePrice              Decimal                        @default(0) @map("sale_price") @db.Decimal(12, 2)
  currency               String                         @default("TRY")
  vatRate                Int                            @default(20) @map("vat_rate")
  unit                   String                         @default("adet")
  stockQuantity           Int                            @default(0) @map("stock_quantity")
  minStock               Int                            @default(0) @map("min_stock")
  maxStock               Int                            @default(0) @map("max_stock")
  stockLocation          String?                        @map("stock_location")
  shelf                  String?                        @map("shelf")
  isActive               Boolean                        @default(true) @map("is_active")
  weight                 Decimal?                       @map("weight") @db.Decimal(10, 3)
  dimensions            Json?                          @map("dimensions")
  warrantyMonths         Int?                           @map("warranty_months")
  notes                  String?                        @map("notes")
  imageUrl               String?                        @map("image_url")
  tags                   String[]                       @default([])
  meta                   Json?                          @map("meta")
  equivalencyGroupId     String?                        @map("equivalency_group_id")
  equivalencyGroup       EquivalencyGroup?              @relation(fields: [equivalencyGroupId], references: [id])
  vehicleCompatibility   Json?                          @map("vehicle_compatibility")  // KEEP FOR MIGRATION
  createdAt              DateTime                       @default(now()) @map("created_at")
  updatedAt              DateTime                       @updatedAt @map("updated_at")

  // Add new relation
  vehicleCompatibilities ProductVehicleCompatibility[]   @relation("ProductVehicles")

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
  @@map("products")
}
```

---

## SQL Migration

```sql
-- ============================================
-- TASK 11: Create ProductVehicleCompatibility Table
-- ============================================

-- ============================================
-- STEP 1: Create product_vehicle_compatibilities table
-- ============================================
CREATE TABLE product_vehicle_compatibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    start_year INT,
    end_year INT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    tenant_id TEXT NOT NULL,
    CONSTRAINT unique_product_vehicle UNIQUE (product_id, brand_id, model, start_year, end_year)
);

-- ============================================
-- STEP 2: Create indexes
-- ============================================
CREATE INDEX pvc_tenant_idx ON product_vehicle_compatibilities(tenant_id);
CREATE INDEX pvc_product_idx ON product_vehicle_compatibilities(product_id);
CREATE INDEX pvc_brand_idx ON product_vehicle_compatibilities(brand_id);
CREATE INDEX pvc_tenant_brand_model_idx ON product_vehicle_compatibilities(tenant_id, brand_id, model);

-- ============================================
-- STEP 3: Analyze existing vehicle compatibility data
-- ============================================
-- Check which products have vehicle compatibility data
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN vehicle_compatibility IS NOT NULL THEN 1 END) AS products_with_vehicle_data,
    COUNT(CASE WHEN vehicle_compatibility IS NOT NULL AND jsonb_array_length(vehicle_compatibility) > 0 THEN 1 END) AS products_with_valid_vehicle_data
FROM products;

-- Sample vehicle compatibility data
SELECT 
    id,
    code,
    name,
    vehicle_compatibility
FROM products
WHERE vehicle_compatibility IS NOT NULL
  AND jsonb_array_length(vehicle_compatibility) > 0
LIMIT 5;

-- ============================================
-- STEP 4: Migrate data from JSON to relational table
-- ============================================
-- Insert vehicle compatibility data
INSERT INTO product_vehicle_compatibilities (
    product_id,
    brand_id,
    model,
    start_year,
    end_year,
    notes,
    is_active,
    created_at,
    tenant_id
)
SELECT 
    p.id AS product_id,
    b.id AS brand_id,
    -- Extract model from JSON
    (vc->>'model') AS model,
    -- Extract start year from JSON (e.g., "2020-2022" -> 2020)
    CASE 
        WHEN vc->>'year' ~ '^\d{4}-\d{4}$' THEN 
            CAST(SPLIT_PART(vc->>'year', '-', 1) AS INT)
        WHEN vc->>'year' ~ '^\d{4}$' THEN 
            CAST(vc->>'year' AS INT)
        WHEN vc->>'start_year' IS NOT NULL THEN 
            CAST(vc->>'start_year' AS INT)
        ELSE NULL
    END AS start_year,
    -- Extract end year from JSON (e.g., "2020-2022" -> 2022)
    CASE 
        WHEN vc->>'year' ~ '^\d{4}-\d{4}$' THEN 
            CAST(SPLIT_PART(vc->>'year', '-', 2) AS INT)
        WHEN vc->>'end_year' IS NOT NULL THEN 
            CAST(vc->>'end_year' AS INT)
        ELSE NULL
    END AS end_year,
    -- Extract notes from JSON
    vc->>'notes' AS notes,
    true AS is_active,
    NOW() AS created_at,
    p.tenant_id
FROM products p
CROSS JOIN jsonb_array_elements(p.vehicle_compatibility) AS vc
JOIN brands b ON LOWER(TRIM(vc->>'brand')) = LOWER(TRIM(b.name))
WHERE p.vehicle_compatibility IS NOT NULL
  AND jsonb_array_length(p.vehicle_compatibility) > 0
  AND NOT EXISTS (
    -- Avoid duplicates
    SELECT 1
    FROM product_vehicle_compatibilities pvc
    WHERE pvc.product_id = p.id
      AND pvc.brand_id = b.id
      AND pvc.model = (vc->>'model')
      AND pvc.start_year = (
        CASE 
            WHEN vc->>'year' ~ '^\d{4}-\d{4}$' THEN CAST(SPLIT_PART(vc->>'year', '-', 1) AS INT)
            WHEN vc->>'year' ~ '^\d{4}$' THEN CAST(vc->>'year' AS INT)
            WHEN vc->>'start_year' IS NOT NULL THEN CAST(vc->>'start_year' AS INT)
            ELSE NULL
        END
      )
      AND pvc.end_year = (
        CASE 
            WHEN vc->>'year' ~ '^\d{4}-\d{4}$' THEN CAST(SPLIT_PART(vc->>'year', '-', 2) AS INT)
            WHEN vc->>'end_year' IS NOT NULL THEN CAST(vc->>'end_year' AS INT)
            ELSE NULL
        END
  );

-- ============================================
-- STEP 5: Handle unmatched brands (create brand entries)
-- ============================================
-- Extract unique brand names from vehicle compatibility JSON that don't match existing brands
WITH unmatched_brands AS (
    SELECT DISTINCT 
        TRIM(vc->>'brand') AS brand_name
    FROM products p
    CROSS JOIN jsonb_array_elements(p.vehicle_compatibility) AS vc
    WHERE p.vehicle_compatibility IS NOT NULL
      AND vc->>'brand' IS NOT NULL
      AND TRIM(vc->>'brand') != ''
      AND NOT EXISTS (
          SELECT 1
          FROM brands b
          WHERE LOWER(TRIM(b.name)) = LOWER(TRIM(vc->>'brand'))
            AND b.tenant_id IS NULL
      )
)
INSERT INTO brands (id, name, code, is_active, tenant_id, created_at)
SELECT 
    gen_random_uuid() AS id,
    UPPER(brand_name) AS name,
    UPPER(REGEXP_REPLACE(brand_name, '[^a-zA-Z0-9]', '_')) AS code,
    true AS is_active,
    NULL AS tenant_id,
    NOW() AS created_at
FROM unmatched_brands;

-- Re-run migration for newly created brands
INSERT INTO product_vehicle_compatibilities (
    product_id,
    brand_id,
    model,
    start_year,
    end_year,
    notes,
    is_active,
    created_at,
    tenant_id
)
SELECT 
    p.id AS product_id,
    b.id AS brand_id,
    (vc->>'model') AS model,
    CASE 
        WHEN vc->>'year' ~ '^\d{4}-\d{4}$' THEN CAST(SPLIT_PART(vc->>'year', '-', 1) AS INT)
        WHEN vc->>'year' ~ '^\d{4}$' THEN CAST(vc->>'year' AS INT)
        WHEN vc->>'start_year' IS NOT NULL THEN CAST(vc->>'start_year' AS INT)
        ELSE NULL
    END AS start_year,
    CASE 
        WHEN vc->>'year' ~ '^\d{4}-\d{4}$' THEN CAST(SPLIT_PART(vc->>'year', '-', 2) AS INT)
        WHEN vc->>'end_year' IS NOT NULL THEN CAST(vc->>'end_year' AS INT)
        ELSE NULL
    END AS end_year,
    vc->>'notes' AS notes,
    true AS is_active,
    NOW() AS created_at,
    p.tenant_id
FROM products p
CROSS JOIN jsonb_array_elements(p.vehicle_compatibility) AS vc
JOIN brands b ON LOWER(TRIM(vc->>'brand')) = LOWER(TRIM(b.name))
WHERE p.vehicle_compatibility IS NOT NULL
  AND jsonb_array_length(p.vehicle_compatibility) > 0
  AND NOT EXISTS (
    SELECT 1
    FROM product_vehicle_compatibilities pvc
    WHERE pvc.product_id = p.id
      AND pvc.brand_id = b.id
      AND pvc.model = (vc->>'model')
      AND pvc.start_year = (
        CASE 
            WHEN vc->>'year' ~ '^\d{4}-\d{4}$' THEN CAST(SPLIT_PART(vc->>'year', '-', 1) AS INT)
            WHEN vc->>'year' ~ '^\d{4}$' THEN CAST(vc->>'year' AS INT)
            WHEN vc->>'start_year' IS NOT NULL THEN CAST(vc->>'start_year' AS INT)
            ELSE NULL
        END
      )
      AND pvc.end_year = (
        CASE 
            WHEN vc->>'year' ~ '^\d{4}-\d{4}$' THEN CAST(SPLIT_PART(vc->>'year', '-', 2) AS INT)
            WHEN vc->>'end_year' IS NOT NULL THEN CAST(vc->>'end_year' AS INT)
            ELSE NULL
        END
  );

-- ============================================
-- STEP 6: Verify migration
-- ============================================
SELECT 
    COUNT(*) AS total_compatibilities,
    COUNT(DISTINCT product_id) AS unique_products,
    COUNT(DISTINCT brand_id) AS unique_brands,
    COUNT(CASE WHEN start_year IS NOT NULL THEN 1 END) AS with_start_year,
    COUNT(CASE WHEN end_year IS NOT NULL THEN 1 END) AS with_end_year,
    COUNT(CASE WHEN notes IS NOT NULL THEN 1 END) AS with_notes
FROM product_vehicle_compatibilities;

-- Show sample compatibility data
SELECT 
    p.code AS product_code,
    p.name AS product_name,
    b.name AS brand_name,
    pvc.model,
    pvc.start_year,
    pvc.end_year,
    pvc.notes
FROM product_vehicle_compatibilities pvc
JOIN products p ON pvc.product_id = p.id
JOIN brands b ON pvc.brand_id = b.id
ORDER BY p.code, b.name
LIMIT 20;

-- ============================================
-- STEP 7: (OPTIONAL) Drop vehicle_compatibility column after verification
-- ============================================
-- Uncomment this after confirming migration is successful
-- ALTER TABLE products DROP COLUMN vehicle_compatibility;
```

---

## Data Migration Strategy

### Phase 1: Parse JSON Data

Parse `vehicleCompatibility` JSON array:
```json
[
  {
    "brand": "Toyota",
    "model": "Corolla",
    "year": "2020-2022",
    "notes": "Only 1.6L engine"
  },
  {
    "brand": "Honda",
    "model": "Civic",
    "start_year": 2018,
    "end_year": 2022
  }
]
```

### Phase 2: Match/Create Brands

Match vehicles to existing brands or create new ones:
```sql
-- Match existing brands
JOIN brands b ON LOWER(vc->>'brand') = LOWER(b.name);

-- Create new brands if needed
INSERT INTO brands (name, code)
SELECT DISTINCT brand_name
FROM vehicle_data;
```

### Phase 3: Insert Compatibility Records

Insert normalized compatibility data:
```sql
INSERT INTO product_vehicle_compatibilities (
    product_id, brand_id, model, start_year, end_year
)
SELECT 
    product_id, brand_id, model, start_year, end_year
FROM parsed_vehicle_data;
```

---

## Rollback

```sql
-- ============================================
-- Rollback: Remove ProductVehicleCompatibility table
-- ============================================

-- Step 1: Drop the table
DROP TABLE IF EXISTS product_vehicle_compatibilities CASCADE;

-- Step 2: Drop indexes (automatically dropped with table)

-- Note: vehicle_compatibility JSON column is kept for reference
```

---

## Verification Queries

```sql
-- Verify table exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'product_vehicle_compatibilities'
ORDER BY ordinal_position;

-- Verify indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'product_vehicle_compatibilities'
ORDER BY indexname;

-- Verify migration statistics
SELECT 
    'Total Products' AS metric,
    COUNT(*) AS count
FROM products

UNION ALL

SELECT 
    'Products with JSON vehicle data',
    COUNT(*)
FROM products
WHERE vehicle_compatibility IS NOT NULL
  AND jsonb_array_length(vehicle_compatibility) > 0

UNION ALL

SELECT 
    'Products with relational vehicle data',
    COUNT(DISTINCT product_id)
FROM product_vehicle_compatibilities

UNION ALL

SELECT 
    'Total vehicle compatibility records',
    COUNT(*)
FROM product_vehicle_compatibilities

UNION ALL

SELECT 
    'Unique brands in compatibility',
    COUNT(DISTINCT brand_id)
FROM product_vehicle_compatibilities

UNION ALL

SELECT 
    'Unique models in compatibility',
    COUNT(DISTINCT brand_id, model)
FROM product_vehicle_compatibilities;

-- Verify data integrity
SELECT 
    p.id AS product_id,
    p.code AS product_code,
    COUNT(pvc.id) AS compatibility_count,
    COUNT(DISTINCT b.id) AS unique_brands,
    STRING_AGG(DISTINCT b.name, ', ') AS brands
FROM products p
LEFT JOIN product_vehicle_compatibilities pvc ON p.id = pvc.product_id
LEFT JOIN brands b ON pvc.brand_id = b.id
WHERE p.vehicle_compatibility IS NOT NULL
GROUP BY p.id, p.code
ORDER BY compatibility_count DESC
LIMIT 20;

-- Verify year range validity
SELECT 
    COUNT(*) AS invalid_year_ranges
FROM product_vehicle_compatibilities
WHERE 
    (start_year IS NOT NULL AND end_year IS NOT NULL)
    AND start_year > end_year;
```

---

## Important Notes

1. **JSON Column Preservation**: Keep `vehicleCompatibility` column for reference until verified
2. **Brand Matching**: Some brands may need to be created during migration
3. **Year Range Parsing**: Handle different year formats (e.g., "2020-2022", "2020", start_year/end_year)
4. **Performance**: JSON parsing may be slow for large datasets
5. **Manual Review**: Review migrated data for accuracy
6. **Backup**: Backup before migration
7. **Application Updates**: Update queries to use `vehicleCompatibilities` relation
8. **Prisma Migration**: Run `npx prisma migrate dev` after SQL migration

---

## Application Code Updates

### Before:

```typescript
// Query products with vehicle compatibility (JSON)
const products = await prisma.product.findMany({
  where: {
    vehicleCompatibility: {
      not: Prisma.JsonNull
    }
  }
});

// Check if product is compatible with specific vehicle
const isCompatible = products.some(p => {
  const compat = p.vehicleCompatibility as any[];
  return compat.some(c => 
    c.brand === 'Toyota' && 
    c.model === 'Corolla' &&
    (c.year || '').includes('2020')
  );
});
```

### After:

```typescript
// Query products with vehicle compatibility (relational)
const products = await prisma.product.findMany({
  where: {
    vehicleCompatibilities: {
      some: {
        brand: {
          name: {
            equals: 'Toyota',
            mode: 'insensitive'
          }
        },
        model: {
          equals: 'Corolla',
          mode: 'insensitive'
        },
        startYear: {
          lte: 2020
        },
        endYear: {
          gte: 2020
        }
      }
    }
  },
  include: {
    vehicleCompatibilities: {
      include: {
        brand: true
      }
    }
  }
});

// Check if product is compatible with specific vehicle
const isCompatible = products.some(p => {
  return p.vehicleCompatibilities.some(c => 
    c.brand.name === 'Toyota' && 
    c.model === 'Corolla' &&
    (!c.startYear || c.startYear <= 2020) &&
    (!c.endYear || c.endYear >= 2020)
  );
});
```

---

## Best Practices

1. **Use Relations**: Always use foreign keys, not JSON for structured data
2. **Index Effectively**: Add indexes on frequently queried columns
3. **Validate Data**: Ensure year ranges are valid (start_year <= end_year)
4. **Normalize Early**: Normalize data before it grows too large
5. **Data Quality**: Maintain vehicle brand/model master list
6. **Search Optimization**: Use text search for model names

---

## Future Enhancements

1. **Vehicle Model Table**: Create separate `vehicle_models` table
2. **Year Range Validation**: Add check constraint for valid year ranges
3. **Compatibility Search**: Advanced search by vehicle details
4. **Auto-Suggestion**: Suggest compatible vehicles for products
5. **Compatibility Analytics**: Reports on product-vehicle compatibility
6. **Bulk Import**: Import compatibility data from OEM catalogs