#!/bin/bash
# File Migration Script: Local Storage → MinIO
# This script migrates existing files from local file system to MinIO object storage

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting file migration: Local → MinIO"
echo "============================================"
echo ""

# Check if MinIO is running
if ! curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo "❌ Error: MinIO is not running or not accessible"
    echo "Please start MinIO first: docker-compose up -d minio"
    exit 1
fi

echo "✅ MinIO is running"
echo ""

# Check if uploads directory exists
UPLOAD_DIR="${UPLOAD_DIR:-./uploads}"
if [ ! -d "$UPLOAD_DIR" ]; then
    echo "⚠️  Upload directory not found: $UPLOAD_DIR"
    echo "Creating empty directory..."
    mkdir -p "$UPLOAD_DIR"
fi

# Run migration via ts-node
echo "📦 Running migration script..."
echo ""

cd "$SERVER_DIR"

npx ts-node --transpile-only <<'EOF'
import { PrismaClient } from '@prisma/client';
import { MinIOStorageProvider } from './src/modules/storage/providers/minio-storage.provider';
import { LocalStorageProvider } from './src/modules/storage/providers/local-storage.provider';
import * as fs from 'fs-extra';
import * as path from 'path';

const prisma = new PrismaClient();
const minioProvider = new MinIOStorageProvider();
const localProvider = new LocalStorageProvider();

async function migrate() {
  console.log('🔍 Finding tenants...');

  const tenants = await prisma.tenant.findMany({
    where: { 
      status: { 
        in: ['ACTIVE', 'TRIAL'] 
      } 
    },
  });

  console.log(`Found ${tenants.length} active tenants\n`);

  let totalFiles = 0;
  let totalMigrated = 0;
  let totalErrors = 0;

  for (const tenant of tenants) {
    console.log(`\n📦 Migrating tenant: ${tenant.name} (${tenant.subdomain})`);

    try {
      // List local files
      const localFiles = await localProvider.listFiles({
        tenantId: tenant.id,
      });

      console.log(`  Found ${localFiles.length} files`);
      totalFiles += localFiles.length;

      if (localFiles.length === 0) {
        console.log('  ⏭️  Skipping (no files)');
        continue;
      }

      // Migrate each file
      let migratedCount = 0;
      for (const filePath of localFiles) {
        try {
          const fileBuffer = await fs.readFile(filePath);
          const relativePath = path.relative('./uploads', filePath);
          const parts = relativePath.split(path.sep);
          
          if (parts.length < 3) {
            console.log(`  ⚠️  Skipping invalid path: ${filePath}`);
            continue;
          }

          const [tenantId, folder, ...filenameParts] = parts;
          const filename = filenameParts.join(path.sep);

          // Upload to MinIO
          const objectKey = await minioProvider.uploadFile({
            tenantId: tenant.id,
            file: {
              buffer: fileBuffer,
              originalname: filename,
              mimetype: getMimeType(filename),
              size: fileBuffer.length,
            } as any,
            folder,
          });

          migratedCount++;
          totalMigrated++;

          if (migratedCount % 10 === 0) {
            console.log(`  Progress: ${migratedCount}/${localFiles.length}`);
          }
        } catch (error) {
          console.error(`  ❌ Error migrating ${filePath}:`, error.message);
          totalErrors++;
        }
      }

      console.log(`  ✅ Migrated ${migratedCount} files`);
    } catch (error) {
      console.error(`  ❌ Error processing tenant ${tenant.id}:`, error.message);
      totalErrors++;
    }
  }

  console.log('\n============================================');
  console.log('📊 Migration Summary:');
  console.log(`  Total files found: ${totalFiles}`);
  console.log(`  Successfully migrated: ${totalMigrated}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log('============================================\n');

  await prisma.$disconnect();
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

migrate()
  .then(() => {
    console.log('✅ Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
EOF

echo ""
echo "✅ Migration script completed!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Verify files in MinIO: mc ls local_minio/otomuhasebe"
echo "2. Test file downloads via presigned URLs"
echo "3. Update STORAGE_DRIVER=minio in .env when ready"
echo "4. Keep local files as backup until 100% verified"
