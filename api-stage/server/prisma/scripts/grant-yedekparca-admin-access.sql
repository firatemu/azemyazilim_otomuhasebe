-- Yedek Parça tenant: plan + abonelik + BASE_PLAN lisansları + admin rolü
-- Böylece hem admin (TENANT_ADMIN) hem normal kullanıcı giriş yapabilir.

BEGIN;

-- 1) Trial plan (slug unique)
INSERT INTO plans (id, name, slug, description, price, currency, "billingPeriod", "trialDays", "baseUserLimit", "isActive", "isBasePlan", "createdAt", "updatedAt")
VALUES ('clxtrialplan00001', 'Deneme Paketi', 'trial', 'Deneme erişimi', 0, 'TRY', 'MONTHLY', 0, 10, true, true, now(), now())
ON CONFLICT (slug) DO UPDATE SET "isActive" = true, "updatedAt" = now();

-- 2) Tenant için abonelik (Yedek Parça)
INSERT INTO subscriptions (id, "tenantId", "planId", status, "startDate", "endDate", "createdAt", "updatedAt")
VALUES (
  'clxsubyedekparca01',
  'clxyedekparca00001',
  (SELECT id FROM plans WHERE slug = 'trial' LIMIT 1),
  'ACTIVE',
  now(),
  now() + interval '1 year',
  now(),
  now()
)
ON CONFLICT ("tenantId") DO UPDATE SET status = 'ACTIVE', "endDate" = now() + interval '1 year', "updatedAt" = now();

-- 3) BASE_PLAN lisansları (her iki kullanıcı; moduleId NULL)
INSERT INTO user_licenses (id, "userId", "licenseType", "assignedAt", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, '56fdab02-13ad-4441-b755-862f88d6e7cb', 'BASE_PLAN', now(), now(), now()),
  (gen_random_uuid()::text, '5c81dff5-0ee8-4395-b655-138a4d0064b8', 'BASE_PLAN', now(), now(), now())
ON CONFLICT ("userId", "licenseType", "moduleId") DO NOTHING;

-- 4) Fatih'i TENANT_ADMIN yap (lisans kontrolü atlanır, tam yetki)
UPDATE users SET role = 'TENANT_ADMIN', "updatedAt" = now() WHERE id = '56fdab02-13ad-4441-b755-862f88d6e7cb';

COMMIT;
