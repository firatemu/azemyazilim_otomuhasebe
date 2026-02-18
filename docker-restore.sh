#!/bin/bash
set -e

ENV=${1:-staging}
BACKUP_FILE=$2

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <environment> <backup_file>"
    echo "Example: $0 staging /var/backups/docker/db_backup_staging_20240113_120000.sql"
    exit 1
fi

echo "========================================="
echo "Restoring backup: $BACKUP_FILE"
echo "Environment: $ENV"
echo "========================================="

# Restore database
echo "Restoring database..."
docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_$ENV < $BACKUP_FILE

echo "========================================="
echo "Restore completed at: $(date)"
echo "========================================="
