-- 1) Yedek Parça tenant'ı (yoksa oluştur)
INSERT INTO tenants (id, uuid, name, subdomain, status, "tenantType", "createdAt", "updatedAt")
VALUES (
  'clxyedekparca00001',
  gen_random_uuid()::text,
  'Yedek Parça',
  'yedekparca',
  'ACTIVE',
  'CORPORATE',
  now(),
  now()
)
ON CONFLICT (subdomain) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, "updatedAt" = now();

-- 2) Kullanıcıları ekle (id çakışmasında güncelleme)
INSERT INTO users (
  id, uuid, email, username, password, "fullName", role, status, "isActive",
  "tenantId", "tokenVersion", "refreshToken", "emailVerified", "createdAt", "updatedAt"
)
VALUES
  (
    '56fdab02-13ad-4441-b755-862f88d6e7cb',
    gen_random_uuid()::text,
    'fatihotoyd@gmail.com',
    'Fatih',
    '$2b$10$N3JlK1UGGjceKbI4Xlcteuv6GiNYDsnIDw3Ul0blnqKDeTy4zbXAe',
    'Sistem Yöneticisi',
    'ADMIN',
    'ACTIVE',
    true,
    'clxyedekparca00001',
    0,
    NULL,
    false,
    '2025-10-30 20:58:08.091',
    '2026-02-21 06:19:48.86'
  ),
  (
    '5c81dff5-0ee8-4395-b655-138a4d0064b8',
    gen_random_uuid()::text,
    'gokmen@stnoto.com',
    'gökmen',
    '$2b$10$mLtCWNI3xmsTlooTMWx6JOSE0o8xfiHAxns6q7kNJT6Bq1nPSMaJe',
    'Gökmen',
    'USER',
    'ACTIVE',
    true,
    'clxyedekparca00001',
    0,
    NULL,
    false,
    '2025-12-23 06:05:07.001',
    '2026-02-21 06:41:58.755'
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  "fullName" = EXCLUDED."fullName",
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  "isActive" = EXCLUDED."isActive",
  "tenantId" = EXCLUDED."tenantId",
  "tokenVersion" = EXCLUDED."tokenVersion",
  "refreshToken" = EXCLUDED."refreshToken",
  "updatedAt" = EXCLUDED."updatedAt";
