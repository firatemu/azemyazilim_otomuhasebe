-- TASK 1: Fix Nullable tenantId Columns (FINAL)
-- Demo tenant UUID: cmmg5gp2v0007vmr8dgnfw7bu

-- 1. Backfill NULL values
UPDATE accounts SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE products SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE banks SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE warehouses SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE cashboxes SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE employees SET "tenantId" = 'cmmg5gp2v0007vmr8dgnfw7bu' WHERE "tenantId" IS NULL;
UPDATE role_permissions rp
SET tenant_id = (SELECT r."tenantId" FROM roles r WHERE r.id = rp.role_id LIMIT 1)
WHERE tenant_id IS NULL;

-- 2. Set NOT NULL
ALTER TABLE accounts ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE products ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE banks ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE warehouses ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE cashboxes ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE employees ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE role_permissions ALTER COLUMN tenant_id SET NOT NULL;

-- 3. Verification
SELECT 
    'accounts' AS table_name, COUNT(*) AS total, 
    COUNT(CASE WHEN "tenantId" IS NULL THEN 1 END) AS null_tenant 
FROM accounts
UNION ALL
SELECT 'products', COUNT(*), COUNT(CASE WHEN "tenantId" IS NULL THEN 1 END) FROM products
UNION ALL
SELECT 'role_permissions', COUNT(*), COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) FROM role_permissions;
