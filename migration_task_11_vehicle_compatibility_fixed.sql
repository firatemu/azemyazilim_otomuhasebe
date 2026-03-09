-- ============================================
-- TASK11: Fix Vehicle Compatibility Fields
-- ============================================

-- This task fixes the vehicle compatibility fields in the arac_uretici_ekipmanlari table
-- The fields should store structured data instead of comma-separated strings

-- ============================================
-- Step 1: Add New Structured Columns
-- ============================================

-- Add JSON columns for vehicle compatibility
ALTER TABLE arac_uretici_ekipmanlari 
ADD COLUMN IF NOT EXISTS compatible_years JSONB;

ALTER TABLE arac_uretici_ekipmanlari 
ADD COLUMN IF NOT EXISTS compatible_models JSONB;

ALTER TABLE arac_uretici_ekipmanlari 
ADD COLUMN IF NOT EXISTS compatible_bodies JSONB;

-- ============================================
-- Step 2: Migrate Data from Comma-Separated Strings to JSON
-- ============================================

-- Migrate years from comma-separated string to JSON array
UPDATE arac_uretici_ekipmanlari 
SET compatible_years = CASE 
  WHEN "uygunYillar" IS NULL OR TRIM("uygunYillar") = '' THEN '[]'::JSONB
  ELSE ('[' || array_to_string(array(SELECT DISTINCT trim(unnest) FROM unnest(string_to_array("uygunYillar", ',')))), ',') || ']')::JSONB
END
WHERE compatible_years IS NULL;

-- Migrate models from comma-separated string to JSON array
UPDATE arac_uretici_ekipmanlari 
SET compatible_models = CASE 
  WHEN "uygunModeller" IS NULL OR TRIM("uygunModeller") = '' THEN '[]'::JSONB
  ELSE ('[' || array_to_string(array(SELECT DISTINCT trim(unnest) FROM unnest(string_to_array("uygunModeller", ',')))), ',') || ']')::JSONB
END
WHERE compatible_models IS NULL;

-- Migrate bodies from comma-separated string to JSON array
UPDATE arac_uretici_ekipmanlari 
SET compatible_bodies = CASE 
  WHEN "uygunKasalar" IS NULL OR TRIM("uygunKasalar") = '' THEN '[]'::JSONB
  ELSE ('[' || array_to_string(array(SELECT DISTINCT trim(unnest) FROM unnest(string_to_array("uygunKasalar", ',')))), ',') || ']')::JSONB
END
WHERE compatible_bodies IS NULL;

-- ============================================
-- Step 3: Add Indexes for JSON Queries
-- ============================================

-- GIN index for efficient JSON queries
CREATE INDEX IF NOT EXISTS arac_uretici_ekipmanlari_years_idx 
ON arac_uretici_ekipmanlari USING GIN (compatible_years);

CREATE INDEX IF NOT EXISTS arac_uretici_ekipmanlari_models_idx 
ON arac_uretici_ekipmanlari USING GIN (compatible_models);

CREATE INDEX IF NOT EXISTS arac_uretici_ekipmanlari_bodies_idx 
ON arac_uretici_ekipmanlari USING GIN (compatible_bodies);

-- ============================================
-- Step 4: Create Helper Functions for JSON Queries
-- ============================================

-- Function to check if equipment is compatible with a specific year
CREATE OR REPLACE FUNCTION is_year_compatible(
  equipment_id TEXT,
  target_year INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM arac_uretici_ekipmanlari 
    WHERE id = equipment_id 
      AND compatible_years @> to_jsonb(target_year)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if equipment is compatible with a specific model
CREATE OR REPLACE FUNCTION is_model_compatible(
  equipment_id TEXT,
  target_model TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM arac_uretici_ekipmanlari 
    WHERE id = equipment_id 
      AND compatible_models @> to_jsonb(target_model)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if equipment is compatible with a specific body type
CREATE OR REPLACE FUNCTION is_body_compatible(
  equipment_id TEXT,
  target_body TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM arac_uretici_ekipmanlari 
    WHERE id = equipment_id 
      AND compatible_bodies @> to_jsonb(target_body)
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check migration statistics
SELECT 
  'Vehicle Compatibility Migration' as status,
  COUNT(*) as total_equipments,
  COUNT(CASE WHEN compatible_years IS NOT NULL THEN 1 END) as with_years,
  COUNT(CASE WHEN compatible_models IS NOT NULL THEN 1 END) as with_models,
  COUNT(CASE WHEN compatible_bodies IS NOT NULL THEN 1 END) as with_bodies
FROM arac_uretici_ekipmanlari;

-- Show sample migrated data
SELECT 
  id as equipment_id,
  ad as equipment_name,
  "uygunYillar" as old_years_string,
  compatible_years as new_years_json,
  "uygunModeller" as old_models_string,
  compatible_models as new_models_json,
  "uygunKasalar" as old_bodies_string,
  compatible_bodies as new_bodies_json
FROM arac_uretici_ekipmanlari
WHERE compatible_years IS NOT NULL
LIMIT 5;

-- Check JSON array contents
SELECT 
  id as equipment_id,
  ad as equipment_name,
  jsonb_array_length(compatible_years) as years_count,
  jsonb_array_length(compatible_models) as models_count,
  jsonb_array_length(compatible_bodies) as bodies_count
FROM arac_uretici_ekipmanlari
WHERE compatible_years IS NOT NULL
ORDER BY years_count DESC
LIMIT 10;

-- Verify indexes
SELECT 
  indexname as index_name,
  tablename as table_name,
  indexdef as definition
FROM pg_indexes
WHERE tablename = 'arac_uretici_ekipmanlari'
  AND schemaname = 'public'
  AND indexname LIKE '%_idx'
ORDER BY indexname;

SELECT 'TASK 11 COMPLETED' as status, NOW() as completed_at;