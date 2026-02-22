-- Veritabanındaki tüm verileri siler; tablo yapısı (şema) aynen kalır.
--
-- Docker ile çalıştırma (postgres container adı: otomuhasebe-postgres):
--   docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage -f - < prisma/scripts/truncate-all-data.sql
--
-- Veya proje kökünden (api-stage/server):
--   cat prisma/scripts/truncate-all-data.sql | docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage

BEGIN;

DO $$
DECLARE
  r RECORD;
  sql TEXT := '';
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename) LOOP
    IF sql <> '' THEN sql := sql || ', '; END IF;
    sql := sql || '"' || r.tablename || '"';
  END LOOP;
  IF sql <> '' THEN
    EXECUTE 'TRUNCATE TABLE ' || sql || ' CASCADE';
    RAISE NOTICE 'Tüm tablolar truncate edildi.';
  END IF;
END $$;

COMMIT;
