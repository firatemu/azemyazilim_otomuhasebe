#!/bin/bash

# Professional Backup Script for OtoMuhasebe Staging Migration
# This script creates a full backup including SQL, Source Code, and Minio Data

set -e

BACKUP_DIR="/var/www/migration_backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BUNDLE_NAME="otomuhasebe_full_backup_${TIMESTAMP}"
BUNDLE_PATH="${BACKUP_DIR}/${BUNDLE_NAME}"

echo "🚀 Starting Full System Backup..."

# Create backup directory
mkdir -p "${BUNDLE_PATH}"

# 1. Database Dump
echo "🐘 Dumping PostgreSQL database..."
docker exec otomuhasebe-postgres pg_dump -U postgres otomuhasebe_stage > "${BUNDLE_PATH}/database_dump.sql"

# 2. Collect Environment Files
echo "📝 Collecting environment files..."
cp /var/www/.env.staging "${BUNDLE_PATH}/.env.staging"
cp /var/www/docker/compose/docker-compose.base.yml "${BUNDLE_PATH}/"
cp /var/www/docker/compose/docker-compose.staging.dev.yml "${BUNDLE_PATH}/"

# 3. Archive Minio Data (Object Storage)
echo "📦 Archiving Minio data..."
if [ -d "/opt/minio-data" ]; then
    sudo tar -czf "${BUNDLE_PATH}/minio_data.tar.gz" -C /opt/minio-data .
else
    echo "⚠️ Warning: /opt/minio-data not found. Skipping Minio backup."
fi

# 4. Archive Source Code (API & Panel)
echo "💻 Archiving source code (excluding build files)..."

# Use || [ $? -eq 1 ] to ignore "file changed as we read it" warnings
# API Stage
tar -czf "${BUNDLE_PATH}/api-stage_source.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    -C /var/www api-stage || [ $? -eq 1 ]

# Panel Stage (Client part)
tar -czf "${BUNDLE_PATH}/panel-stage-client_source.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    -C /var/www/panel-stage client || [ $? -eq 1 ]

# 5. Include Restore Guide
echo "📖 Including Restoration Guide..."
cp /var/www/RESTORE_GUIDE.md "${BUNDLE_PATH}/"

# 6. Final Compression
echo "📚 Creating final backup bundle..."
cd "${BACKUP_DIR}"
tar -czf "${BUNDLE_NAME}.tar.gz" "${BUNDLE_NAME}"

# 7. Cleanup temporary folder
rm -rf "${BUNDLE_NAME}"

echo "✅ Backup completed successfully!"
echo "📍 Backup file: ${BACKUP_DIR}/${BUNDLE_NAME}.tar.gz"
echo "👉 You can now download this file to your local computer."
