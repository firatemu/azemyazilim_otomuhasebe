# TASK 10 — Normalize Product.category Field

## Changes Found

`Product.category` is a free-text TEXT field causing data inconsistency:

### Current State:

**`Product.category`** - TEXT field (inconsistent data)
- Examples: "Electronics", "electronics", "Elektronik", "ELECTRONICS", "Electronics "
- No foreign key to `categories` table
- No validation
- Difficult to query/report

### Related Tables:

**`categories`** - Normalized category reference table ✓
- `id` (UUID)
- `name` (TEXT)
- `code` (TEXT)
- `mainCategoryId` (UUID, nullable)
- `isActive` (BOOLEAN)
- `tenantId` (String)

**`Product.mainCategoryId`** - Already exists ✓
**`Product.subCategoryId`** - Already exists ✓

### Problem:

`Product.category` should reference `categories.id` instead of storing free text. There's already `mainCategoryId` and `subCategoryId`, but `category` stores the full path as text.

---

## Prisma Schema Changes

### Product - Rename category to categoryText
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
  brandText               String?                @map("brand_text")  // FROM TASK 9
  mainCategoryId          String?                @map("main_category_id")
  mainCategory            Category?              @relation("ProductMainCategory", fields: [mainCategoryId], references: [id], onDelete: SetNull)
  subCategoryId           String?                @map("sub_category_id")
  subCategory            Category?              @relation("ProductSubCategory", fields: [subCategoryId], references: [id], onDelete: SetNull)
  categoryText            String                 @map("category_text")  // RENAMED FROM category
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
  @@index([tenantId, brandId])
  @@index([tenantId, mainCategoryId])
  @@index([tenantId, subCategoryId])
  @@index([tenantId, isActive])
  @@index([tenantId, code])
  @@index([tenantId, barcode])
  @@index([tenantId, name])
  @@index([brandText])
  @@index([categoryText])  // NEW INDEX
  @@map("products")
}
```

---

## SQL Migration

```sql
-- ============================================
-- TASK 10: Normalize Product.category Field
-- ============================================

-- ============================================
-- STEP 1: Rename category to categoryText
-- ============================================
ALTER TABLE products RENAME COLUMN category TO category_text;

-- ============================================
-- STEP 2: Add index for category_text
-- ============================================
CREATE INDEX products_category_text_idx ON products(category_text);

-- ============================================
-- STEP 3: Analyze category data
-- ============================================
-- Show category distribution
SELECT 
    category_text AS category,
    COUNT(*) AS product_count,
    COUNT(DISTINCT main_category_id) AS unique_main_categories,
    COUNT(DISTINCT sub_category_id) AS unique_sub_categories
FROM products
WHERE category_text IS NOT NULL 
  AND TRIM(category_text) != ''
GROUP BY category_text
ORDER BY product_count DESC
LIMIT 30;

-- ============================================
-- STEP 4: Extract category path from category_text
-- ============================================
-- Many products have category like "Electronics > TV > LED"
-- We need to extract and match main/sub categories

-- First, identify products with category_text but no main/sub categories
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN category_text IS NOT NULL THEN 1 END) AS products_with_category_text,
    COUNT(CASE WHEN main_category_id IS NOT NULL THEN 1 END) AS products_with_main_category,
    COUNT(CASE WHEN sub_category_id IS NOT NULL THEN 1 END) AS products_with_sub_category,
    COUNT(CASE 
        WHEN category_text IS NOT NULL 
        AND main_category_id IS NULL 
        AND sub_category_id IS NULL 
        THEN 1 
    END) AS products_needing_migration
FROM products;

-- ============================================
-- STEP 5: Migrate data - Match categories by name
-- ============================================
-- Match category_text to main categories
UPDATE products p
SET main_category_id = c.id
FROM categories c
WHERE p.category_text IS NOT NULL 
  AND TRIM(p.category_text) != ''
  AND p.main_category_id IS NULL
  AND c.tenant_id IS NULL  -- Match with system/global categories
  AND c.main_category_id IS NULL  -- Only main categories
  AND (
    -- Exact match
    LOWER(TRIM(p.category_text)) = LOWER(TRIM(c.name))
    OR
    -- Partial match (category_text contains category name)
    LOWER(p.category_text) LIKE CONCAT('%', LOWER(c.name), '%')
  );

-- Match category_text to sub categories
UPDATE products p
SET sub_category_id = c.id
FROM categories c
WHERE p.category_text IS NOT NULL 
  AND TRIM(p.category_text) != ''
  AND p.sub_category_id IS NULL
  AND c.tenant_id IS NULL
  AND c.main_category_id IS NOT NULL  -- Only sub categories
  AND (
    -- Exact match
    LOWER(TRIM(p.category_text)) = LOWER(TRIM(c.name))
    OR
    -- Partial match
    LOWER(p.category_text) LIKE CONCAT('%', LOWER(c.name), '%')
  );

-- ============================================
-- STEP 6: Create missing categories
-- ============================================
-- Create main categories for unmatched products
INSERT INTO categories (id, name, code, main_category_id, is_active, tenant_id, created_at)
SELECT 
    gen_random_uuid() AS id,
    -- Extract first part of category_text (before > or /)
    CASE 
        WHEN p.category_text LIKE '%>%' THEN TRIM(SPLIT_PART(p.category_text, '>', 1))
        WHEN p.category_text LIKE '%/%' THEN TRIM(SPLIT_PART(p.category_text, '/', 1))
        ELSE TRIM(p.category_text)
    END AS name,
    -- Generate code from name
    UPPER(REGEXP_REPLACE(
        CASE 
            WHEN p.category_text LIKE '%>%' THEN TRIM(SPLIT_PART(p.category_text, '>', 1))
            WHEN p.category_text LIKE '%/%' THEN TRIM(SPLIT_PART(p.category_text, '/', 1))
            ELSE TRIM(p.category_text)
        END, 
        '[^a-zA-Z0-9]', 
        '_'
    )) AS code,
    NULL AS main_category_id,
    true AS is_active,
    NULL AS tenant_id,
    NOW() AS created_at
FROM products p
WHERE p.category_text IS NOT NULL 
  AND TRIM(p.category_text) != ''
  AND p.main_category_id IS NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM categories c 
    WHERE c.tenant_id IS NULL 
      AND c.main_category_id IS NULL
      AND LOWER(
        CASE 
            WHEN p.category_text LIKE '%>%' THEN TRIM(SPLIT_PART(p.category_text, '>', 1))
            WHEN p.category_text LIKE '%/%' THEN TRIM(SPLIT_PART(p.category_text, '/', 1))
            ELSE TRIM(p.category_text)
        END
      ) = LOWER(c.name)
  )
GROUP BY 
    CASE 
        WHEN p.category_text LIKE '%>%' THEN TRIM(SPLIT_PART(p.category_text, '>', 1))
        WHEN p.category_text LIKE '%/%' THEN TRIM(SPLIT_PART(p.category_text, '/', 1))
        ELSE TRIM(p.category_text)
    END;

-- Link products to newly created main categories
UPDATE products p
SET main_category_id = c.id
FROM categories c
WHERE p.main_category_id IS NULL 
  AND p.category_text IS NOT NULL
  AND TRIM(p.category_text) != ''
  AND c.tenant_id IS NULL
  AND c.main_category_id IS NULL
  AND LOWER(
    CASE 
        WHEN p.category_text LIKE '%>%' THEN TRIM(SPLIT_PART(p.category_text, '>', 1))
        WHEN p.category_text LIKE '%/%' THEN TRIM(SPLIT_PART(p.category_text, '/', 1))
        ELSE TRIM(p.category_text)
    END
  ) = LOWER(c.name);

-- ============================================
-- STEP 7: Verify migration
-- ============================================
SELECT 
    COUNT(*) AS total_products,
    COUNT(CASE WHEN category_text IS NOT NULL THEN 1 END) AS products_with_category_text,
    COUNT(CASE WHEN main_category_id IS NOT NULL THEN 1 END) AS products_with_main_category,
    COUNT(CASE WHEN sub_category_id IS NOT NULL THEN 1 END) AS products_with_sub_category,
    COUNT(CASE 
        WHEN category_text IS NOT NULL 
        AND main_category_id IS NULL 
        AND sub_category_id IS NULL 
        THEN 1 
    END) AS products_needing_manual_review
FROM products;

-- Show unmatched categories for manual review
SELECT 
    category_text AS category_path,
    COUNT(*) AS product_count
FROM products
WHERE category_text IS NOT NULL 
  AND TRIM(category_text) != ''
  AND main_category_id IS NULL
GROUP BY category_text
ORDER BY product_count DESC
LIMIT 20;
```

---

## Data Migration Strategy

### Phase 1: Extract Category Path

Analyze `category_text` to understand format:
- Format 1: "Electronics" (single category)
- Format 2: "Electronics > TV" (main + sub)
- Format 3: "Electronics > TV > LED" (main + sub + sub-sub)

### Phase 2: Match Existing Categories

Match products to existing categories by name:
```sql
-- Match main categories
UPDATE products p
SET main_category_id = c.id
FROM categories c
WHERE LOWER(p.category_text) LIKE CONCAT('%', LOWER(c.name), '%');
```

### Phase 3: Create Missing Categories

Create category records for unmatched products:
```sql
-- Create main category from first part of path
INSERT INTO categories (name, code, main_category_id)
SELECT 
    SPLIT_PART(category_text, '>', 1),
    UPPER(SPLIT_PART(category_text, '>', 1)),
    NULL
FROM products
WHERE main_category_id IS NULL
GROUP BY SPLIT_PART(category_text, '>', 1);
```

### Phase 4: Manual Review

Review unmatched categories and create/match manually:
```sql
SELECT category_text, COUNT(*) 
FROM products 
WHERE main_category_id IS NULL 
GROUP BY category_text 
ORDER BY COUNT(*) DESC;
```

---

## Rollback

```sql
-- ============================================
-- Rollback: Revert category normalization
-- ============================================

-- Step 1: Rename category_text back to category
ALTER TABLE products RENAME COLUMN category_text TO category;

-- Step 2: Drop index
DROP INDEX IF EXISTS products_category_text_idx;

-- Step 3: Remove categories created during migration (optional)
-- WARNING: This removes categories created for product categories
-- DELETE FROM categories WHERE id IN (category_ids_created_during_migration);
```

---

## Verification Queries

```sql
-- Verify category_text column exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
  AND column_name = 'category_text';

-- Verify index exists
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'products'
  AND indexname LIKE '%category%';

-- Verify migration statistics
SELECT 
    'Migration Statistics' AS metric,
    COUNT(*) AS total_products
FROM products

UNION ALL

SELECT 
    'Products with category_text',
    COUNT(*)
FROM products
WHERE category_text IS NOT NULL

UNION ALL

SELECT 
    'Products with main_category_id',
    COUNT(*)
FROM products
WHERE main_category_id IS NOT NULL

UNION ALL

SELECT 
    'Products with sub_category_id',
    COUNT(*)
FROM products
WHERE sub_category_id IS NOT NULL

UNION ALL

SELECT 
    'Matched categories (category_text = category.name)',
    COUNT(*)
FROM products p
LEFT JOIN categories c ON p.main_category_id = c.id
WHERE p.category_text IS NOT NULL 
  AND c.id IS NOT NULL

UNION ALL

SELECT 
    'Unmatched categories (manual review needed)',
    COUNT(*)
FROM products
WHERE category_text IS NOT NULL 
  AND main_category_id IS NULL;

-- Verify data integrity
SELECT 
    p.id AS product_id,
    p.code AS product_code,
    p.category_text AS category_path,
    c_main.name AS main_category,
    c_sub.name AS sub_category,
    CASE 
        WHEN p.category_text IS NOT NULL AND c_main.id IS NULL THEN 'UNMATCHED'
        WHEN p.category_text IS NOT NULL AND c_main.id IS NOT NULL THEN 'MATCHED'
        ELSE 'NO CATEGORY'
    END AS match_type
FROM products p
LEFT JOIN categories c_main ON p.main_category_id = c_main.id
LEFT JOIN categories c_sub ON p.sub_category_id = c_sub.id
WHERE p.category_text IS NOT NULL
ORDER BY match_type, p.category_text
LIMIT 50;

-- Verify category distribution
SELECT 
    c.name AS category_name,
    COUNT(p.id) AS product_count,
    SUM(p.stock_quantity) AS total_stock
FROM categories c
LEFT JOIN products p ON c.id = p.main_category_id
WHERE c.tenant_id IS NULL 
  AND c.main_category_id IS NULL
GROUP BY c.name
ORDER BY product_count DESC
LIMIT 20;
```

---

## Important Notes

1. **Manual Review Required**: Some categories won't match automatically
2. **Category Text Preservation**: Keep `categoryText` column for reference
3. **Path Parsing**: Category paths may use different separators (>, /, -)
4. **Duplicate Categories**: May create duplicate category entries
5. **Tenant-Specific Categories**: Current migration matches with global categories only
6. **Performance**: Migration may take time for large product catalogs
7. **Backup**: Backup before migration
8. **Application Updates**: Update queries to use `mainCategoryId`/`subCategoryId` instead of `categoryText`
9. **Prisma Migration**: Run `npx prisma migrate dev` after SQL migration

---

## Application Code Updates

### Before:

```typescript
// Query products by category text
const products = await prisma.product.findMany({
  where: {
    category: {
      contains: 'Electronics'
    }
  }
});
```

### After:

```typescript
// Query products by main category ID (recommended)
const products = await prisma.product.findMany({
  where: {
    mainCategoryId: electronicsCategoryId
  },
  include: {
    mainCategory: true,
    subCategory: true
  }
});

// Or query by category name with relation
const products = await prisma.product.findMany({
  where: {
    mainCategory: {
      name: {
        equals: 'Electronics',
        mode: 'insensitive'
      }
    }
  },
  include: {
    mainCategory: true,
    subCategory: true
  }
});
```

---

## Best Practices

1. **Use Foreign Keys**: Always reference categories by ID, not text
2. **Normalize Early**: Normalize data before it grows too large
3. **Data Quality**: Maintain category list with proper hierarchy
4. **Search Indexes**: Add indexes for category name searches
5. **Category Management**: Create UI for managing categories
6. **Audit Trail**: Track category changes for historical accuracy

---

## Future Enhancements

1. **Category Management UI**: Admin interface for managing categories
2. **Category Suggestions**: Suggest categories based on product name
3. **Category Analytics**: Reports by category performance
4. **Auto-Creation**: Auto-create categories on product import
5. **Category Validation**: Validate category names against master list
6. **Category Path Builder**: Build category paths from main/sub IDs