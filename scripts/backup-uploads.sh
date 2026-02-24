#!/usr/bin/env bash
# Local uploads klasörü yedeği (api-stage/server/uploads)
# MinIO'ya migrate edilmemiş eski dosyalar burada olabilir
# Kullanım: ./scripts/backup-uploads.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUPS_DIR="$PROJECT_ROOT/backups"
UPLOADS_DIR="$PROJECT_ROOT/api-stage/server/uploads"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUPS_DIR/uploads_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUPS_DIR"

if [[ ! -d "$UPLOADS_DIR" ]]; then
  echo "Uyarı: Uploads klasörü yok: $UPLOADS_DIR"
  mkdir -p "$UPLOADS_DIR"
  echo "Boş klasör oluşturuldu. Yedek atlandı."
  exit 0
fi

FILE_COUNT=$(find "$UPLOADS_DIR" -type f 2>/dev/null | wc -l)
if [[ "$FILE_COUNT" -eq 0 ]]; then
  echo "Uploads klasörü boş. Yedek atlandı."
  exit 0
fi

echo "Uploads yedeği alınıyor: $BACKUP_FILE"
tar -czf "$BACKUP_FILE" -C "$PROJECT_ROOT" api-stage/server/uploads

if [[ -f "$BACKUP_FILE" && -s "$BACKUP_FILE" ]]; then
  echo "Uploads yedek tamamlandı. Boyut: $(du -h "$BACKUP_FILE" | cut -f1)"
else
  echo "Hata: Yedek dosyası oluşturulamadı."
  exit 1
fi
