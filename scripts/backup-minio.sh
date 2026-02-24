#!/usr/bin/env bash
# MinIO bucket yedeği (object storage: logos, belgeler, faturalar vb.)
# Kullanım: ./scripts/backup-minio.sh
# Gereksinim: Docker compose ile minio container'ı çalışıyor olmalı (otomuhasebe-minio)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUPS_DIR="${BACKUPS_DIR:-$PROJECT_ROOT/backups}"
CONTAINER_NAME="otomuhasebe-minio"
BUCKET_NAME="${MINIO_BUCKET:-otomuhasebe}"
MINIO_USER="${MINIO_ACCESS_KEY:-minioadmin}"
MINIO_PASS="${MINIO_SECRET_KEY:-minioadmin123}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_SUBDIR="minio_${TIMESTAMP}"
BACKUP_PATH="$BACKUPS_DIR/$BACKUP_SUBDIR"

mkdir -p "$BACKUP_PATH"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Hata: MinIO container ($CONTAINER_NAME) çalışmıyor."
  exit 1
fi

if ! curl -sf http://127.0.0.1:9000/minio/health/live > /dev/null 2>&1; then
  echo "Hata: MinIO API erişilemiyor (localhost:9000)."
  exit 1
fi

echo "MinIO yedeği alınıyor: $BACKUP_PATH"

docker run --rm \
  -v "$BACKUP_PATH:/backup" \
  --network container:"$CONTAINER_NAME" \
  --entrypoint /bin/sh \
  minio/mc:latest \
  -c "mc alias set backup http://localhost:9000 $MINIO_USER $MINIO_PASS --api S3v4 && (mc ls backup/$BUCKET_NAME > /dev/null 2>&1 && mc mirror --overwrite backup/$BUCKET_NAME /backup/$BUCKET_NAME || mkdir -p /backup/$BUCKET_NAME)"

echo "MinIO yedek tamamlandı. Boyut: $(du -sh "$BACKUP_PATH" 2>/dev/null | cut -f1)"
