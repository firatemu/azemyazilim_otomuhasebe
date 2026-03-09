-- ============================================
-- TASK 1 Step 1: MasrafKategori'ye tenantId ekle
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

-- Verification
SELECT 'MasrafKategori completed' as status, COUNT(*) as total_rows 
FROM masraf_kategoriler WHERE tenant_id IS NOT NULL;