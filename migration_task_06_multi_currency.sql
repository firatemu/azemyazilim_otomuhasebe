-- ============================================
-- TASK 6: Fix Multi-Currency Architecture
-- ============================================

-- ============================================
-- ACCOUNT_MOVEMENTS
-- ============================================
-- Step 1: Add columns
ALTER TABLE account_movements 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1,
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(12,2);

-- Step 2: Backfill local_amount (for existing rows, local_amount = amount)
UPDATE account_movements 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE account_movements ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- CASHBOX_MOVEMENTS
-- ============================================
-- Step 1: Add columns
ALTER TABLE cashbox_movements 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1,
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(15,2);

-- Step 2: Backfill local_amount
UPDATE cashbox_movements 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE cashbox_movements ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- BANK_ACCOUNT_MOVEMENTS
-- ============================================
-- Step 1: Add columns
ALTER TABLE bank_account_movements 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1,
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(15,2);

-- Step 2: Backfill local_amount
UPDATE bank_account_movements 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE bank_account_movements ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- COLLECTIONS
-- ============================================
-- Step 1: Add columns
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1,
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(12,2);

-- Step 2: Backfill local_amount
UPDATE collections 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE collections ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- INVOICE_COLLECTIONS
-- ============================================
-- Step 1: Add columns
ALTER TABLE invoice_collections 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1,
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(12,2);

-- Step 2: Backfill local_amount from amount
UPDATE invoice_collections 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE invoice_collections ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- SALARY_PAYMENTS
-- ============================================
-- Step 1: Add columns
ALTER TABLE salary_payments 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1,
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(12,2);

-- Step 2: Backfill local_amount from total_amount
UPDATE salary_payments 
SET local_amount = total_amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE salary_payments ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- ADVANCES
-- ============================================
-- Step 1: Add columns
ALTER TABLE advances 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1,
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(12,2);

-- Step 2: Backfill local_amount from amount
UPDATE advances 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE advances ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- Verification - Check no NULL local_amount values
-- ============================================
SELECT 
    'account_movements' AS table_name, 
    COUNT(*) AS null_count
FROM account_movements 
WHERE local_amount IS NULL
UNION ALL
SELECT 'cashbox_movements', COUNT(*) FROM cashbox_movements WHERE local_amount IS NULL
UNION ALL
SELECT 'bank_account_movements', COUNT(*) FROM bank_account_movements WHERE local_amount IS NULL
UNION ALL
SELECT 'collections', COUNT(*) FROM collections WHERE local_amount IS NULL
UNION ALL
SELECT 'invoice_collections', COUNT(*) FROM invoice_collections WHERE local_amount IS NULL
UNION ALL
SELECT 'salary_payments', COUNT(*) FROM salary_payments WHERE local_amount IS NULL
UNION ALL
SELECT 'advances', COUNT(*) FROM advances WHERE local_amount IS NULL;

-- ============================================
-- Verification - Check currency and exchange_rate defaults
-- ============================================
SELECT 
    table_name,
    column_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('currency', 'exchange_rate', 'local_amount')
  AND table_name IN (
    'account_movements', 'cashbox_movements', 'bank_account_movements',
    'collections', 'invoice_collections', 'salary_payments', 'advances'
  )
ORDER BY table_name, column_name;

-- ============================================
-- Summary
-- ============================================
SELECT 
    'TASK 6 COMPLETED' AS status,
    COUNT(*) AS columns_added
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('currency', 'exchange_rate', 'local_amount')
  AND table_name IN (
    'account_movements', 'cashbox_movements', 'bank_account_movements',
    'collections', 'invoice_collections', 'salary_payments', 'advances'
  );