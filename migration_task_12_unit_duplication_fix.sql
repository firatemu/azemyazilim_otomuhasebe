-- ============================================
-- TASK 12: Normalize Product Table - Unit (Duplicate Resolution)
-- ============================================
-- Resolve duplicate unit fields (unit_text vs unit_id FK)
-- ============================================

-- ============================================
-- Step 1: Check if units table exists and create indexes
-- ============================================
-- Ensure units table has proper indexes for migration
CREATE INDEX IF NOT EXISTS units_tenant_id_idx ON units(tenant_id);
CREATE INDEX IF NOT EXISTS units_name_idx ON units(name);
CREATE INDEX IF NOT EXISTS units_code_idx ON units(code);

-- ============================================
-- Step 2: Analyze current unit data
-- ============================================
-- Count products with unit information
SELECT 
  'Unit Data Analysis' as status,
  COUNT(*) FILTER (WHERE unit_text IS NOT NULL) as products_with_unit_text,
  COUNT(*) FILTER (WHERE unit_id IS NOT NULL) as products_with_unit_id,
  COUNT(*) FILTER (WHERE unit_text IS NOT NULL AND unit_id IS NULL) as products_needing_migration,
  COUNT(DISTINCT unit_text) FILTER (WHERE unit_text IS NOT NULL) as unique_unit_texts,
  COUNT(DISTINCT unit_id) FILTER (WHERE unit_id IS NOT NULL) as unique_unit_ids
FROM products;

-- Show sample of units needing migration
SELECT 
  "tenantId",
  unit_text,
  COUNT(*) as product_count
FROM products
WHERE unit_text IS NOT NULL 
  AND unit_id IS NULL
GROUP BY "tenantId", unit_text
ORDER BY "tenantId", product_count DESC
LIMIT 20;

-- ============================================
-- Step 3: Analyze unit sets structure
-- ============================================
-- Show existing unit sets per tenant
SELECT 
  us.tenant_id,
  us.id as unit_set_id,
  us.name as unit_set_name,
  COUNT(*) as unit_count,
  COUNT(*) FILTER (WHERE u.is_base_unit = true) as base_unit_count
FROM unit_sets us
LEFT JOIN units u ON u.unit_set_id = us.id
GROUP BY us.tenant_id, us.id, us.name
ORDER BY us.tenant_id, us.name;

-- ============================================
-- Step 4: Create function to migrate unit text to unit_id
-- ============================================
CREATE OR REPLACE FUNCTION migrate_product_units()
RETURNS TABLE(
  ret_tenant_id TEXT,
  ret_unit_text TEXT,
  ret_unit_id UUID,
  ret_products_affected INT
) AS $$
DECLARE
  unit_record RECORD;
  unit_id_value UUID;
  unit_set_id_value UUID;
  products_count INT;
  base_unit_id UUID;
BEGIN
  -- For each unique unit per tenant
  FOR unit_record IN 
    SELECT 
      "tenantId", 
      unit_text as unit_name, 
      COUNT(*) as cnt
    FROM products p
    WHERE p.unit_text IS NOT NULL AND p.unit_id IS NULL
    GROUP BY "tenantId", unit_name
    ORDER BY "tenantId", unit_name
  LOOP
    -- Try to find existing unit in any unit_set for this tenant
    SELECT u.id, u.unit_set_id INTO unit_id_value, unit_set_id_value
    FROM units u
    JOIN unit_sets us ON u.unit_set_id = us.id
    WHERE us.tenant_id = unit_record."tenantId"
      AND (u.name = unit_record.unit_name OR u.code = unit_record.unit_name)
    LIMIT 1;
    
    -- If unit exists, use it
    IF unit_id_value IS NOT NULL THEN
      UPDATE products
      SET unit_id = unit_id_value
      WHERE "tenantId" = unit_record."tenantId"
        AND unit_text = unit_record.unit_name
        AND unit_id IS NULL;
      
      GET DIAGNOSTICS products_count = ROW_COUNT;
      
      RETURN QUERY SELECT 
        unit_record."tenantId" as ret_tenant_id,
        unit_record.unit_name as ret_unit_text,
        unit_id_value as ret_unit_id,
        products_count as ret_products_affected;
    ELSE
      -- Unit doesn't exist, create default unit set if needed
      IF unit_set_id_value IS NULL THEN
        -- Check if tenant has any unit_set
        SELECT id INTO unit_set_id_value
        FROM unit_sets
        WHERE tenant_id = unit_record."tenantId"
        LIMIT 1;
        
        -- If no unit_set, create one
        IF unit_set_id_value IS NULL THEN
          INSERT INTO unit_sets (id, tenant_id, name, "createdAt", "updatedAt")
          VALUES (gen_random_uuid()::TEXT, unit_record."tenantId", 'Default Unit Set', NOW(), NOW())
          RETURNING id INTO unit_set_id_value;
        END IF;
      END IF;
      
      -- Create new unit
      INSERT INTO units (id, tenant_id, unit_set_id, name, code, conversion_rate, is_base_unit, "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::TEXT, unit_record."tenantId", unit_set_id_value, unit_record.unit_name, unit_record.unit_name, 1.0, true, NOW(), NOW())
      RETURNING id INTO unit_id_value;
      
      -- Update products
      UPDATE products
      SET unit_id = unit_id_value
      WHERE "tenantId" = unit_record."tenantId"
        AND unit_text = unit_record.unit_name
        AND unit_id IS NULL;
      
      GET DIAGNOSTICS products_count = ROW_COUNT;
      
      RETURN QUERY SELECT 
        unit_record."tenantId" as ret_tenant_id,
        unit_record.unit_name as ret_unit_text,
        unit_id_value as ret_unit_id,
        products_count as ret_products_affected;
    END IF;
    
    -- Reset for next iteration
    unit_id_value := NULL;
    unit_set_id_value := NULL;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 5: Execute unit migration
-- ============================================
-- Run migration function
SELECT * FROM migrate_product_units();

-- ============================================
-- Step 6: Verify migration results
-- ============================================
-- Count after migration
SELECT 
  'Unit Migration Results' as status,
  COUNT(*) FILTER (WHERE unit_text IS NOT NULL) as products_with_unit_text,
  COUNT(*) FILTER (WHERE unit_id IS NOT NULL) as products_with_unit_id,
  COUNT(*) FILTER (WHERE unit_text IS NOT NULL AND unit_id IS NULL) as products_still_needing_migration,
  COUNT(DISTINCT unit_id) FILTER (WHERE unit_id IS NOT NULL) as unique_unit_ids
FROM products;

-- Show unmatched units (if any)
SELECT 
  "tenantId",
  unit_text,
  COUNT(*) as product_count
FROM products
WHERE unit_text IS NOT NULL 
  AND unit_id IS NULL
GROUP BY "tenantId", unit_text
ORDER BY "tenantId", product_count DESC
LIMIT 10;

-- ============================================
-- Step 7: Add index for performance
-- ============================================
CREATE INDEX IF NOT EXISTS products_unit_id_idx 
ON products(unit_id);

-- ============================================
-- Step 8: Clean up duplicate units (optional - after manual review)
-- ============================================
-- Show potential duplicate units across unit_sets
SELECT 
  u.name,
  u.code,
  COUNT(*) as duplicate_count,
  ARRAY_AGG(DISTINCT us.name) as unit_set_names
FROM units u
JOIN unit_sets us ON u.unit_set_id = us.id
GROUP BY u.name, u.code
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify all products with unit now have unit_id
SELECT 
  'Unit Migration Verification' as status,
  CASE 
    WHEN COUNT(*) FILTER (WHERE unit_text IS NOT NULL AND unit_id IS NULL) = 0 
    THEN 'SUCCESS - All products with unit have unit_id'
    ELSE 'WARNING - Some products still need migration'
  END as verification_result,
  COUNT(*) FILTER (WHERE unit_text IS NOT NULL) as total_with_unit,
  COUNT(*) FILTER (WHERE unit_id IS NOT NULL) as total_with_unit_id,
  COUNT(*) FILTER (WHERE unit_text IS NOT NULL AND unit_id IS NULL) as remaining
FROM products;

-- Show units table stats per tenant
SELECT 
  us.tenant_id,
  us.name as unit_set_name,
  COUNT(*) as total_units,
  COUNT(*) FILTER (WHERE u.is_base_unit = true) as base_units
FROM unit_sets us
LEFT JOIN units u ON u.unit_set_id = us.id
GROUP BY us.tenant_id, us.name
ORDER BY us.tenant_id, us.name;

-- Sample of migrated data
SELECT 
  p.id,
  p."tenantId",
  p.code,
  p.name as product_name,
  p.unit_text as original_unit_text,
  p.unit_id,
  u.name as unit_name_from_table,
  us.name as unit_set_name
FROM products p
LEFT JOIN units u ON p.unit_id = u.id
LEFT JOIN unit_sets us ON u.unit_set_id = us.id
WHERE p.unit_text IS NOT NULL
ORDER BY p."tenantId", p.code
LIMIT 10;

-- ============================================
-- CLEANUP (Optional - after verification)
-- ============================================
-- Drop migration function
-- DROP FUNCTION IF EXISTS migrate_product_units();

-- Drop unit_text column (after verification and app update)
-- ALTER TABLE products DROP COLUMN IF EXISTS unit_text;

SELECT 'TASK 12 COMPLETED' as status, NOW() as completed_at;