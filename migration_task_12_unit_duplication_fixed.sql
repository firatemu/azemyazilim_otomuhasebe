-- ============================================
-- TASK12: Fix Unit Duplication and Add Standardization
-- ============================================

-- ============================================
-- Step 1: Identify Duplicate Units (Same name within tenant)
-- ============================================

-- Create temporary table to track duplicate units
CREATE TEMP TABLE unit_duplicates AS
SELECT 
  ad as unit_name,
  string_agg(DISTINCT id, ',') as unit_ids,
  COUNT(*) as count
FROM units
WHERE "tenantId" IS NOT NULL
GROUP BY "tenantId", ad
HAVING COUNT(*) > 1;

-- Show duplicates found
SELECT 
  'Duplicate Units Found' as status,
  COUNT(*) as duplicate_count
FROM unit_duplicates;

-- Display duplicate details
SELECT 
  unit_name,
  unit_ids,
  count as duplicate_count
FROM unit_duplicates
ORDER BY count DESC;

-- ============================================
-- Step 2: Create Function to Consolidate Duplicate Units
-- ============================================

CREATE OR REPLACE FUNCTION consolidate_duplicate_units() RETURNS INTEGER AS $$
DECLARE
  duplicate RECORD;
  unit_ids_array TEXT[];
  first_unit_id TEXT;
  unit_id_to_remove TEXT;
  updated_count INTEGER := 0;
BEGIN
  FOR duplicate IN 
    SELECT 
      string_agg(DISTINCT id, ',') as unit_ids,
      MIN(id) as first_id
    FROM units
    WHERE "tenantId" IS NOT NULL
    GROUP BY "tenantId", ad
    HAVING COUNT(*) > 1
  LOOP
    unit_ids_array := regexp_split_to_array(duplicate.unit_ids, ',');
    first_unit_id := duplicate.first_id;
    
    -- Loop through remaining IDs and update references
    FOR i IN 2..array_length(unit_ids_array, 1) LOOP
      unit_id_to_remove := unit_ids_array[i];
      
      -- Update products (stoklar) - both birimId and tabanBirimId
      UPDATE stoklar 
      SET "birimId" = first_unit_id 
      WHERE "birimId" = unit_id_to_remove;
      
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      updated_count := updated_count + updated_count;
      
      UPDATE stoklar 
      SET "tabanBirimId" = first_unit_id 
      WHERE "tabanBirimId" = unit_id_to_remove;
      
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      updated_count := updated_count + updated_count;
      
      -- Update product conversions
      UPDATE product_conversions 
      SET "unitFromId" = first_unit_id 
      WHERE "unitFromId" = unit_id_to_remove;
      
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      updated_count := updated_count + updated_count;
      
      UPDATE product_conversions 
      SET "unitToId" = first_unit_id 
      WHERE "unitToId" = unit_id_to_remove;
      
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      updated_count := updated_count + updated_count;
      
      -- Delete the duplicate unit
      DELETE FROM units WHERE id = unit_id_to_remove;
    END LOOP;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 3: Run the Consolidation Function
-- ============================================
-- Uncomment to run:
-- SELECT consolidate_duplicate_units();

-- ============================================
-- Step 4: Add Unique Constraint
-- ============================================
-- First, ensure all duplicates are removed
-- Then add unique constraint
ALTER TABLE units 
DROP CONSTRAINT IF EXISTS units_ad_key;

ALTER TABLE units 
ADD CONSTRAINT units_tenant_ad_unique 
UNIQUE ("tenantId", ad);

-- ============================================
-- Step 5: Add Index for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS units_tenant_idx ON units("tenantId");

CREATE INDEX IF NOT EXISTS units_tenant_ad_idx ON units("tenantId", ad);

-- ============================================
-- Step 6: Add Standard Unit Reference
-- ============================================

-- Add standard_unit_id column to reference standard units (e.g., KG, PCS, LTR)
ALTER TABLE units 
ADD COLUMN IF NOT EXISTS standard_unit_id TEXT;

-- Add foreign key constraint (self-reference for now, could reference a standards table later)
ALTER TABLE units 
ADD CONSTRAINT units_standard_unit_fk 
FOREIGN KEY (standard_unit_id) REFERENCES units(id);

-- ============================================
-- Step 7: Create Unit Standardization Mapping
-- ============================================

-- This is a sample mapping - should be customized based on business needs
-- Common Turkish units and their standard equivalents
CREATE TEMP TABLE unit_standardization AS
SELECT 
  ad as unit_name,
  CASE 
    WHEN ad IN ('Adet', 'ADET', 'adet', 'Ad', 'AD', 'ad', 'Piece', 'PCS', 'pcs') THEN 'Adet'
    WHEN ad IN ('Kilogram', 'KG', 'kg', 'Kg', 'Kilo', 'KILO', 'kilo') THEN 'Kilogram'
    WHEN ad IN ('Litre', 'LT', 'lt', 'L', 'l', 'LTR', 'ltr') THEN 'Litre'
    WHEN ad IN ('Metre', 'MTR', 'mtr', 'M', 'm', 'Meter', 'MT', 'mt') THEN 'Metre'
    WHEN ad IN ('M2', 'm2', 'Metrekare', 'm²', 'SQUARE_METER') THEN 'M2'
    WHEN ad IN ('M3', 'm3', 'Metreküp', 'm³', 'CUBIC_METER') THEN 'M3'
    ELSE ad
  END as standard_unit_name;

-- Display unit standardization mapping
SELECT 
  unit_name,
  standard_unit_name
FROM unit_standardization
WHERE unit_name != standard_unit_name
ORDER BY unit_name;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check for remaining duplicates
SELECT 
  'Remaining Duplicates' as check,
  COUNT(*) as duplicate_count
FROM (
  SELECT ad, "tenantId", COUNT(*) 
  FROM units 
  WHERE "tenantId" IS NOT NULL
  GROUP BY "tenantId", ad 
  HAVING COUNT(*) > 1
) t;

-- Verify unique constraint
SELECT 
  constraint_name,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'units'
  AND constraint_type = 'UNIQUE';

-- Show unit statistics
SELECT 
  'Unit Statistics' as report,
  COUNT(*) as total_units,
  COUNT(DISTINCT "tenantId") as tenants_with_units,
  COUNT(DISTINCT ad) as unique_unit_names
FROM units;

-- Show units per tenant
SELECT 
  "tenantId" as tenant_id,
  COUNT(*) as unit_count,
  COUNT(DISTINCT ad) as unique_unit_names
FROM units
WHERE "tenantId" IS NOT NULL
GROUP BY "tenantId"
ORDER BY unit_count DESC;

-- Check products with NULL unit
SELECT 
  'Products without Unit' as check,
  COUNT(*) as product_count
FROM stoklar
WHERE "birimId" IS NULL;

-- Show standard units
SELECT 
  ad as unit_name,
  "tenantId" as tenant_id,
  standard_unit_id as maps_to_standard
FROM units
WHERE standard_unit_id IS NOT NULL
LIMIT 20;

SELECT 'TASK 12 COMPLETED' as status, NOW() as completed_at;