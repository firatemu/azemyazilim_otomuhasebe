# Prisma Schema Migration Guide

## Summary of Required Changes

Based on completed TASKs 1-13, the following changes need to be applied to `schema.prisma`:

---

## 1. New Tables Created

### ✅ brands Table
```prisma
model Brand {
  id        String    @id @default(uuid())
  name      String
  code      String?
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  tenantId  String?   @map("tenant_id")
  tenant    Tenant?   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  products  Product[]
  productVehicleCompatibilities ProductVehicleCompatibility[]

  @@index([tenantId])
  @@index([name])
  @@index([code])
  @@index([isActive])
  @@map("brands")
}
```

### ✅ categories Table
```prisma
model Category {
  id             String     @id @default(uuid())
  name           String
  code           String?
  mainCategoryId String?    @map("main_category_id")
  mainCategory   Category?  @relation("CategoryMain", fields: [mainCategoryId], references: [id], onDelete: SetNull)
  subCategories  Category[] @relation("CategoryMain")
  productsMain   Product[]  @relation("ProductMainCategory")
  productsSub    Product[]  @relation("ProductSubCategory")
  isActive       Boolean    @default(true)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  tenantId       String?    @map("tenant_id")
  tenant         Tenant?    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([mainCategoryId])
  @@index([name])
  @@index([code])
  @@index([isActive])
  @@map("categories")
}
```

### ✅ product_vehicle_compatibilities Table
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
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  tenantId    String   @map("tenant_id")

  @@unique([productId, brandId, model, startYear, endYear])
  @@index([tenantId])
  @@index([productId])
  @@index([brandId])
  @@index([tenantId, brandId, model])
  @@index([isActive])
  @@map("product_vehicle_compatibilities")
}
```

---

## 2. Modified Tables

### ✅ Stok (products) Table Changes

**Changes Required:**
1. Add `brand_id` column (TASK 9)
2. Rename `category` → `category_text` (TASK 10)
3. Rename `unit` → `unit_text` (TASK 12)
4. Add relations to `Brand`, `Category`, `ProductVehicleCompatibility`

```prisma
model Stok {
  id                           String                       @id @default(uuid())
  stokKodu                     String
  tenantId                     String?
  stokAdi                      String
  aciklama                     String?
  birim                        String
  alisFiyati                   Decimal                      @db.Decimal(10, 2)
  satisFiyati                  Decimal                      @db.Decimal(10, 2)
  kdvOrani                     Int                          @default(20)
  kritikStokMiktari            Int                          @default(0)
  
  // TASK 9: Add brand_id
  marka                        String?
  brandId                      String?                       @map("brand_id")
  brand                        Brand?                       @relation(fields: [brandId], references: [id], onDelete: SetNull)
  brandText                    String?                       @map("brand_text")
  
  // TASK 10: Rename category → category_text
  kategori                     String?
  anaKategori                  String?                       @map("main_category_id")
  altKategori                   String?                       @map("sub_category_id")
  categoryText                 String?                       @map("category_text")
  mainCategory                 Category?                     @relation("ProductMainCategory", fields: [anaKategori], references: [id], onDelete: SetNull)
  subCategory                  Category?                     @relation("ProductSubCategory", fields: [altKategori], references: [id], onDelete: SetNull)
  
  model                        String?
  oem                          String?
  olcu                         String?
  raf                          String?
  barkod                       String?
  tedarikciKodu                String?
  esdegerGrupId                String?
  aracMarka                    String?
  aracModel                    String?
  aracMotorHacmi               String?
  aracYakitTipi                String?
  createdAt                    DateTime                     @default(now())
  updatedAt                    DateTime                     @updatedAt
  
  // Relations
  basitSiparisler              BasitSiparis[]               @relation("BasitSiparisStok")
  faturaKalemleri              FaturaKalemi[]
  invoiceProfits               InvoiceProfit[]
  priceCards                   PriceCard[]
  productBarcodes              ProductBarcode[]
  productLocationStocks        ProductLocationStock[]
  purchaseOrderItems           PurchaseOrderItem[]          @relation("PurchaseOrderItemStok")
  satinAlmaIrsaliyesiKalemleri SatınAlmaIrsaliyesiKalemi[] @relation("SatınAlmaIrsaliyesiKalemiStok")
  satinAlmaSiparisKalemleri    SatınAlmaSiparisKalemi[]    @relation("SatınAlmaSiparisKalemiStok")
  satisIrsaliyesiKalemleri     SatisIrsaliyesiKalemi[]      @relation("SatisIrsaliyesiKalemiStok")
  sayimKalemleri               SayimKalemi[]
  siparisKalemleri             SiparisKalemi[]
  solutionPackageParts         SolutionPackagePart[]
  costHistory                  StockCostHistory[]
  stockMoves                   StockMove[]
  esdegers                     StokEsdeger[]                @relation("Stok1")
  esdegers2                    StokEsdeger[]                @relation("Stok2")
  stokHareketleri              StokHareket[]
  esdegerGrup                  EsdegerGrup?                 @relation(fields: [esdegerGrupId], references: [id])
  tenant                       Tenant?                      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  teklifKalemleri              TeklifKalemi[]
  urunRaflar                   UrunRaf[]
  warehouseCriticalStocks      WarehouseCriticalStock[]
  warehouseTransferItems       WarehouseTransferItem[]
  workOrderLines               WorkOrderLine[]
  vehicleCompatibilities         ProductVehicleCompatibility[] @relation("ProductVehicles")

  @@unique([stokKodu, tenantId])
  @@unique([barkod, tenantId])
  @@index([tenantId])
  @@index([tenantId, stokKodu])
  @@index([tenantId, barkod])
  @@index([tenantId, brandId])
  @@index([brandText])
  @@index([categoryText])
  @@map("stoklar")
}
```

### ✅ StockMove Table Changes (TASK 13)

**Changes Required:**
1. Add `tenant_id` column

```prisma
model StockMove {
  id              String        @id @default(uuid())
  productId       String
  fromWarehouseId String?
  fromLocationId  String?
  toWarehouseId   String
  toLocationId    String
  qty             Int
  moveType        StockMoveType
  refType         String?
  refId           String?
  note            String?
  createdAt       DateTime      @default(now())
  createdBy       String?
  
  // TASK 13: Add tenant_id
  tenantId        String?       @map("tenant_id")
  
  createdByUser   User?         @relation("StockMoveCreatedBy", fields: [createdBy], references: [id])
  fromLocation    Location?     @relation("FromLocation", fields: [fromLocationId], references: [id])
  fromWarehouse   Warehouse?    @relation("FromWarehouse", fields: [fromWarehouseId], references: [id])
  product         Stok          @relation(fields: [productId], references: [id], onDelete: Cascade)
  toLocation      Location?      @relation("ToLocation", fields: [toLocationId], references: [id])
  toWarehouse     Warehouse     @relation("ToWarehouse", fields: [toWarehouseId], references: [id])

  @@index([tenantId])
  @@index([productId])
  @@index([fromWarehouseId, fromLocationId])
  @@index([toWarehouseId, toLocationId])
  @@index([moveType])
  @@index([createdAt])
  @@index([refType, refId])
  @@map("stock_moves")
}
```

### ✅ Units Table Changes (TASK 13)

**Changes Required:**
1. Add `tenant_id` column (nullable)

```prisma
model Unit {
  id        String    @id @default(uuid())
  name      String
  code      String?
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // TASK 13: Add tenant_id (nullable)
  tenantId  String?   @map("tenant_id")
  tenant    Tenant?   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  products  Product[]

  @@index([tenantId])
  @@map("units")
}
```

---

## 3. Multi-Currency Changes (TASK 6)

### Tables requiring currency, exchange_rate, local_amount columns:

**account_movements** (if exists in Prisma):
```prisma
model AccountMovement {
  // ... existing fields ...
  currency     String      @default("TRY")
  exchangeRate Decimal      @default(1) @map("exchange_rate") @db.Decimal(10, 4)
  localAmount  Decimal      @map("local_amount") @db.Decimal(12, 2)
  exchangeRateDate DateTime?    @map("exchange_rate_date")
  
  // TASK 13: Add tenant_id (if not exists)
  tenantId    String?     @map("tenant_id")
  
  @@index([tenantId])
}
```

**cashbox_movements** (if exists in Prisma):
```prisma
model CashboxMovement {
  // ... existing fields ...
  currency     String      @default("TRY")
  exchangeRate Decimal      @default(1) @map("exchange_rate") @db.Decimal(10, 4)
  localAmount  Decimal      @map("local_amount") @db.Decimal(12, 2)
  exchangeRateDate DateTime?    @map("exchange_rate_date")
}
```

---

## 4. Tenant Model Updates

**Add relations for new tables:**

```prisma
model Tenant {
  id                     String                       @id @default(cuid())
  uuid                   String                       @unique @default(uuid())
  name                   String
  subdomain              String?                      @unique
  domain                 String?                      @unique
  status                 TenantStatus                 @default(TRIAL)
  createdAt              DateTime                     @default(now())
  updatedAt              DateTime                     @updatedAt
  
  // ... existing relations ...
  
  // NEW: Add relations for new tables
  brands                 Brand[]
  categories             Category[]
  units                  Unit[]
  
  @@index([subdomain])
  @@index([domain])
  @@index([status])
  @@index([createdAt])
  @@map("tenants")
}
```

---

## 5. Implementation Steps

### Step 1: Backup current schema
```bash
cp api-stage/prisma/schema.prisma api-stage/prisma/schema.prisma.backup_$(date +%Y%m%d_%H%M%S)
```

### Step 2: Add new models
- Add `Brand` model
- Add `Category` model
- Add `ProductVehicleCompatibility` model

### Step 3: Update `Stok` model
- Add `brand_id` field
- Add `brand` relation
- Add `brandText` field
- Add `mainCategory` relation
- Add `subCategory` relation
- Add `categoryText` field
- Add `vehicleCompatibilities` relation
- Add indexes

### Step 4: Update existing models for multi-currency
- Add `currency`, `exchange_rate`, `local_amount` to financial tables

### Step 5: Add tenant_id to critical tables
- Update `StockMove` model
- Update `Unit` model
- Update `AccountMovement` model (if exists)

### Step 6: Update `Tenant` model
- Add relations to `Brand`, `Category`, `Unit`

### Step 7: Generate migration
```bash
cd api-stage
npx prisma migrate dev --name "corporate_tables_and_multi_currency"
```

### Step 8: Test the migration
```bash
npx prisma migrate reset --force  # Only in development!
npx prisma db push
```

---

## 6. Verification Queries

After applying changes, verify with:

```sql
-- Verify new tables exist
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('brands', 'categories', 'product_vehicle_compatibilities')
ORDER BY tablename;

-- Verify Stok has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'stoklar'
  AND column_name IN ('brand_id', 'brand_text', 'category_text', 'main_category_id', 'sub_category_id')
ORDER BY column_name;

-- Verify tenant_id in critical tables
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'tenant_id'
  AND table_name IN ('stock_moves', 'units', 'account_movements')
ORDER BY table_name;
```

---

## 7. Notes

1. **Field Naming**: The existing schema uses Turkish field names (e.g., `stokKodu`, `marka`, `kategori`). Keep consistency.
2. **Table Naming**: The database table is `stoklar` (Turkish plural).
3. **Indexes**: All tenant_id columns should have indexes for performance.
4. **Relations**: Ensure proper ON DELETE behavior (CASCADE vs SET NULL).
5. **Testing**: Test thoroughly in staging before production.

---

## 8. Next Steps After Schema Update

1. ✅ Run `npx prisma migrate dev`
2. ✅ Test API endpoints
3. ✅ Update application code for new relations
4. ✅ Create seed data for brands, categories, units
5. ✅ Update frontend components
6. ✅ Deploy to production

---

## Summary

**New Tables:** 3 (brands, categories, product_vehicle_compatibilities)
**Modified Tables:** 4 (stoklar, stock_moves, units, account_movements)
**New Relations:** 6+ (Brand, Category, ProductVehicleCompatibility)
**New Indexes:** 10+

**Priority:** HIGH - Schema update required before application code changes.