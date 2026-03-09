# TASK 8 — Convert Float to Decimal for Financial Accuracy

## Changes Found

Critical financial fields use `Float` type which causes precision errors in monetary calculations:

### Tables with Float Fields:

1. **`product_movements`** - `quantity` and `price` are Float
2. **`stock_moves`** - `quantity` and `price` are Float
3. **`invoice_items`** - `discountRate`, `withholdingRate`, `sctRate` are Decimal (already correct) ✓
4. **`quote_items`** - `discountRate` is Decimal (already correct) ✓

### Affected Tables (Need Conversion):

**`product_movements`**
- `quantity` Float → `Decimal(10, 2)` or `Decimal(10, 4)` (for fractional quantities)
- `price` Float → `Decimal(12, 2)` (consistent with other price fields)

**`stock_moves`**
- `quantity` Float → `Decimal(10, 2)` or `Decimal(10, 4)` (for fractional quantities)
- `price` Float → `Decimal(12, 2)` (consistent with other price fields)

---

## Precision Issues with Float

### Example of Float Precision Loss:

```sql
-- Float (inaccurate)
SELECT 0.1 + 0.2 = 0.3;  -- Returns FALSE
-- Result: 0.30000000000000004

-- Decimal (accurate)
SELECT 0.1::DECIMAL + 0.2::DECIMAL = 0.3::DECIMAL;  -- Returns TRUE
-- Result: 0.30
```

### Real-World Impact:

```sql
-- Financial calculations become inaccurate
SELECT 
    SUM(price * quantity) AS total_with_float,
    SUM(price::DECIMAL(12,2) * quantity::DECIMAL(10,4)) AS total_with_decimal
FROM product_movements
WHERE product_id = 'xxx';

-- Float: 10000.00000000001 (WRONG!)
-- Decimal: 10000.00 (CORRECT)
```

---

## Prisma Schema Changes

### product_movements - Convert Float to Decimal
```prisma
model ProductMovement {
  id               String           @id @default(uuid())
  productId        String           @map("product_id")
  quantity         Decimal          @map("quantity") @db.Decimal(10, 4)  // WAS Float
  price            Decimal          @map("price") @db.Decimal(12, 2)      // WAS Float
  movementType     MovementType     @map("movement_type")
  invoiceItemId    String?          @map("invoice_item_id")
  locationId       String?          @map("location_id")
  movementDate     DateTime         @map("movement_date")
  createdAt        DateTime         @default(now())
  tenantId         String
  tenant           Tenant?          @relation(fields: [tenantId], references: [id])
  location         Location?        @relation(fields: [locationId], references: [id])
  product          Product          @relation(fields: [productId], references: [id], onDelete: Cascade)
  invoiceItem      InvoiceItem?     @relation(fields: [invoiceItemId], references: [id])

  @@index([tenantId])
  @@index([invoiceItemId])
  @@index([tenantId, productId, createdAt])
  @@index([productId])
  @@index([movementType])
  @@map("product_movements")
}
```

### stock_moves - Convert Float to Decimal
```prisma
model StockMove {
  id               String      @id @default(uuid())
  productId        String      @map("product_id")
  quantity         Decimal     @map("quantity") @db.Decimal(10, 4)  // WAS Float
  price            Decimal     @map("price") @db.Decimal(12, 2)      // WAS Float
  moveType         MoveType    @map("move_type")
  moveDate         DateTime    @map("move_date")
  createdAt        DateTime    @default(now())
  productIdProduct  Product     @relation(fields: [productId], references: [id])

  @@index([productId])
  @@map("stock_moves")
}
```

---

## SQL Migration

```sql
-- ============================================
-- TASK 8: Convert Float to Decimal
-- ============================================

-- ============================================
-- PRODUCT_MOVEMENTS
-- ============================================
-- Step 1: Add temporary decimal columns
ALTER TABLE product_movements 
ADD COLUMN quantity_new DECIMAL(10,4),
ADD COLUMN price_new DECIMAL(12,2);

-- Step 2: Migrate data with rounding to 4 decimal places
UPDATE product_movements 
SET 
    quantity_new = ROUND(quantity::NUMERIC, 4),
    price_new = ROUND(price::NUMERIC, 2);

-- Step 3: Verify data integrity (should show 0 differences)
SELECT 
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN quantity_new IS NULL THEN 1 END) AS null_quantity,
    COUNT(CASE WHEN price_new IS NULL THEN 1 END) AS null_price,
    ROUND(SUM(ABS(quantity_new - quantity::NUMERIC)), 6) AS quantity_diff_sum,
    ROUND(SUM(ABS(price_new - price::NUMERIC)), 6) AS price_diff_sum
FROM product_movements;

-- Step 4: Drop old float columns
ALTER TABLE product_movements DROP COLUMN quantity;
ALTER TABLE product_movements DROP COLUMN price;

-- Step 5: Rename new columns
ALTER TABLE product_movements RENAME COLUMN quantity_new TO quantity;
ALTER TABLE product_movements RENAME COLUMN price_new TO price;

-- Step 6: Add NOT NULL constraints
ALTER TABLE product_movements ALTER COLUMN quantity SET NOT NULL;
ALTER TABLE product_movements ALTER COLUMN price SET NOT NULL;


-- ============================================
-- STOCK_MOVES
-- ============================================
-- Step 1: Add temporary decimal columns
ALTER TABLE stock_moves 
ADD COLUMN quantity_new DECIMAL(10,4),
ADD COLUMN price_new DECIMAL(12,2);

-- Step 2: Migrate data with rounding to 4 decimal places
UPDATE stock_moves 
SET 
    quantity_new = ROUND(quantity::NUMERIC, 4),
    price_new = ROUND(price::NUMERIC, 2);

-- Step 3: Verify data integrity
SELECT 
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN quantity_new IS NULL THEN 1 END) AS null_quantity,
    COUNT(CASE WHEN price_new IS NULL THEN 1 END) AS null_price,
    ROUND(SUM(ABS(quantity_new - quantity::NUMERIC)), 6) AS quantity_diff_sum,
    ROUND(SUM(ABS(price_new - price::NUMERIC)), 6) AS price_diff_sum
FROM stock_moves;

-- Step 4: Drop old float columns
ALTER TABLE stock_moves DROP COLUMN quantity;
ALTER TABLE stock_moves DROP COLUMN price;

-- Step 5: Rename new columns
ALTER TABLE stock_moves RENAME COLUMN quantity_new TO quantity;
ALTER TABLE stock_moves RENAME COLUMN price_new TO price;

-- Step 6: Add NOT NULL constraints
ALTER TABLE stock_moves ALTER COLUMN quantity SET NOT NULL;
ALTER TABLE stock_moves ALTER COLUMN price SET NOT NULL;
```

---

## Data Migration Notes

### Why 4 Decimal Places for Quantity?

Some products require fractional quantities:
- **Fabric/Materials**: Measured in meters (e.g., 1.5m, 2.75m)
- **Liquids**: Measured in liters (e.g., 0.5L, 1.25L)
- **Weight-based items**: Measured in kg (e.g., 0.125kg, 1.875kg)

4 decimal places provides sufficient precision for these cases.

### Why 2 Decimal Places for Price?

Standard monetary precision:
- **Currency**: Turkish Lira (TRY)
- **Precision**: 2 decimal places (kuruş)
- **Example**: 123.45 TRY

### Rounding Strategy

During migration, we round to the target precision:
- `quantity`: Round to 4 decimal places
- `price`: Round to 2 decimal places

This minimizes precision loss while converting to decimal.

---

## Rollback

```sql
-- ============================================
-- Rollback: Convert Decimal back to Float
-- ============================================

-- PRODUCT_MOVEMENTS
-- Step 1: Add temporary float columns
ALTER TABLE product_movements 
ADD COLUMN quantity_float DOUBLE PRECISION,
ADD COLUMN price_float DOUBLE PRECISION;

-- Step 2: Migrate data
UPDATE product_movements 
SET 
    quantity_float = quantity::DOUBLE PRECISION,
    price_float = price::DOUBLE PRECISION;

-- Step 3: Drop decimal columns
ALTER TABLE product_movements DROP COLUMN quantity;
ALTER TABLE product_movements DROP COLUMN price;

-- Step 4: Rename float columns
ALTER TABLE product_movements RENAME COLUMN quantity_float TO quantity;
ALTER TABLE product_movements RENAME COLUMN price_float TO price;

-- STOCK_MOVES
-- Step 1: Add temporary float columns
ALTER TABLE stock_moves 
ADD COLUMN quantity_float DOUBLE PRECISION,
ADD COLUMN price_float DOUBLE PRECISION;

-- Step 2: Migrate data
UPDATE stock_moves 
SET 
    quantity_float = quantity::DOUBLE PRECISION,
    price_float = price::DOUBLE PRECISION;

-- Step 3: Drop decimal columns
ALTER TABLE stock_moves DROP COLUMN quantity;
ALTER TABLE stock_moves DROP COLUMN price;

-- Step 4: Rename float columns
ALTER TABLE stock_moves RENAME COLUMN quantity_float TO quantity;
ALTER TABLE stock_moves RENAME COLUMN price_float TO price;
```

---

## Verification Queries

```sql
-- Verify column types are now DECIMAL
SELECT 
    table_name,
    column_name,
    data_type,
    numeric_precision,
    numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('product_movements', 'stock_moves')
  AND column_name IN ('quantity', 'price')
ORDER BY table_name, column_name;

-- Verify no NULL values after migration
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

-- Verify precision accuracy (sample data)
SELECT 
    'product_movements' AS table_name,
    COUNT(*) AS sample_count,
    ROUND(AVG(quantity), 6) AS avg_quantity,
    ROUND(AVG(price), 2) AS avg_price,
    ROUND(MIN(quantity), 6) AS min_quantity,
    ROUND(MAX(quantity), 6) AS max_quantity
FROM product_movements
LIMIT 1000

UNION ALL

SELECT 
    'stock_moves',
    COUNT(*),
    ROUND(AVG(quantity), 6),
    ROUND(AVG(price), 2),
    ROUND(MIN(quantity), 6),
    ROUND(MAX(quantity), 6)
FROM stock_moves
LIMIT 1000;

-- Test calculation accuracy
SELECT 
    'product_movements' AS table_name,
    COUNT(*) AS total_movements,
    ROUND(SUM(quantity * price), 2) AS total_value,
    COUNT(CASE WHEN quantity = ROUND(quantity::NUMERIC, 6) THEN 1 END) AS precise_quantity
FROM product_movements

UNION ALL

SELECT 
    'stock_moves',
    COUNT(*),
    ROUND(SUM(quantity * price), 2),
    COUNT(CASE WHEN quantity = ROUND(quantity::NUMERIC, 6) THEN 1 END)
FROM stock_moves;
```

---

## Important Notes

1. **Precision Loss**: Some precision may be lost during conversion, but this is acceptable
2. **Performance**: Decimal calculations are slightly slower than float, but accuracy is more important
3. **Storage**: Decimal(10,4) = 9 bytes, Decimal(12,2) = 9 bytes (similar to Float's 8 bytes)
4. **Application Updates**: Update application code to handle decimal types correctly
5. **Testing**: Test financial calculations thoroughly after migration
6. **Backup**: Backup before migration - rollback is complex
7. **Prisma Migration**: Run `npx prisma migrate dev` after SQL migration

---

## Performance Impact

### Storage Comparison:

| Type | Precision | Storage Size |
|------|-----------|--------------|
| Float (DOUBLE PRECISION) | ~15 decimal digits | 8 bytes |
| Decimal(10,4) | 10 digits, 4 decimal | 9 bytes |
| Decimal(12,2) | 12 digits, 2 decimal | 9 bytes |

### Calculation Speed:

- **Float**: Faster for scientific calculations
- **Decimal**: Slower but accurate for financial calculations

For financial applications, accuracy is more important than speed.

---

## Financial Accuracy Examples

### Before (Float):

```sql
-- Float precision error
SELECT 
    SUM(price * quantity) AS total_value
FROM product_movements
WHERE product_id = 'xxx';
-- Result: 10000.00000000001 (WRONG!)
```

### After (Decimal):

```sql
-- Decimal precision
SELECT 
    SUM(price * quantity) AS total_value
FROM product_movements
WHERE product_id = 'xxx';
-- Result: 10000.00 (CORRECT!)
```

---

## Best Practices for Financial Data

1. **Always Use Decimal**: Never use Float for monetary values
2. **Specify Precision**: Use @db.Decimal(X,Y) for all financial fields
3. **Calculate in Decimal**: Perform all financial calculations in decimal
4. **Round at Display**: Only round when displaying to users
5. **Store Exact Values**: Never store rounded intermediate values
6. **Test Edge Cases**: Test with 0.1 + 0.2, 0.3 - 0.1, etc.

---

## Future Considerations

1. **Audit Trail**: Log all financial calculations for audit purposes
2. **Validation**: Validate that all monetary fields use Decimal
3. **Testing**: Add unit tests for financial calculations
4. **Monitoring**: Monitor for float precision issues in logs