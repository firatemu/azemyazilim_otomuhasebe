-- ============================================
-- TASK 1: Fix Nullable/Missing tenantId Columns (Fixed with Turkish Table Names)
-- ============================================

-- ============================================
-- STEP 1: MasrafKategori'ye tenantId ekle
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE masraf_kategoriler ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill - Get first tenant
WITH first_tenant AS (
  SELECT id FROM tenants LIMIT 1
)
UPDATE masraf_kategoriler mk
SET tenant_id = ft.id
FROM first_tenant ft
WHERE mk.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE masraf_kategoriler 
ADD CONSTRAINT masraf_kategoriler_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE masraf_kategoriler ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Drop old unique constraint if exists
ALTER TABLE masraf_kategoriler DROP CONSTRAINT IF EXISTS masraf_kategoriler_kategori_adi_key;

-- Step 6: Add new unique constraint (per tenant)
ALTER TABLE masraf_kategoriler 
ADD CONSTRAINT masraf_kategoriler_tenant_kategori_unique 
UNIQUE (tenant_id, kategori_adi);

-- Step 7: Add index
CREATE INDEX IF NOT EXISTS masraf_kategoriler_tenant_idx ON masraf_kategoriler(tenant_id);

-- ============================================
-- STEP 2: PriceCard'ye tenantId ve vatRate ekle
-- ============================================
-- Step 1: Add nullable columns
ALTER TABLE price_cards ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE price_cards ADD COLUMN IF NOT EXISTS vat_rate INTEGER;

-- Step 2: Backfill tenantId from products (stoklar)
UPDATE price_cards pc
SET tenant_id = s."tenantId"
FROM stoklar s
WHERE pc."stokId" = s.id AND pc.tenant_id IS NULL;

-- Step 3: Backfill vatRate from products (or use NULL)
UPDATE price_cards pc
SET vat_rate = s."kdvOrani"
FROM stoklar s
WHERE pc."stokId" = s.id AND pc.vat_rate IS NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE price_cards 
ADD CONSTRAINT price_cards_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 5: Set NOT NULL for tenantId
ALTER TABLE price_cards ALTER COLUMN tenant_id SET NOT NULL;

-- Step 6: Add indexes
CREATE INDEX IF NOT EXISTS price_cards_tenant_idx ON price_cards(tenant_id);
CREATE INDEX IF NOT EXISTS price_cards_tenant_product_type_created_idx 
ON price_cards(tenant_id, "stokId", type, "createdAt");

-- ============================================
-- STEP 3: Alt tablolara tenantId ekle - FaturaKalemi
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE fatura_kalemleri ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from faturalar
UPDATE fatura_kalemleri fk
SET tenant_id = f."tenantId"
FROM faturalar f
WHERE fk."faturaId" = f.id AND fk.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE fatura_kalemleri 
ADD CONSTRAINT fatura_kalemleri_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE fatura_kalemleri ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS fatura_kalemleri_tenant_idx ON fatura_kalemleri(tenant_id);
CREATE INDEX IF NOT EXISTS fatura_kalemleri_tenant_fatura_idx ON fatura_kalemleri(tenant_id, "faturaId");
CREATE INDEX IF NOT EXISTS fatura_kalemleri_tenant_stok_idx ON fatura_kalemleri(tenant_id, "stokId");

-- ============================================
-- STEP 4: SiparisKalemi'ye tenantId ekle
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE siparis_kalemleri ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from siparisler
UPDATE siparis_kalemleri sk
SET tenant_id = s."tenantId"
FROM siparisler s
WHERE sk."siparisId" = s.id AND sk.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE siparis_kalemleri 
ADD CONSTRAINT siparis_kalemleri_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE siparis_kalemleri ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS siparis_kalemleri_tenant_idx ON siparis_kalemleri(tenant_id);

-- ============================================
-- STEP 5: WorkOrderLine'ye tenantId ekle
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE work_order_lines ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from work_orders
UPDATE work_order_lines wol
SET tenant_id = wo."tenantId"
FROM work_orders wo
WHERE wol."workOrderId" = wo.id AND wol.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE work_order_lines 
ADD CONSTRAINT work_order_lines_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE work_order_lines ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS work_order_lines_tenant_idx ON work_order_lines(tenant_id);

-- ============================================
-- STEP 6: ProductBarcode'ye tenantId ekle
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE product_barcodes ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from stoklar
UPDATE product_barcodes pb
SET tenant_id = s."tenantId"
FROM stoklar s
WHERE pb."productId" = s.id AND pb.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE product_barcodes 
ADD CONSTRAINT product_barcodes_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE product_barcodes ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Drop old unique constraint if exists
ALTER TABLE product_barcodes DROP CONSTRAINT IF EXISTS product_barcodes_barcode_key;

-- Step 6: Add new unique constraint (per tenant)
ALTER TABLE product_barcodes 
ADD CONSTRAINT product_barcodes_tenant_barcode_unique 
UNIQUE (tenant_id, barcode);

-- Step 7: Add index
CREATE INDEX IF NOT EXISTS product_barcodes_tenant_idx ON product_barcodes(tenant_id);

-- ============================================
-- STEP 7: StockMove'ye tenantId ekle
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE stock_moves ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill - Get first tenant
WITH first_tenant AS (
  SELECT id FROM tenants LIMIT 1
)
UPDATE stock_moves sm
SET tenant_id = ft.id
FROM first_tenant ft
WHERE sm.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE stock_moves 
ADD CONSTRAINT stock_moves_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE stock_moves ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS stock_moves_tenant_idx ON stock_moves(tenant_id);
CREATE INDEX IF NOT EXISTS stock_moves_tenant_product_created_idx 
ON stock_moves(tenant_id, "productId", "createdAt");
CREATE INDEX IF NOT EXISTS stock_moves_tenant_move_type_idx 
ON stock_moves(tenant_id, "moveType");

-- ============================================
-- STEP 8: ProductLocationStock'ye tenantId ekle
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE product_location_stocks ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from warehouses
UPDATE product_location_stocks pls
SET tenant_id = w."tenantId"
FROM warehouses w
WHERE pls."warehouseId" = w.id AND pls.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE product_location_stocks 
ADD CONSTRAINT product_location_stocks_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE product_location_stocks ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS product_location_stocks_tenant_idx ON product_location_stocks(tenant_id);

-- ============================================
-- STEP 9: StockCostHistory'ye tenantId ekle
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE stock_cost_history ADD COLUMN IF NOT EXISTS tenant_id TEXT;

-- Step 2: Backfill from stoklar
UPDATE stock_cost_history sch
SET tenant_id = s."tenantId"
FROM stoklar s
WHERE sch."stokId" = s.id AND sch.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE stock_cost_history 
ADD CONSTRAINT stock_cost_history_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Step 4: Set NOT NULL
ALTER TABLE stock_cost_history ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS stock_cost_history_tenant_idx ON stock_cost_history(tenant_id);
CREATE INDEX IF NOT EXISTS stock_cost_history_tenant_product_computed_idx 
ON stock_cost_history(tenant_id, "stokId", "computedAt");

-- ============================================
-- STEP 10: Nullable tenantId'leri NOT NULL yap (Mevcut Tablolar)
-- ============================================

-- WAREHOUSE
UPDATE warehouses SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE warehouses ALTER COLUMN tenant_id SET NOT NULL;

-- PERSONEL
UPDATE personeller SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE personeller ALTER COLUMN tenant_id SET NOT NULL;

-- KASA
UPDATE kasalar SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE kasalar ALTER COLUMN tenant_id SET NOT NULL;

-- BANKA
UPDATE bankalar SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE bankalar ALTER COLUMN tenant_id SET NOT NULL;

-- SATIS_ELEMANI
UPDATE satis_elemanlari SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE satis_elemanlari ALTER COLUMN tenant_id SET NOT NULL;

-- STOK
UPDATE stoklar SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE stoklar ALTER COLUMN tenant_id SET NOT NULL;

-- CARİ
UPDATE cariler SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE cariler ALTER COLUMN tenant_id SET NOT NULL;

-- FATURA
UPDATE faturalar SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE faturalar ALTER COLUMN tenant_id SET NOT NULL;

-- TAHSILAT
UPDATE tahsilatlar SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE tahsilatlar ALTER COLUMN tenant_id SET NOT NULL;

-- SIPARIS
UPDATE siparisler SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE siparisler ALTER COLUMN tenant_id SET NOT NULL;

-- SATIS_IRSALIYESI
UPDATE satis_irsaliyeleri SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE satis_irsaliyeleri ALTER COLUMN tenant_id SET NOT NULL;

-- TEKLIF
UPDATE teklifler SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE teklifler ALTER COLUMN tenant_id SET NOT NULL;

-- SAYIM
UPDATE sayimlar SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE sayimlar ALTER COLUMN tenant_id SET NOT NULL;

-- BANKA_HAVALE
UPDATE banka_havaleler SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE banka_havaleler ALTER COLUMN tenant_id SET NOT NULL;

-- CEK_SENET
UPDATE cek_senetler SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE cek_senetler ALTER COLUMN tenant_id SET NOT NULL;

-- BORDRO
UPDATE bordrolar SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE bordrolar ALTER COLUMN tenant_id SET NOT NULL;

-- SATIN_ALMA_SIPARISI
UPDATE satin_alma_siparisleri SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE satin_alma_siparisleri ALTER COLUMN tenant_id SET NOT NULL;

-- SATIN_ALMA_IRSALIYESI
UPDATE satin_alma_irsaliyeleri SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE satin_alma_irsaliyeleri ALTER COLUMN tenant_id SET NOT NULL;

-- PURCHASE_ORDER
UPDATE purchase_orders SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE purchase_orders ALTER COLUMN tenant_id SET NOT NULL;

-- BASIT_SIPARIS
UPDATE basit_siparisler SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE basit_siparisler ALTER COLUMN tenant_id SET NOT NULL;

-- UNIT
UPDATE units SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE units ALTER COLUMN tenant_id SET NOT NULL;

-- CATEGORY
UPDATE categories SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE categories ALTER COLUMN tenant_id SET NOT NULL;

-- BRAND
UPDATE brands SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE brands ALTER COLUMN tenant_id SET NOT NULL;

-- MAAS_PLANI
UPDATE maas_planlari SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE maas_planlari ALTER COLUMN tenant_id SET NOT NULL;

-- MAAS_ODEME
UPDATE maas_odemeler SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE maas_odemeler ALTER COLUMN tenant_id SET NOT NULL;

-- MAAS_ODEME_DETAY
UPDATE maas_odeme_detaylari SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE maas_odeme_detaylari ALTER COLUMN tenant_id SET NOT NULL;

-- AVANS
UPDATE avanslar SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE avanslar ALTER COLUMN tenant_id SET NOT NULL;

-- INVOICE_PROFIT
UPDATE invoice_profit SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE invoice_profit ALTER COLUMN tenant_id SET NOT NULL;

-- FIRMWARE_KREDI_KARTI
UPDATE firma_kredi_kartlari SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE firma_kredi_kartlari ALTER COLUMN tenant_id SET NOT NULL;

-- WAREHOUSE_TRANSFER
UPDATE warehouse_transfers SET tenant_id = (SELECT id FROM tenants LIMIT 1) WHERE tenant_id IS NULL;
ALTER TABLE warehouse_transfers ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================
-- STEP 11: Special Handling - Role Table Check Constraint
-- ============================================
-- Note: Role table doesn't exist in schema, skipping check constraint
-- If exists, would add:
-- ALTER TABLE roles 
-- ADD CONSTRAINT roles_tenant_check
-- CHECK (
--   (is_system_role = true  AND tenant_id IS NULL) OR
--   (is_system_role = false AND tenant_id IS NOT NULL)
-- );

-- ============================================
-- STEP 12: Special Handling - User Table Check Constraint
-- ============================================
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS users_tenant_check
CHECK (
  (role IN ('SUPER_ADMIN', 'SUPPORT') AND tenant_id IS NULL) OR
  (role NOT IN ('SUPER_ADMIN', 'SUPPORT') AND tenant_id IS NOT NULL)
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check MasrafKategori
SELECT 'MasrafKategori' as table_name, COUNT(*) as total_rows, 
       COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as null_tenant_ids
FROM masraf_kategoriler;

-- Check PriceCard
SELECT 'PriceCard' as table_name, COUNT(*) as total_rows,
       COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as null_tenant_ids,
       COUNT(CASE WHEN vat_rate IS NULL THEN 1 END) as null_vat_rates
FROM price_cards;

-- Check FaturaKalemi
SELECT 'FaturaKalemi' as table_name, COUNT(*) as total_rows,
       COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as null_tenant_ids
FROM fatura_kalemleri;

-- Check Stok
SELECT 'Stok' as table_name, COUNT(*) as total_rows,
       COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as null_tenant_ids
FROM stoklar;

-- Check Nullable tenantId Summary
SELECT 
  'Nullable tenantId Fix' as migration,
  COUNT(*) as tables_checked
FROM (
  SELECT 'MasrafKategori' as tbl FROM masraf_kategoriler
  UNION ALL
  SELECT 'PriceCard' FROM price_cards
  UNION ALL
  SELECT 'FaturaKalemi' FROM fatura_kalemleri
  UNION ALL
  SELECT 'SiparisKalemi' FROM siparis_kalemleri
  UNION ALL
  SELECT 'WorkOrderLine' FROM work_order_lines
  UNION ALL
  SELECT 'ProductBarcode' FROM product_barcodes
  UNION ALL
  SELECT 'StockMove' FROM stock_moves
  UNION ALL
  SELECT 'ProductLocationStock' FROM product_location_stocks
  UNION ALL
  SELECT 'StockCostHistory' FROM stock_cost_history
) t;

SELECT 'TASK 1 COMPLETED' as status, NOW() as completed_at;