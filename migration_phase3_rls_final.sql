-- ============================================
-- Phase 3: Row Level Security (RLS) - Final Script
-- Enables RLS and creates policies for all tenant tables
-- Uses correct tenant column names (tenantId or tenant_id)
-- ============================================

BEGIN;

-- ============================================
-- Helper Function: Enable RLS + Create Policy
-- ============================================
-- This automatically detects the correct tenant column name

DO $$
DECLARE
  table_record RECORD;
  tenant_col text;
BEGIN
  FOR table_record IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND column_name IN ('tenant_id', 'tenantId')
      AND table_name NOT IN ('tenants', 'plans', 'modules', 'permissions', 'vehicle_catalog', 'postal_codes', 'sessions', 'hizli_tokens', 'code_templates', 'einvoice_inbox', 'einvoice_xml', 'payments', 'subscriptions', 'user_licenses', 'module_licenses')
    GROUP BY table_name
  LOOP
    -- Find correct tenant column name (prefer tenantId over tenant_id)
    SELECT column_name INTO tenant_col
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = table_record.table_name
      AND column_name IN ('tenant_id', 'tenantId')
    ORDER BY 
      CASE 
        WHEN column_name = 'tenantId' THEN 1 
        WHEN column_name = 'tenant_id' THEN 2 
      END
    LIMIT 1;
    
    -- Enable RLS
    EXECUTE 'ALTER TABLE ' || table_record.table_name || ' ENABLE ROW LEVEL SECURITY';
    
    -- Drop existing policy if any
    EXECUTE 'DROP POLICY IF EXISTS ' || table_record.table_name || '_tenant_isolation ON ' || table_record.table_name;
    
    -- Create policy (preserve quotes for case-sensitive column names)
    IF tenant_col = 'tenantId' THEN
      EXECUTE 'CREATE POLICY ' || table_record.table_name || '_tenant_isolation ON ' || table_record.table_name || 
              ' FOR ALL USING ("' || tenant_col || '" = current_setting(''app.current_tenant_id'')::text)';
    ELSE
      EXECUTE 'CREATE POLICY ' || table_record.table_name || '_tenant_isolation ON ' || table_record.table_name || 
              ' FOR ALL USING (' || tenant_col || ' = current_setting(''app.current_tenant_id'')::text)';
    END IF;
    
    RAISE NOTICE 'Enabled RLS on % (using column: %)', table_record.table_name, tenant_col;
  END LOOP;
END $$;

COMMIT;

-- ============================================
-- Special Policies for User, Role, AuditLog
-- ============================================

BEGIN;

-- User Table Policy (SUPER_ADMIN/SUPPORT bypass)
DROP POLICY IF EXISTS users_tenant_isolation ON users;
CREATE POLICY users_tenant_isolation ON users
  FOR ALL
  USING (
    role IN ('SUPER_ADMIN', 'SUPPORT') OR
    "tenantId" = current_setting('app.current_tenant_id')::text
  );

-- Role Table Policy (system roles visible to all)
DROP POLICY IF EXISTS roles_tenant_isolation ON roles;
CREATE POLICY roles_tenant_isolation ON roles
  FOR ALL
  USING (
    "isSystemRole" = true OR
    "tenantId" = current_setting('app.current_tenant_id')::text
  );

-- AuditLog Policy (system logs for SUPER_ADMIN/SUPPORT only)
DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs;
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  FOR ALL
  USING (
    (tenantId IS NULL AND 
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = audit_logs.userId 
          AND role IN ('SUPER_ADMIN', 'SUPPORT')
      )
    ) OR
    (tenantId IS NOT NULL AND 
      tenantId = current_setting('app.current_tenant_id')::text
    )
  );

COMMIT;

-- ============================================
-- Verification
-- ============================================

-- Count RLS enabled tables
SELECT 
  COUNT(*) as rls_enabled_tables,
  COUNT(*) FILTER (WHERE policyname LIKE '%_tenant_isolation') as policies_created
FROM pg_policies p
JOIN pg_tables t ON t.tablename = p.tablename
WHERE t.schemaname = 'public';

-- Show sample RLS tables
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true
ORDER BY tablename
LIMIT 20;

SELECT 'RLS IMPLEMENTATION COMPLETED' as status, NOW() as completed_at;