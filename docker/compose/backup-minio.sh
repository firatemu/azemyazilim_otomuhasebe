#!/bin/bash
# Simplified backup script that works inside Docker container
# Run this script via cron or manually

set -e

BACKUP_DIR="${BACKUP_DIR:-/opt/minio-backups}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$DATE"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

echo "🔄 Starting MinIO backup: $DATE"
echo "============================================"

# Create backup directory
mkdir -p "$BACKUP_PATH"

# Use docker exec to run mc commands inside MinIO container
echo "📦 Mirroring bucket to backup..."

# Create alias inside container
docker exec otomuhasebe-minio mc alias set backup http://localhost:9000 minioadmin minioadmin123 --api S3v4 2>/dev/null || true

# Create temp directory inside container
docker exec otomuhasebe-minio mkdir -p /tmp/backup-$DATE

# Mirror bucket to /tmp inside container
docker exec otomuhasebe-minio mc mirror --overwrite myminio/otomuhasebe /tmp/backup-$DATE/

# Copy backup from container to host
docker cp otomuhasebe-minio:/tmp/backup-$DATE "$BACKUP_PATH/otomuhasebe"

# Cleanup temp backup in container
docker exec otomuhasebe-minio rm -rf /tmp/backup-$DATE

# Get backup size
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)

echo "✅ Backup complete: $BACKUP_PATH ($BACKUP_SIZE)"

# Cleanup old backups
echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true

# List current backups
echo ""
echo "📊 Available backups:"
ls -lht "$BACKUP_DIR" | head -10

echo ""
echo "✅ Backup process completed successfully"
echo "Backup location: $BACKUP_PATH"
