-- ============================================
-- TASK8: Float Validation and Type Consistency
-- ============================================

-- This script validates floating point columns and checks for type consistency

-- ============================================
-- VERIFICATION QUERIES - No Changes, Just Validation
-- ============================================

-- Check FaturaKalemi (Invoice Items)
SELECT 
  'FaturaKalemi' as table_name,
  'fiyat' as column_name,
  pg_typeof("fiyat") as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN "fiyat" IS NULL THEN 1 END) as null_values,
  COUNT(CASE WHEN "fiyat" < 0 THEN 1 END) as negative_values
FROM fatura_kalemleri
UNION ALL
SELECT 
  'FaturaKalemi',
  'tutar',
  pg_typeof(tutar),
  COUNT(*),
  COUNT(CASE WHEN tutar IS NULL THEN 1 END),
  COUNT(CASE WHEN tutar < 0 THEN 1 END)
FROM fatura_kalemleri
UNION ALL
SELECT 
  'FaturaKalemi',
  'iskonto',
  pg_typeof(iskonto),
  COUNT(*),
  COUNT(CASE WHEN iskonto IS NULL THEN 1 END),
  COUNT(CASE WHEN iskonto < 0 THEN 1 END)
FROM fatura_kalemleri;

-- Check PriceCard
SELECT 
  'PriceCard' as table_name,
  'fiyat' as column_name,
  pg_typeof(fiyat) as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN fiyat IS NULL THEN 1 END) as null_values,
  COUNT(CASE WHEN fiyat < 0 THEN 1 END) as negative_values
FROM price_cards
UNION ALL
SELECT 
  'PriceCard',
  'vat_rate',
  pg_typeof(vat_rate),
  COUNT(*),
  COUNT(CASE WHEN vat_rate IS NULL THEN 1 END),
  NULL as negative_values
FROM price_cards;

-- Check Stoklar (Products)
SELECT 
  'Stoklar' as table_name,
  'fiyat' as column_name,
  pg_typeof(fiyat) as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN fiyat IS NULL THEN 1 END) as null_values,
  COUNT(CASE WHEN fiyat < 0 THEN 1 END) as negative_values
FROM stoklar
UNION ALL
SELECT 
  'Stoklar',
  'alisFiyati',
  pg_typeof("alisFiyati"),
  COUNT(*),
  COUNT(CASE WHEN "alisFiyati" IS NULL THEN 1 END),
  COUNT(CASE WHEN "alisFiyati" < 0 THEN 1 END)
FROM stoklar;

-- Check KasaHareket
SELECT 
  'KasaHareket' as table_name,
  'tutar' as column_name,
  pg_typeof(tutar) as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN tutar IS NULL THEN 1 END) as null_values,
  COUNT(CASE WHEN tutar < 0 THEN 1 END) as negative_values
FROM kasa_hareketler;

-- Check BankaHesapHareket
SELECT 
  'BankaHesapHareket' as table_name,
  'tutar' as column_name,
  pg_typeof(tutar) as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN tutar IS NULL THEN 1 END) as null_values,
  COUNT(CASE WHEN tutar < 0 THEN 1 END) as negative_values
FROM banka_hesap_hareketler;

-- Check CekSenet
SELECT 
  'CekSenet' as table_name,
  'tutar' as column_name,
  pg_typeof(tutar) as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN tutar IS NULL THEN 1 END) as null_values,
  COUNT(CASE WHEN tutar < 0 THEN 1 END) as negative_values
FROM cek_senetler;

-- Check Tahsilat
SELECT 
  'Tahsilat' as table_name,
  'tutar' as column_name,
  pg_typeof(tutar) as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN tutar IS NULL THEN 1 END) as null_values,
  COUNT(CASE WHEN tutar < 0 THEN 1 END) as negative_values
FROM tahsilatlar;

-- Check StockMove
SELECT 
  'StockMove' as table_name,
  'quantity' as column_name,
  pg_typeof(quantity) as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN quantity IS NULL THEN 1 END) as null_values,
  NULL as negative_values
FROM stock_moves;

-- Check ProductLocationStock
SELECT 
  'ProductLocationStock' as table_name,
  'miktar' as column_name,
  pg_typeof(miktar) as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN miktar IS NULL THEN 1 END) as null_values,
  NULL as negative_values
FROM product_location_stocks;

-- Check StockCostHistory
SELECT 
  'StockCostHistory' as table_name,
  'cost' as column_name,
  pg_typeof(cost) as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN cost IS NULL THEN 1 END) as null_values,
  COUNT(CASE WHEN cost < 0 THEN 1 END) as negative_values
FROM stock_cost_history;

-- Check InvoiceProfit
SELECT 
  'InvoiceProfit' as table_name,
  'tutar' as column_name,
  pg_typeof(tutar) as current_type,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN tutar IS NULL THEN 1 END) as null_values,
  COUNT(CASE WHEN tutar < 0 THEN 1 END) as negative_values
FROM invoice_profit
UNION ALL
SELECT 
  'InvoiceProfit',
  'kar',
  pg_typeof(kar),
  COUNT(*),
  COUNT(CASE WHEN kar IS NULL THEN 1 END),
  COUNT(CASE WHEN kar < 0 THEN 1 END)
FROM invoice_profit;

-- ============================================
-- SUMMARY REPORT
-- ============================================

-- Count tables with validation issues
SELECT 
  'Float Validation Summary' as report_type,
  COUNT(*) as total_validations
FROM (
  SELECT 1 FROM fatura_kalemleri
  UNION ALL
  SELECT 1 FROM price_cards
  UNION ALL
  SELECT 1 FROM stoklar
  UNION ALL
  SELECT 1 FROM kasa_hareketler
  UNION ALL
  SELECT 1 FROM banka_hesap_hareketler
  UNION ALL
  SELECT 1 FROM cek_senetler
  UNION ALL
  SELECT 1 FROM tahsilatlar
  UNION ALL
  SELECT 1 FROM stock_moves
  UNION ALL
  SELECT 1 FROM product_location_stocks
  UNION ALL
  SELECT 1 FROM stock_cost_history
  UNION ALL
  SELECT 1 FROM invoice_profit
) t;

SELECT 'TASK 8 COMPLETED (Validation Only)' as status, NOW() as completed_at;