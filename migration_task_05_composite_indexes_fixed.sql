-- ============================================
-- TASK 5: Add Composite Indexes to High-Volume Tables
-- ============================================

-- ============================================
-- Faturalar (Invoices) - Add Composite Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS faturalar_tenant_tarih_idx 
ON faturalar("tenantId", "tarih");

CREATE INDEX IF NOT EXISTS faturalar_tenant_durum_idx 
ON faturalar("tenantId", "durum");

CREATE INDEX IF NOT EXISTS faturalar_tenant_created_idx 
ON faturalar("tenantId", "createdAt");

-- ============================================
-- FaturaKalemi (Invoice Items) - Already Done in TASK 1
-- ============================================
-- Already added: fatura_kalemleri_tenant_fatura_idx
-- Already added: fatura_kalemleri_tenant_stok_idx

-- ============================================
-- StockMove (Stock Moves) - Already Done in TASK 1
-- ============================================
-- Already added: stock_moves_tenant_product_created_idx
-- Already added: stock_moves_tenant_move_type_idx

-- ============================================
-- KasaHareket (Cashbox Movements) - Add Composite Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS kasa_hareketler_tenant_kasa_tarih_idx 
ON kasa_hareketler("kasaId", "tarih");

CREATE INDEX IF NOT EXISTS kasa_hareketler_tenant_created_idx 
ON kasa_hareketler("tenantId", "createdAt");

-- ============================================
-- BankaHesapHareket (Bank Account Movements) - Add Composite Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS banka_hesap_hareketler_tenant_hesap_tarih_idx 
ON banka_hesap_hareketler("hesapId", "tarih");

CREATE INDEX IF NOT EXISTS banka_hesap_hareketler_tenant_created_idx 
ON banka_hesap_hareketler("createdAt");

-- ============================================
-- Tahsilat (Collections) - Add Composite Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS tahsilatlar_tenant_tarih_idx 
ON tahsilatlar("tenantId", "tarih");

CREATE INDEX IF NOT EXISTS tahsilatlar_tenant_cari_idx 
ON tahsilatlar("tenantId", "cariId");

-- ============================================
-- AuditLog - Add Composite Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS audit_logs_tenant_created_idx 
ON audit_logs("tenantId", "createdAt");

CREATE INDEX IF NOT EXISTS audit_logs_tenant_action_idx 
ON audit_logs("tenantId", "action");

-- ============================================
-- ProductLocationStock (Location-based Stock) - Already Done in TASK 1
-- ============================================
-- Already added: product_location_stocks_tenant_idx

-- ============================================
-- StockCostHistory - Already Done in TASK 1
-- ============================================
-- Already added: stock_cost_history_tenant_product_computed_idx

-- ============================================
-- Additional Composite Indexes for Performance
-- ============================================

-- SatisIrsaliyesi (Sales Delivery Notes)
CREATE INDEX IF NOT EXISTS satis_irsaliyeleri_tenant_durum_idx 
ON satis_irsaliyeleri("tenantId", "durum");

CREATE INDEX IF NOT EXISTS satis_irsaliyeleri_tenant_tarih_idx 
ON satis_irsaliyeleri("tenantId", "irsaliyeTarihi");

-- SatinAlmaIrsaliyesi (Purchase Delivery Notes)
CREATE INDEX IF NOT EXISTS satin_alma_irsaliyeleri_tenant_durum_idx 
ON satin_alma_irsaliyeleri("tenantId", "durum");

CREATE INDEX IF NOT EXISTS satin_alma_irsaliyeleri_tenant_tarih_idx 
ON satin_alma_irsaliyeleri("tenantId", "irsaliyeTarihi");

-- Teklif (Quotes)
CREATE INDEX IF NOT EXISTS teklifler_tenant_durum_idx 
ON teklifler("tenantId", "durum");

CREATE INDEX IF NOT EXISTS teklifler_tenant_tarih_idx 
ON teklifler("tenantId", "tarih");

-- WorkOrder
CREATE INDEX IF NOT EXISTS work_orders_tenant_durum_idx 
ON work_orders("tenantId", "status");

CREATE INDEX IF NOT EXISTS work_orders_tenant_created_idx 
ON work_orders("tenantId", "createdAt");

-- CariHareket (Account Movements)
CREATE INDEX IF NOT EXISTS cari_hareketler_cari_tarih_idx 
ON cari_hareketler("cariId", "tarih");

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check Faturalar indexes
SELECT 
  indexname as index_name,
  tablename as table_name,
  indexdef as definition
FROM pg_indexes
WHERE tablename = 'faturalar'
  AND schemaname = 'public'
ORDER BY indexname;

-- Check KasaHareket indexes
SELECT 
  indexname as index_name,
  tablename as table_name,
  indexdef as definition
FROM pg_indexes
WHERE tablename = 'kasa_hareketler'
  AND schemaname = 'public'
ORDER BY indexname;

-- Check Tahsilat indexes
SELECT 
  indexname as index_name,
  tablename as table_name,
  indexdef as definition
FROM pg_indexes
WHERE tablename = 'tahsilatlar'
  AND schemaname = 'public'
ORDER BY indexname;

-- Check AuditLog indexes
SELECT 
  indexname as index_name,
  tablename as table_name,
  indexdef as definition
FROM pg_indexes
WHERE tablename = 'audit_logs'
  AND schemaname = 'public'
ORDER BY indexname;

-- Summary of all composite indexes created
SELECT 
  'Composite Indexes Created' as task,
  COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%_tenant_%_idx';

SELECT 'TASK 5 COMPLETED' as status, NOW() as completed_at;