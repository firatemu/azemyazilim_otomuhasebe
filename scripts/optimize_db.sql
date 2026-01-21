-- Optimize Audit Logs (Dashboard Feed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_tenant_date 
ON "audit_logs"("tenantId", "createdAt" DESC);

-- Optimize Invoices (Recent Lists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fatura_tenant_date 
ON "faturalar"("tenantId", "tarih" DESC);

-- Optimize Stock Movements (History)
-- Assuming "stok_hareketleri" based on @@map
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stok_hareket_tenant_date 
ON "stok_hareketleri"("stokId", "createdAt" DESC);
