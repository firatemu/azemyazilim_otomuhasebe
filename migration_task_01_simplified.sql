-- ============================================
-- TASK 1: Fix Nullable tenantId Columns (Simplified)
-- ============================================
-- Bu script sadece eksik olanları tamamlar
-- Çoğu tablo zaten tenant_id ile NOT NULL olarak ayarlanmış

-- ============================================
-- 1. Role Permissions - tenant_id nullable'ı NOT NULL yap
-- ============================================

-- Backfill from roles
UPDATE role_permissions rp
SET tenant_id = (
  SELECT r.tenantId 
  FROM roles r 
  WHERE r.id = rp.role_id 
  LIMIT 1
)
WHERE tenant_id IS NULL;

-- Set NOT NULL
ALTER TABLE role_permissions ALTER COLUMN tenant_id SET NOT NULL;

-- Verify
SELECT 
    'role_permissions' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) AS null_tenant_id
FROM role_permissions;

-- ============================================
-- 2. Check constraints for special tables
-- ============================================

-- Check if roles table has is_system_role column
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'roles' AND column_name = 'is_system_role';

-- If exists, add constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'roles' AND column_name = 'is_system_role'
    ) THEN
        ALTER TABLE roles 
        ADD CONSTRAINT IF NOT EXISTS roles_tenant_check
        CHECK (
            (is_system_role = true  AND tenantId IS NULL) OR
            (is_system_role = false AND tenantId IS NOT NULL)
        );
    END IF;
END $$;

-- Check constraint for users table (SUPER_ADMIN, SUPPORT)
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS users_tenant_check
CHECK (
    (role IN ('SUPER_ADMIN', 'SUPPORT') AND tenantId IS NULL) OR
    (role NOT IN ('SUPER_ADMIN', 'SUPPORT') AND tenantId IS NOT NULL)
);

-- ============================================
-- 3. Verification - All tenant_id columns should be NOT NULL
-- ============================================

SELECT 
    table_name,
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE column_name IN ('tenant_id', 'tenantId')
  AND table_schema = 'public'
  AND is_nullable = 'YES'
  AND table_name NOT IN ('audit_logs', 'einvoice_inbox')
ORDER BY table_name, column_name;

-- ============================================
-- 4. Check foreign keys
-- ============================================

SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'tenants'
  AND ccu.column_name = 'id'
ORDER BY tc.table_name;