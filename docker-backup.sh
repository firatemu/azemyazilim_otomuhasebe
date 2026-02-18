#!/bin/bash
set -e

ENV=${1:-staging}
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/docker"

echo "========================================="
echo "Backup started at: $(date)"
echo "Environment: $ENV"
echo "========================================="

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Step 1: Backing up database..."
docker exec otomuhasebe-postgres pg_dump -U postgres -F c otomuhasebe_$ENV > $BACKUP_DIR/db_backup_$ENV_$DATE.sql 2>/dev/null || \
    echo "Warning: Database backup failed (container might not be running)"

# Uploads backup
echo "Step 2: Backing up uploads..."
if [ -d ./api-stage/server/uploads ]; then
    tar czf $BACKUP_DIR/uploads_$ENV_$DATE.tar.gz ./api-stage/server/uploads
    echo "Uploads backup completed"
else
    echo "Warning: Uploads directory not found"
fi

# Volume backup (data directory)
echo "Step 3: Backing up PostgreSQL volume..."
docker run --rm \
    -v otomuhasebe_postgres_data:/data \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/postgres_volume_$ENV_$DATE.tar.gz -C /data .

echo "========================================="
echo "Backup completed at: $(date)"
echo "Files created:"
ls -lh $BACKUP_DIR/*$ENV_$DATE*
echo "========================================="
