#!/bin/bash
# Uzak veya yerel PostgreSQL'den satış faturaları + kalemleri JSON'a yazar.
# Kullanım: ./export-remote-satis-json.sh [DATABASE_URL]
# Örnek: PGPASSWORD=xxx ./export-remote-satis-json.sh "postgresql://user:pass@host:5432/dbname"
# Veya Docker: ./export-remote-satis-json.sh --> otomuhasebe-postgres kullanır

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -n "$1" ]; then
  CONN="$1"
  psql "$CONN" -t -A -c "SELECT COALESCE(json_agg(t), '[]'::json) FROM (SELECT id, \"faturaNo\", \"faturaTipi\", \"tenantId\", \"cariId\", tarih, vade, iskonto, \"toplamTutar\", \"kdvTutar\", \"genelToplam\", \"dovizCinsi\", \"dovizKuru\", aciklama, durum, \"odenecekTutar\", \"odenenTutar\", \"siparisNo\", \"createdBy\", \"deletedAt\", \"deletedBy\", \"updatedBy\", \"createdAt\", \"updatedAt\" FROM faturalar WHERE \"faturaTipi\" IN ('SATIS', 'SATIS_IADE')) t;" > remote-faturalar-satis.json
  psql "$CONN" -t -A -c "SELECT COALESCE(json_agg(k), '[]'::json) FROM (SELECT k.id, k.\"faturaId\", k.\"stokId\", k.miktar, k.\"birimFiyat\", k.\"kdvOrani\", k.\"kdvTutar\", k.tutar, k.raf, k.\"createdAt\" FROM fatura_kalemleri k JOIN faturalar f ON f.id = k.\"faturaId\" WHERE f.\"faturaTipi\" IN ('SATIS', 'SATIS_IADE')) k;" > remote-fatura-kalemleri-satis.json
else
  docker exec otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage -t -A -c "SELECT COALESCE(json_agg(t), '[]'::json) FROM (SELECT id, \"faturaNo\", \"faturaTipi\", \"tenantId\", \"cariId\", tarih, vade, iskonto, \"toplamTutar\", \"kdvTutar\", \"genelToplam\", \"dovizCinsi\", \"dovizKuru\", aciklama, durum, \"odenecekTutar\", \"odenenTutar\", \"siparisNo\", \"createdBy\", \"deletedAt\", \"deletedBy\", \"updatedBy\", \"createdAt\", \"updatedAt\" FROM faturalar WHERE \"faturaTipi\" IN ('SATIS', 'SATIS_IADE')) t;" > remote-faturalar-satis.json
  docker exec otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage -t -A -c "SELECT COALESCE(json_agg(k), '[]'::json) FROM (SELECT k.id, k.\"faturaId\", k.\"stokId\", k.miktar, k.\"birimFiyat\", k.\"kdvOrani\", k.\"kdvTutar\", k.tutar, k.raf, k.\"createdAt\" FROM fatura_kalemleri k JOIN faturalar f ON f.id = k.\"faturaId\" WHERE f.\"faturaTipi\" IN ('SATIS', 'SATIS_IADE')) k;" > remote-fatura-kalemleri-satis.json
fi

# Boş veya null çıktıyı [] yap
for f in remote-faturalar-satis.json remote-fatura-kalemleri-satis.json; do
  if [ ! -s "$f" ] || [ "$(cat "$f" | tr -d '\n\r')" = "" ] || [ "$(cat "$f" | tr -d '\n\r')" = "null" ]; then
    echo "[]" > "$f"
  fi
done
echo "Export tamamlandı: remote-faturalar-satis.json, remote-fatura-kalemleri-satis.json"
