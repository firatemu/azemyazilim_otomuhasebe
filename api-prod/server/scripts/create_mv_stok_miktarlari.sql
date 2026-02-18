-- Materialized View for Stock Quantities
-- Bu view, stok miktarlarını real-time olarak hesaplar ve cache'ler

-- Drop if exists
DROP MATERIALIZED VIEW IF EXISTS mv_stok_miktarlari;

-- Create materialized view
CREATE MATERIALIZED VIEW mv_stok_miktarlari AS
SELECT
  s.id as stok_id,
  s."tenantId",
  COALESCE(
    SUM(CASE
      WHEN sh."hareketTipi" IN ('GIRIS', 'IADE', 'SAYIM_FAZLA')
        THEN sh."miktar"
      ELSE 0
    END) -
    SUM(CASE
      WHEN sh."hareketTipi" IN ('CIKIS', 'SATIS', 'SAYIM_EKSIK')
        THEN sh."miktar"
      ELSE 0
    END),
    0
  ) as mevcut_miktar,
  COUNT(sh.id) as toplam_hareket_sayisi,
  MAX(sh."createdAt") as son_hareket_tarihi,
  NOW() as son_calculama_tarihi
FROM stoklar s
LEFT JOIN stok_hareketleri sh ON sh."stokId" = s.id
GROUP BY s.id, s."tenantId"
WITH DATA;

-- Create indexes
CREATE UNIQUE INDEX idx_mv_stok_miktarlari_stok_id
  ON mv_stok_miktarlari(stok_id);

CREATE INDEX idx_mv_stok_miktarlari_tenant_id
  ON mv_stok_miktarlari("tenantId");

CREATE INDEX idx_mv_stok_miktarlari_mevcut_miktar
  ON mv_stok_miktarlari(mevcut_miktar);

-- Comments
COMMENT ON MATERIALIZED VIEW mv_stok_miktarlari IS
  'Stok miktarlarını real-time hesaplayan materialized view';

ANALYZE mv_stok_miktarlari;
