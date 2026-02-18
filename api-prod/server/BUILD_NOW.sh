#!/bin/bash

# Hızlı Build Script - Hızlı Teknoloji Entegrasyonu için
# Bu script backend'i build eder

echo "🚀 Backend build başlatılıyor..."
echo "📁 Çalışma dizini: /var/www/api-stage/server"

cd /var/www/api-stage/server || exit 1

echo ""
echo "📦 1. Dependencies kontrol ediliyor..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️ node_modules bulunamadı, npm install çalıştırılıyor..."
    npm install
else
    echo "   ✅ node_modules mevcut"
fi

echo ""
echo "🔨 2. TypeScript build yapılıyor..."
npm run build

if [ $? -ne 0 ]; then
    echo "   ❌ Build başarısız!"
    exit 1
fi

echo ""
echo "🗄️ 3. Prisma client generate ediliyor..."
npx prisma generate

echo ""
echo "✅ Build tamamlandı!"
echo ""
echo "🔄 Backend'i restart etmek için:"
echo "   pm2 restart api-stage"
echo "   VEYA"
echo "   npm run start:prod"
echo ""
echo "🧪 Test için:"
echo "   curl https://staging-api.otomuhasebe.com/api/hizli/token-status"
echo "   curl https://staging-api.otomuhasebe.com/api/hizli/urn-config"

