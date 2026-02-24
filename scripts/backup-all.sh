#!/usr/bin/env bash
# Tüm staging backup'ları tek komutla alır
# - PostgreSQL veritabanı
# - MinIO object storage
# - Local uploads klasörü
# Kullanım: ./scripts/backup-all.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUPS_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FULL_BACKUP_DIR="$BACKUPS_DIR/staging_full_${TIMESTAMP}"

echo "=============================================="
echo "Staging Tam Yedek - $TIMESTAMP"
echo "=============================================="

mkdir -p "$FULL_BACKUP_DIR"
cd "$PROJECT_ROOT"

# 1. PostgreSQL
echo ""
echo "[1/3] PostgreSQL yedeği..."
if ./scripts/backup-database.sh; then
  LATEST_DB=$(ls -t "$BACKUPS_DIR"/otomuhasebe_stage_*.sql 2>/dev/null | head -1)
  if [[ -n "$LATEST_DB" ]]; then
    cp "$LATEST_DB" "$FULL_BACKUP_DIR/"
    echo "  -> $FULL_BACKUP_DIR/$(basename "$LATEST_DB")"
  fi
else
  echo "  Uyarı: PostgreSQL yedeği atlandı."
fi

# 2. MinIO
echo ""
echo "[2/3] MinIO yedeği..."
if ./scripts/backup-minio.sh 2>/dev/null; then
  LATEST_MINIO=$(ls -td "$BACKUPS_DIR"/minio_* 2>/dev/null | head -1)
  if [[ -n "$LATEST_MINIO" && -d "$LATEST_MINIO" ]]; then
    cp -r "$LATEST_MINIO" "$FULL_BACKUP_DIR/minio"
    echo "  -> $FULL_BACKUP_DIR/minio/"
  fi
else
  echo "  Uyarı: MinIO yedeği atlandı (container çalışmıyor olabilir)."
fi

# 3. Uploads
echo ""
echo "[3/3] Uploads yedeği..."
if ./scripts/backup-uploads.sh; then
  LATEST_UPLOADS=$(ls -t "$BACKUPS_DIR"/uploads_*.tar.gz 2>/dev/null | head -1)
  if [[ -n "$LATEST_UPLOADS" ]]; then
    cp "$LATEST_UPLOADS" "$FULL_BACKUP_DIR/"
    echo "  -> $FULL_BACKUP_DIR/$(basename "$LATEST_UPLOADS")"
  fi
else
  echo "  Uyarı: Uploads yedeği atlandı."
fi

# 4. Config snapshot (env örnek, Caddyfile)
echo ""
echo "[4/4] Yapılandırma snapshot..."
if [[ -f ".env.staging" ]]; then
  cp .env.staging "$FULL_BACKUP_DIR/.env.staging"
  echo "  -> .env.staging"
fi
if [[ -f "docker/caddy/Caddyfile" ]]; then
  mkdir -p "$FULL_BACKUP_DIR/docker/caddy"
  cp docker/caddy/Caddyfile "$FULL_BACKUP_DIR/docker/caddy/"
  echo "  -> docker/caddy/Caddyfile"
fi

# Özet
echo ""
echo "=============================================="
echo "Yedek tamamlandı: $FULL_BACKUP_DIR"
echo "Toplam boyut: $(du -sh "$FULL_BACKUP_DIR" | cut -f1)"
echo "=============================================="
echo ""
echo "Taşınabilir arşiv oluşturmak için:"
echo "  tar -czf staging_backup_${TIMESTAMP}.tar.gz -C $BACKUPS_DIR staging_full_${TIMESTAMP}"
echo ""
