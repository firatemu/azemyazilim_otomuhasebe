-- ============================================
-- TASK6: Add Multi-Currency Support to Financial Movement Tables
-- ============================================

-- ============================================
-- KasaHareket (Cashbox Movements) - Add Currency Support
-- ============================================
-- Step 1: Add currency columns
ALTER TABLE kasa_hareketler 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY';

ALTER TABLE kasa_hareketler 
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4) DEFAULT 1.0;

ALTER TABLE kasa_hareketler 
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(15, 2);

-- Step 2: Backfill local_amount (already TRY, so local_amount = tutar)
UPDATE kasa_hareketler 
SET local_amount = tutar 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL for local_amount
ALTER TABLE kasa_hareketler ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- BankaHesapHareket (Bank Account Movements) - Add Currency Support
-- ============================================
-- Step 1: Add currency columns
ALTER TABLE banka_hesap_hareketler 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY';

ALTER TABLE banka_hesap_hareketler 
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4) DEFAULT 1.0;

ALTER TABLE banka_hesap_hareketler 
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(15, 2);

-- Step 2: Backfill local_amount (already TRY, so local_amount = tutar)
UPDATE banka_hesap_hareketler 
SET local_amount = tutar 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL for local_amount
ALTER TABLE banka_hesap_hareketler ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- FirmaKrediKartiHareket (Credit Card Movements) - Add Currency Support
-- ============================================
-- Step 1: Add currency columns
ALTER TABLE firma_kredi_karti_hareketler 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY';

ALTER TABLE firma_kredi_karti_hareketler 
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4) DEFAULT 1.0;

ALTER TABLE firma_kredi_karti_hareketler 
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(15, 2);

-- Step 2: Backfill local_amount (already TRY, so local_amount = tutar)
UPDATE firma_kredi_karti_hareketler 
SET local_amount = tutar 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL for local_amount
ALTER TABLE firma_kredi_karti_hareketler ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- Tahsilat (Collections) - Add Currency Support
-- ============================================
-- Step 1: Add currency columns
ALTER TABLE tahsilatlar 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY';

ALTER TABLE tahsilatlar 
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10, 4) DEFAULT 1.0;

ALTER TABLE tahsilatlar 
ADD COLUMN IF NOT EXISTS local_amount DECIMAL(15, 2);

-- Step 2: Backfill local_amount (already TRY, so local_amount = tutar)
UPDATE tahsilatlar 
SET local_amount = tutar 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL for local_amount
ALTER TABLE tahsilatlar ALTER COLUMN local_amount SET NOT NULL;

-- ============================================
-- Add Indexes for Currency Queries
-- ============================================

CREATE INDEX IF NOT EXISTS kasa_hareketler_tenant_currency_idx 
ON kasa_hareketler("tenantId", currency);

CREATE INDEX IF NOT EXISTS banka_hesap_hareketler_tenant_currency_idx 
ON banka_hesap_hareketler("createdAt", currency);

CREATE INDEX IF NOT EXISTS firma_kredi_karti_hareketler_tenant_currency_idx 
ON firma_kredi_karti_hareketler("createdAt", currency);

CREATE INDEX IF NOT EXISTS tahsilatlar_tenant_currency_idx 
ON tahsilatlar("tenantId", currency);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check KasaHareket currency fields
SELECT 
  'KasaHareket' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN currency IS NULL THEN 1 END) as null_currency,
  COUNT(CASE WHEN exchange_rate IS NULL THEN 1 END) as null_exchange_rate,
  COUNT(CASE WHEN local_amount IS NULL THEN 1 END) as null_local_amount
FROM kasa_hareketler;

-- Check BankaHesapHareket currency fields
SELECT 
  'BankaHesapHareket' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN currency IS NULL THEN 1 END) as null_currency,
  COUNT(CASE WHEN exchange_rate IS NULL THEN 1 END) as null_exchange_rate,
  COUNT(CASE WHEN local_amount IS NULL THEN 1 END) as null_local_amount
FROM banka_hesap_hareketler;

-- Check FirmaKrediKartiHareket currency fields
SELECT 
  'FirmaKrediKartiHareket' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN currency IS NULL THEN 1 END) as null_currency,
  COUNT(CASE WHEN exchange_rate IS NULL THEN 1 END) as null_exchange_rate,
  COUNT(CASE WHEN local_amount IS NULL THEN 1 END) as null_local_amount
FROM firma_kredi_karti_hareketler;

-- Check Tahsilat currency fields
SELECT 
  'Tahsilat' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN currency IS NULL THEN 1 END) as null_currency,
  COUNT(CASE WHEN exchange_rate IS NULL THEN 1 END) as null_exchange_rate,
  COUNT(CASE WHEN local_amount IS NULL THEN 1 END) as null_local_amount
FROM tahsilatlar;

-- Verify no NULLs in currency columns
SELECT 
  'Multi-Currency Verification' as verification,
  COUNT(*) as tables_checked
FROM (
  SELECT 'KasaHareket' FROM kasa_hareketler WHERE currency IS NOT NULL AND exchange_rate IS NOT NULL AND local_amount IS NOT NULL
  UNION ALL
  SELECT 'BankaHesapHareket' FROM banka_hesap_hareketler WHERE currency IS NOT NULL AND exchange_rate IS NOT NULL AND local_amount IS NOT NULL
  UNION ALL
  SELECT 'FirmaKrediKartiHareket' FROM firma_kredi_karti_hareketler WHERE currency IS NOT NULL AND exchange_rate IS NOT NULL AND local_amount IS NOT NULL
  UNION ALL
  SELECT 'Tahsilat' FROM tahsilatlar WHERE currency IS NOT NULL AND exchange_rate IS NOT NULL AND local_amount IS NOT NULL
) t;

SELECT 'TASK 6 COMPLETED' as status, NOW() as completed_at;