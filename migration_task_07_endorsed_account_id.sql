-- ============================================
-- TASK 7: Fix CheckBill Endorsement Field
-- ============================================
-- Convert endorsed_to (text) to endorsed_account_id (FK to accounts)
-- ============================================

-- ============================================
-- Step 1: Check if column already exists
-- ============================================
-- endorsed_account_id column was already added in previous migration
SELECT 
  'Column Check' as status,
  COUNT(*) as endorsed_account_id_exists
FROM information_schema.columns
WHERE table_name = 'checks_bills' AND column_name = 'endorsed_account_id';

-- ============================================
-- Step 2: Add foreign key constraint (if not exists)
-- ============================================
ALTER TABLE checks_bills 
DROP CONSTRAINT IF EXISTS checks_bills_endorsed_account_fk;

ALTER TABLE checks_bills 
ADD CONSTRAINT checks_bills_endorsed_account_fk 
FOREIGN KEY (endorsed_account_id) REFERENCES accounts(id);

-- ============================================
-- Step 3: Migrate data - Match endorsed_to string to accounts.title
-- ============================================
-- Match endorsed_to to accounts.title within same tenant
UPDATE checks_bills cb
SET endorsed_account_id = a.id
FROM accounts a
WHERE cb.endorsed_to = a.title
  AND cb."tenantId" = a."tenantId"
  AND cb.endorsed_account_id IS NULL;

-- ============================================
-- Step 4: Verification - Show migrated vs unmatched rows
-- ============================================
-- Count of checks with endorsed_to
SELECT 
  'Endorsement Migration Summary' as status,
  COUNT(*) FILTER (WHERE endorsed_to IS NOT NULL) as total_with_endorsement,
  COUNT(*) FILTER (WHERE endorsed_account_id IS NOT NULL) as matched_to_account,
  COUNT(*) FILTER (WHERE endorsed_to IS NOT NULL AND endorsed_account_id IS NULL) as unmatched
FROM checks_bills;

-- Show unmatched rows for manual review
SELECT 
  id,
  "tenantId",
  amount,
  due_date,
  endorsed_to as endorsed_to_text,
  endorsed_account_id
FROM checks_bills
WHERE endorsed_to IS NOT NULL 
  AND endorsed_account_id IS NULL
ORDER BY "tenantId", due_date
LIMIT 20;

-- ============================================
-- Step 5: Add index for performance
-- ============================================
CREATE INDEX IF NOT EXISTS checks_bills_endorsed_account_idx 
ON checks_bills("tenantId", endorsed_account_id);

-- ============================================
-- Step 6: Add comment
-- ============================================
COMMENT ON COLUMN checks_bills.endorsed_account_id IS 'Foreign key to accounts table for endorsed check/bill. Replaces deprecated endorsed_to text field.';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify foreign key constraint exists
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'checks_bills'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND ccu.column_name = 'endorsed_account_id';

-- Verify index exists
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'checks_bills'
  AND indexname LIKE '%endorsed_account%';

-- Sample of migrated data
SELECT 
  cb.id,
  cb."tenantId",
  cb.amount,
  cb.endorsed_to,
  cb.endorsed_account_id,
  a.title as endorsed_account_title
FROM checks_bills cb
LEFT JOIN accounts a ON cb.endorsed_account_id = a.id
WHERE cb.endorsed_to IS NOT NULL
ORDER BY cb."tenantId"
LIMIT 10;

SELECT 'TASK 7 COMPLETED' as status, NOW() as completed_at;