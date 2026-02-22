-- Cari hesap bakiyelerini sadece cari_hareketler tutarlarından (BORC/ALACAK) baştan hesaplar.
-- Böylece "aktarılan bakiye" + fatura toplamları çift toplanmaz.
-- Bakiye = hareketlerin toplam etkisi (BORC +tutar, ALACAK -tutar); DEVIR yok sayılır.

BEGIN;

-- 1) Cari hareketlerindeki bakiye sütununu tarih sırasına göre kümülatif toplam ile güncelle (0'dan başlayarak)
WITH ordered AS (
  SELECT
    id,
    "cariId",
    tip,
    tutar,
    tarih,
    "createdAt",
    SUM(CASE WHEN tip = 'BORC' THEN tutar WHEN tip = 'ALACAK' THEN -tutar ELSE 0 END)
      OVER (PARTITION BY "cariId" ORDER BY tarih, "createdAt" NULLS LAST) AS running_bakiye
  FROM cari_hareketler
)
UPDATE cari_hareketler ch
SET bakiye = o.running_bakiye::numeric(12,2)
FROM ordered o
WHERE ch.id = o.id;

-- 2) Cariler: bakiye = hareketlerin toplam etkisi (BORC - ALACAK)
UPDATE cariler c
SET bakiye = COALESCE(sub.total_bakiye, 0)
FROM (
  SELECT
    "cariId",
    SUM(CASE WHEN tip = 'BORC' THEN tutar WHEN tip = 'ALACAK' THEN -tutar ELSE 0 END) AS total_bakiye
  FROM cari_hareketler
  GROUP BY "cariId"
) sub
WHERE c.id = sub."cariId";

-- 3) Hiç hareketi olmayan cariler: bakiye = 0
UPDATE cariler
SET bakiye = 0
WHERE id NOT IN (SELECT DISTINCT "cariId" FROM cari_hareketler);

COMMIT;
