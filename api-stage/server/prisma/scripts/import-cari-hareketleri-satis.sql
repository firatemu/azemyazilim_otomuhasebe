-- Aktarılmış satış faturaları (SATIS / SATIS_IADE) için cari hesap hareketleri ve bakiye ilişkisini kurar.
-- Bu script sadece henüz cari hareketi OLMAYAN faturalar için hareket ekler (tekrar çalıştırmada çift kayıt olmaz).
-- İlişkiler: Fatura (cariId) -> Cari; her fatura için bir CariHareket; cariler.bakiye güncellenir.
-- Tenant: clxyedekparca00001
--
-- Önce import-faturalar-satis.sql (veya gen-import-faturalar-satis.py çıktısı) çalıştırılmış olmalı.

BEGIN;

-- 1) Cari bakiyelerini güncelle (bu satış faturalarının toplam etkisi)
--    SATIS -> müşteri borçlu (alacak artar, bakiye artar), SATIS_IADE -> bakiye azalır
UPDATE cariler c
SET bakiye = c.bakiye + COALESCE(t.effect, 0)
FROM (
  SELECT
    f."cariId",
    SUM(CASE WHEN f."faturaTipi" = 'SATIS' THEN f."genelToplam" WHEN f."faturaTipi" = 'SATIS_IADE' THEN -f."genelToplam" ELSE 0 END) AS effect
  FROM faturalar f
  WHERE f."tenantId" = 'clxyedekparca00001'
    AND f.durum IN ('ONAYLANDI', 'KAPALI')
    AND f."faturaTipi" IN ('SATIS', 'SATIS_IADE')
    AND NOT EXISTS (
      SELECT 1 FROM cari_hareketler ch
      WHERE ch."cariId" = f."cariId" AND ch."belgeNo" = f."faturaNo" AND (ch."tenantId" = f."tenantId" OR (ch."tenantId" IS NULL AND f."tenantId" IS NULL))
    )
  GROUP BY f."cariId"
) t
WHERE c.id = t."cariId" AND t.effect IS NOT NULL AND t.effect <> 0;

-- 2) Cari hareket kayıtlarını ekle (tarih sırasına göre yürüyen bakiye ile; bakiye hareketleri ilişkisi)
INSERT INTO cari_hareketler (id, "cariId", tip, tutar, bakiye, "belgeTipi", "belgeNo", tarih, aciklama, "tenantId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  fr."cariId",
  CASE WHEN fr."faturaTipi" = 'SATIS' THEN 'BORC'::"BorcAlacak" ELSE 'ALACAK'::"BorcAlacak" END,
  fr."genelToplam",
  (c.bakiye - COALESCE(te.total_effect, 0) + fr.running)::numeric(12,2),
  'FATURA'::"BelgeTipi",
  fr."faturaNo",
  fr.tarih,
  CASE WHEN fr."faturaTipi" = 'SATIS' THEN 'Satış Faturası: ' || fr."faturaNo" ELSE 'Satış İade Faturası: ' || fr."faturaNo" END,
  'clxyedekparca00001',
  now(),
  now()
FROM (
  SELECT
    fe.id,
    fe."cariId",
    fe."faturaTipi",
    fe."genelToplam",
    fe."faturaNo",
    fe.tarih,
    SUM(fe.effect) OVER (PARTITION BY fe."cariId" ORDER BY fe.tarih, fe.id) AS running
  FROM (
    SELECT
      f.id,
      f."cariId",
      f."faturaTipi",
      f."genelToplam",
      f."faturaNo",
      f.tarih,
      CASE WHEN f."faturaTipi" = 'SATIS' THEN f."genelToplam" WHEN f."faturaTipi" = 'SATIS_IADE' THEN -f."genelToplam" ELSE 0 END AS effect
    FROM faturalar f
    WHERE f."tenantId" = 'clxyedekparca00001'
      AND f.durum IN ('ONAYLANDI', 'KAPALI')
      AND f."faturaTipi" IN ('SATIS', 'SATIS_IADE')
      AND NOT EXISTS (
        SELECT 1 FROM cari_hareketler ch
        WHERE ch."cariId" = f."cariId" AND ch."belgeNo" = f."faturaNo" AND (ch."tenantId" = f."tenantId" OR (ch."tenantId" IS NULL AND f."tenantId" IS NULL))
      )
  ) fe
) fr
JOIN cariler c ON c.id = fr."cariId"
LEFT JOIN (
  SELECT
    f."cariId",
    SUM(CASE WHEN f."faturaTipi" = 'SATIS' THEN f."genelToplam" WHEN f."faturaTipi" = 'SATIS_IADE' THEN -f."genelToplam" ELSE 0 END) AS total_effect
  FROM faturalar f
  WHERE f."tenantId" = 'clxyedekparca00001'
    AND f.durum IN ('ONAYLANDI', 'KAPALI')
    AND f."faturaTipi" IN ('SATIS', 'SATIS_IADE')
    AND NOT EXISTS (
      SELECT 1 FROM cari_hareketler ch
      WHERE ch."cariId" = f."cariId" AND ch."belgeNo" = f."faturaNo" AND (ch."tenantId" = f."tenantId" OR (ch."tenantId" IS NULL AND f."tenantId" IS NULL))
    )
  GROUP BY f."cariId"
) te ON te."cariId" = fr."cariId";

COMMIT;
