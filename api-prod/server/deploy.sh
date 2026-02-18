#!/bin/bash
# Staging API Deployment Script
# Kalıcı çözüm için ecosystem.config.js kullanılır

set -e

echo "=== Staging API Deployment ==="
echo "Tarih: $(date)"
echo ""

cd /var/www/api-stage/server

echo "1. Building API..."
npm run build

echo ""
echo "2. Running Prisma migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma || true

echo ""
echo "3. Generating Prisma Client..."
npx prisma generate

echo ""
echo "4. Restarting PM2 process..."
pm2 delete api-stage 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "5. Checking status..."
sleep 3
pm2 list | grep -E "api-stage|App name" || true

echo ""
echo "6. Testing API..."
sleep 2
if curl -s http://localhost:3001/api/cari 2>&1 | grep -q "statusCode"; then
    echo "✅ API is responding"
else
    echo "❌ API not responding"
    pm2 logs api-stage --lines 20 --nostream
    exit 1
fi

echo ""
echo "=== Deployment Completed ==="
echo "API URL: http://localhost:3001"
echo "PM2 Status: pm2 status"
echo "PM2 Logs: pm2 logs api-stage"
