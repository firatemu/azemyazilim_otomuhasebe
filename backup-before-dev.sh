#!/bin/bash
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/manual/backup_$TIMESTAMP"
CODE_BACKUP_FILE="$BACKUP_DIR/code_backup.tar.gz"
DB_BACKUP_DIR="$BACKUP_DIR/databases"

# Create directories
mkdir -p "$DB_BACKUP_DIR"

echo "=========================================="
echo "Full Backup Started: $TIMESTAMP"
echo "Backup Directory: $BACKUP_DIR"
echo "=========================================="

# 1. Database Backups
echo "Step 1: Backing up databases..."
DATABASES=("otomuhasebe_stage" "otomuhasebe_prod" "postgres")

for db in "${DATABASES[@]}"; do
    echo "Backing up $db..."
    docker exec otomuhasebe-postgres pg_dump -U postgres -F c "$db" > "$DB_BACKUP_DIR/$db.sql.dump" 2>/dev/null || \
        echo "Warning: Database $db backup failed (might not exist or container issue)"
done

# 2. Code Backup
echo "Step 2: Backing up project codes (/var/www)..."
# Excluding patterns to reduce size
EXCLUDES=(
    "--exclude=node_modules"
    "--exclude=.next"
    "--exclude=dist"
    "--exclude=build"
    "--exclude=.git"
    "--exclude=*.log"
    "--exclude=tmp"
    "--exclude=.cache"
)

tar czf "$CODE_BACKUP_FILE" "${EXCLUDES[@]}" -C /var/www .

echo "=========================================="
echo "Backup Completed Successfully!"
echo "Location: $BACKUP_DIR"
echo "Sizes:"
du -sh "$BACKUP_DIR"/*
echo "Total Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo "=========================================="
