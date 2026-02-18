#!/bin/bash

# Tüm migration işlemlerini çalıştıran script

set -e

echo "🚀 Migration işlemleri başlatılıyor..."
echo ""

cd "$(dirname "$0")"

echo "📋 1. Migration script'i çalıştırılıyor..."
node apply-hizli-token-migration.js

echo ""
echo "⚙️  2. Prisma Client generate ediliyor..."
npx prisma generate

echo ""
echo "📊 3. Migration durumu kontrol ediliyor..."
npx prisma migrate status || echo "⚠️  migrate status komutu çalıştırılamadı"

echo ""
echo "✅ Tüm işlemler tamamlandı!"
echo ""
echo "🔄 Backend server'ı yeniden başlatmanız gerekiyor:"
echo "   pm2 restart all"
echo "   veya"
echo "   npm run start:prod"

