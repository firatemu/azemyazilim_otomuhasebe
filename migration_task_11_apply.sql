-- ============================================
-- TASK 11: Create ProductVehicleCompatibility Table
-- ============================================

-- ============================================
-- TABLE ALREADY CREATED
-- Skip table creation, just verify
-- ============================================

-- ============================================
-- Verification
-- ============================================
SELECT 
    'TASK 11 COMPLETED' AS status,
    (SELECT COUNT(*) FROM pg_tables WHERE tablename = 'product_vehicle_compatibilities') AS table_exists,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'product_vehicle_compatibilities' AND column_name = 'tenant_id') AS tenant_id_exists;