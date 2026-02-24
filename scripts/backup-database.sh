#!/usr/bin/env bash
# Veritabanı yedeği (şema + tüm veriler)
# Kullanım: ./scripts/backup-database.sh
# Gereksinim: Docker compose ile postgres container'ı çalışıyor olmalı (otomuhasebe-postgres)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUPS_DIR="$PROJECT_ROOT/backups"
CONTAINER_NAME="otomuhasebe-postgres"
DB_NAME="otomuhasebe_stage"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUPS_DIR/otomuhasebe_stage_${TIMESTAMP}.sql"

mkdir -p "$BACKUPS_DIR"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Hata: PostgreSQL container ($CONTAINER_NAME) çalışmıyor. Önce: docker compose -f docker-compose.base.yml -f docker-compose.staging.dev.yml up -d"
  exit 1
fi

echo "Yedek alınıyor: $BACKUP_FILE"
docker exec "$CONTAINER_NAME" pg_dump -U postgres --no-owner --no-acl "$DB_NAME" -F p > "$BACKUP_FILE"

if [[ -s "$BACKUP_FILE" ]]; then
  echo "Yedek tamamlandı. Boyut: $(du -h "$BACKUP_FILE" | cut -f1)"
else
  echo "Hata: Yedek dosyası boş."
  exit 1
fi
