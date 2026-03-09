-- ============================================
-- TASK 1: Fix User Table - Check Constraints
-- ============================================
-- Add check constraints for SUPER_ADMIN and SUPPORT roles
-- ============================================

-- ============================================
-- Step 1: Add check constraint for SUPER_ADMIN/SUPPORT
-- ============================================
-- SUPER_ADMIN and SUPPORT users can have NULL tenant_id
-- Other users MUST have tenant_id

ALTER TABLE users 
ADD CONSTRAINT users_tenant_check
CHECK (
  (role IN ('SUPER_ADMIN', 'SUPPORT') AND "tenantId" IS NULL) OR
  (role NOT IN ('SUPER_ADMIN', 'SUPPORT') AND "tenantId" IS NOT NULL)
);

-- ============================================
-- Step 2: Verify constraint
-- ============================================
-- Check if any users violate the constraint
SELECT 
  id,
  email,
  role,
  "tenantId",
  CASE 
    WHEN role IN ('SUPER_ADMIN', 'SUPPORT') AND "tenantId" IS NULL THEN 'OK'
    WHEN role NOT IN ('SUPER_ADMIN', 'SUPPORT') AND "tenantId" IS NOT NULL THEN 'OK'
    ELSE 'VIOLATION'
  END as status
FROM users
ORDER BY role, "tenantId" IS NULL;

-- ============================================
-- Step 3: Summary
-- ============================================
SELECT 
  role,
  COUNT(*) as user_count,
  COUNT(*) FILTER (WHERE "tenantId" IS NOT NULL) as with_tenant,
  COUNT(*) FILTER (WHERE "tenantId" IS NULL) as without_tenant
FROM users
GROUP BY role
ORDER BY role;

SELECT 'TASK 1 COMPLETED' as status, NOW() as completed_at;