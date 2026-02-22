#!/bin/bash
# Uzak PostgreSQL'den (psql yoksa Docker ile) satış faturaları + kalemleri export eder.
# Kullanım: ./export-remote-satis-docker.sh "postgresql://user:pass@host:5432/dbname"
# Veya: REMOTE_DB_URL="postgresql://..." ./export-remote-satis-docker.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

URL="${1:-$REMOTE_DB_URL}"
if [ -z "$URL" ]; then
  echo "Kullanım: $0 \"postgresql://user:pass@host:5432/dbname\""
  exit 1
fi

# URL'den host, port, user, db, password parse et (basit)
# postgresql://yedekparca_user:yedekparca123@31.210.43.185:5432/yedekparca
export PGPASSWORD=$(echo "$URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
HOST=$(echo "$URL" | sed -n 's/.*@\([^:\/]*\).*/\1/p')
PORT=$(echo "$URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
USER=$(echo "$URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB=$(echo "$URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
[ -z "$PORT" ] && PORT=5432

echo "Export: $HOST:$PORT/$DB (SATIS/SATIS_IADE)..."

docker run --rm \
  -e PGPASSWORD \
  -v "$SCRIPT_DIR:/out" \
  postgres:15 \
  psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -t -A -c "
SELECT COALESCE(json_agg(t), '[]'::json) FROM (
  SELECT id, \"faturaNo\", \"faturaTipi\",
    'clxyedekparca00001' AS \"tenantId\", \"cariId\", tarih, vade, iskonto,
    \"toplamTutar\", \"kdvTutar\", \"genelToplam\",
    'TRY' AS \"dovizCinsi\", 1 AS \"dovizKuru\",
    aciklama, durum, \"odenecekTutar\", \"odenenTutar\", \"siparisNo\",
    \"createdBy\", \"deletedAt\", \"deletedBy\", \"updatedBy\", \"createdAt\", \"updatedAt\"
  FROM faturalar
  WHERE \"faturaTipi\" IN ('SATIS', 'SATIS_IADE')
) t;" -o /out/remote-faturalar-satis.json

docker run --rm \
  -e PGPASSWORD \
  -v "$SCRIPT_DIR:/out" \
  postgres:15 \
  psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -t -A -c "
SELECT COALESCE(json_agg(k), '[]'::json) FROM (
  SELECT k.id, k.\"faturaId\", k.\"stokId\", k.miktar, k.\"birimFiyat\", k.\"kdvOrani\", k.\"kdvTutar\", k.tutar, k.raf, k.\"createdAt\"
  FROM fatura_kalemleri k
  JOIN faturalar f ON f.id = k.\"faturaId\"
  WHERE f.\"faturaTipi\" IN ('SATIS', 'SATIS_IADE')
) k;" -o /out/remote-fatura-kalemleri-satis.json

for f in remote-faturalar-satis.json remote-fatura-kalemleri-satis.json; do
  [ ! -s "$f" ] || [ "$(cat "$f" | tr -d '\n\r')" = "" ] || [ "$(cat "$f" | tr -d '\n\r')" = "null" ] && echo "[]" > "$f"
done
echo "Export tamamlandı: remote-faturalar-satis.json, remote-fatura-kalemleri-satis.json"
