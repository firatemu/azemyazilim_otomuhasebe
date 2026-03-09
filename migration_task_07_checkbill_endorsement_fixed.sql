-- ============================================
-- TASK7: Fix CekSenet Endorsement Field
-- ============================================

-- ============================================
-- Step 1: Add endorsed_account_id column
-- ============================================
ALTER TABLE cek_senetler 
ADD COLUMN IF NOT EXISTS endorsed_account_id TEXT;

-- ============================================
-- Step 2: Add foreign key constraint
-- ============================================
ALTER TABLE cek_senetler 
ADD CONSTRAINT cek_senetler_endorsed_account_fk 
FOREIGN KEY (endorsed_account_id) REFERENCES cariler(id);

-- ============================================
-- Step 3: Migrate data - Match ciro_edilen string to accounts.title
-- ============================================
-- Note: ciroEdilen is plain text, need to match to cariler.unvan
UPDATE cek_senetler cs
SET endorsed_account_id = c.id
FROM cariler c
WHERE cs."ciroEdilen" = c.unvan
  AND cs."tenantId" = c."tenantId"
  AND cs.endorsed_account_id IS NULL;

-- ============================================
-- Step 4: Manual review query - Rows that could not be matched
-- ============================================
-- This will show rows with ciro_edilen that couldn't be matched to an account
SELECT 
  id as check_id,
  unvan as check_unvan,
  "ciroEdilen" as endorsed_to,
  "tenantId" as tenant_id
FROM cek_senetler
WHERE "ciroEdilen" IS NOT NULL 
  AND endorsed_account_id IS NULL
ORDER BY "tenantId", unvan;

-- ============================================
-- Step 5: After manual review, drop old column
-- ============================================
-- WARNING: Only run this after reviewing unmatched rows!
-- Uncomment the line below after manual review:
-- ALTER TABLE cek_senetler DROP COLUMN IF EXISTS "ciroEdilen";

-- ============================================
-- Add Index for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS cek_senetler_tenant_endorsed_account_idx 
ON cek_senetler("tenantId", endorsed_account_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check how many rows were migrated successfully
SELECT 
  'Endorsement Migration' as status,
  COUNT(*) as total_with_ciro,
  COUNT(CASE WHEN endorsed_account_id IS NOT NULL THEN 1 END) as matched_to_account,
  COUNT(CASE WHEN "ciroEdilen" IS NOT NULL AND endorsed_account_id IS NULL THEN 1 END) as unmatched
FROM cek_senetler
WHERE "ciroEdilen" IS NOT NULL;

-- Show unmatched rows for manual review
SELECT 
  'Unmatched Endorsements' as review_needed,
  id as check_id,
  "tenantId" as tenant_id,
  unvan as check_unvan,
  "ciroEdilen" as endorsed_to_text
FROM cek_senetler
WHERE "ciroEdilen" IS NOT NULL 
  AND endorsed_account_id IS NULL
ORDER BY "tenantId", unvan;

-- Verify foreign key constraint
SELECT 
  constraint_name,
  table_name,
  column_name,
  foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'cek_senetler'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND ccu.column_name = 'endorsed_account_id';

SELECT 'TASK 7 COMPLETED' as status, NOW() as completed_at;