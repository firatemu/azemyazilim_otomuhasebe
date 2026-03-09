-- Cari hesaplardaki (veya fatura/ürün) bir tenant_id ile kullanıcının tenant_id'sini eşitler.
-- Kullanım (Postgres container içinde):
--   docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage -v user_email="'info@azemyazilim.com'" -f -
-- Veya tek satır (email'i değiştirin):
--   docker exec otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage -c "UPDATE users SET \"tenantId\" = (SELECT \"tenantId\" FROM accounts WHERE \"tenantId\" IS NOT NULL LIMIT 1) WHERE email = 'info@azemyazilim.com' AND (SELECT \"tenantId\" FROM accounts WHERE \"tenantId\" IS NOT NULL LIMIT 1) IS NOT NULL;"

-- 1) Cari (accounts) -> fatura (invoices) -> ürün (products) sırasıyla tenant_id al
WITH target AS (
  SELECT COALESCE(
    (SELECT "tenantId" FROM accounts WHERE "tenantId" IS NOT NULL LIMIT 1),
    (SELECT "tenantId" FROM invoices WHERE "tenantId" IS NOT NULL LIMIT 1),
    (SELECT "tenantId" FROM products WHERE "tenantId" IS NOT NULL LIMIT 1)
  ) AS id
)
UPDATE users u
SET "tenantId" = (SELECT id FROM target)
FROM target
WHERE u.email = 'info@azemyazilim.com'
  AND (SELECT id FROM target) IS NOT NULL
  AND (u."tenantId" IS DISTINCT FROM (SELECT id FROM target));

-- Kaç satır güncellendi görmek için (yukarıdaki UPDATE'ten sonra):
-- SELECT id, email, "tenantId" FROM users WHERE email = 'info@azemyazilim.com';
