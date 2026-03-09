-- ============================================
-- Phase 3: Row Level Security (RLS) - Fixed Script
-- Enables RLS and creates policies for all tenant tables
-- Uses correct tenant column names (tenantId or tenant_id)
-- ============================================

BEGIN;

-- ============================================
-- Disable RLS on all tables first (clean slate)
-- ============================================
DO $$
DECLARE 
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true LOOP
    EXECUTE 'ALTER TABLE ' || t || ' DISABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- ============================================
-- Enable RLS and Create Policies
-- ============================================
DO $$
DECLARE
  table_record RECORD;
  tenant_col text;
  policy_sql text;
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
    EXECUTE 'ALTER TABLE ' || quote_ident(table_record.table_name) || ' ENABLE ROW LEVEL SECURITY';
    
    -- Drop existing policy if any
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(table_record.table_name) || '_tenant_isolation ON ' || quote_ident(table_record.table_name);
    
    -- Create policy with proper quoting and NULL safety
    IF tenant_col = 'tenantId' THEN
      policy_sql := 'CREATE POLICY ' || quote_ident(table_record.table_name) || '_tenant_isolation ON ' || quote_ident(table_record.table_name) || 
                   ' FOR ALL USING ("tenantId" = current_setting(''app.current_tenant_id'', true))';
    ELSE
      policy_sql := 'CREATE POLICY ' || quote_ident(table_record.table_name) || '_tenant_isolation ON ' || quote_ident(table_record.table_name) || 
                   ' FOR ALL USING (tenant_id = current_setting(''app.current_tenant_id'', true))';
    END IF;
    
    EXECUTE policy_sql;
    RAISE NOTICE 'Enabled RLS on % (column: %)', table_record.table_name, tenant_col;
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
    "tenantId" = current_setting('app.current_tenant_id', true)
  );

-- Role Table Policy (system roles visible to all)
DROP POLICY IF EXISTS roles_tenant_isolation ON roles;
CREATE POLICY roles_tenant_isolation ON roles
  FOR ALL
  USING (
    "isSystemRole" = true OR
    "tenantId" = current_setting('app.current_tenant_id', true)
  );

-- AuditLog Policy (system logs for SUPER_ADMIN/SUPPORT only)
DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs;
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  FOR ALL
  USING (
    ("tenantId" IS NULL AND 
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = audit_logs.userId 
          AND role IN ('SUPER_ADMIN', 'SUPPORT')
      )
    ) OR
    ("tenantId" IS NOT NULL AND 
      "tenantId" = current_setting('app.current_tenant_id', true)
    )
  );

COMMIT;

-- ============================================
-- Verification
-- ============================================

-- Count RLS enabled tables and policies
SELECT 
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as rls_enabled_tables,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND policyname LIKE '%_tenant_isolation') as policies_created;

-- Show sample RLS tables
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true
ORDER BY tablename
LIMIT 15;

SELECT 'RLS IMPLEMENTATION COMPLETED' as status, NOW() as completed_at;