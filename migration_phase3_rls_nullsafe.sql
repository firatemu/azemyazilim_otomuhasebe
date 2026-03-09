-- ============================================
-- Phase 3: Row Level Security (RLS) - NULL-SAFE Policies
-- ============================================

BEGIN;

-- Disable FORCE RLS on products (test için)
ALTER TABLE products NO FORCE ROW LEVEL SECURITY;

-- ============================================
-- Update ALL policies to be NULL-safe
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
      AND table_name NOT IN ('tenants', 'plans', 'modules', 'permissions', 'vehicle_catalog', 'postal_codes', 'sessions', 'hizli_tokens', 'code_templates', 'einvoice_inbox', 'einvoice_xml', 'payments', 'subscriptions', 'user_licenses', 'module_licenses', 'users', 'roles', 'audit_logs')
    GROUP BY table_name
  LOOP
    -- Find correct tenant column name
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
    
    -- Drop existing policy
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(table_record.table_name) || '_tenant_isolation ON ' || quote_ident(table_record.table_name);
    
    -- Create NULL-safe policy: tenant context must be set AND match
    IF tenant_col = 'tenantId' THEN
      policy_sql := 'CREATE POLICY ' || quote_ident(table_record.table_name) || '_tenant_isolation ON ' || quote_ident(table_record.table_name) || 
                   ' FOR ALL USING (current_setting(''app.current_tenant_id'', true) IS NOT NULL AND "tenantId" = current_setting(''app.current_tenant_id'', true))';
    ELSE
      policy_sql := 'CREATE POLICY ' || quote_ident(table_record.table_name) || '_tenant_isolation ON ' || quote_ident(table_record.table_name) || 
                   ' FOR ALL USING (current_setting(''app.current_tenant_id'', true) IS NOT NULL AND tenant_id = current_setting(''app.current_tenant_id'', true))';
    END IF;
    
    EXECUTE policy_sql;
    RAISE NOTICE 'Updated policy for %', table_record.table_name;
  END LOOP;
END $$;

-- Special Policies (NULL-safe)
DROP POLICY IF EXISTS users_tenant_isolation ON users;
CREATE POLICY users_tenant_isolation ON users
  FOR ALL
  USING (
    role IN ('SUPER_ADMIN', 'SUPPORT') OR
    (current_setting('app.current_tenant_id', true) IS NOT NULL AND "tenantId" = current_setting('app.current_tenant_id', true))
  );

DROP POLICY IF EXISTS roles_tenant_isolation ON roles;
CREATE POLICY roles_tenant_isolation ON roles
  FOR ALL
  USING (
    "isSystemRole" = true OR
    (current_setting('app.current_tenant_id', true) IS NOT NULL AND "tenantId" = current_setting('app.current_tenant_id', true))
  );

DROP POLICY IF EXISTS audit_logs_tenant_isolation ON audit_logs;
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  FOR ALL
  USING (
    ("tenantId" IS NULL AND 
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = "audit_logs"."userId" 
          AND role IN ('SUPER_ADMIN', 'SUPPORT')
      )
    ) OR
    ("tenantId" IS NOT NULL AND 
      current_setting('app.current_tenant_id', true) IS NOT NULL AND
      "tenantId" = current_setting('app.current_tenant_id', true)
    )
  );

COMMIT;

-- ============================================
-- Verification
-- ============================================
SELECT 'RLS NULL-SAFE POLICIES UPDATED' as status, NOW() as completed_at;
SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public' AND policyname LIKE '%_tenant_isolation';