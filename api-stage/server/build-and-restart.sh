#!/bin/bash

# Backend Build ve Restart Script
# Bu script backend'i build eder ve restart eder

set -e  # Hata durumunda dur

echo "🔨 Backend build başlatılıyor..."

cd /var/www/api-stage/server

# Node modules kontrolü
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules bulunamadı, npm install çalıştırılıyor..."
    npm install
fi

# Build
echo "🔨 TypeScript build yapılıyor..."
npm run build

# Prisma generate (eğer schema değiştiyse)
echo "🗄️ Prisma client generate ediliyor..."
npx prisma generate

echo "✅ Build tamamlandı!"

# PM2 ile restart (eğer PM2 kullanılıyorsa)
if command -v pm2 &> /dev/null; then
    echo "🔄 PM2 ile restart ediliyor..."
    pm2 restart api-stage || pm2 start dist/src/main.js --name api-stage
    echo "✅ PM2 restart tamamlandı!"
else
    echo "⚠️ PM2 bulunamadı. Manuel restart gerekebilir."
    echo "💡 Backend'i manuel olarak restart etmek için:"
    echo "   cd /var/www/api-stage/server && npm run start:prod"
fi

echo "🎉 Tüm işlemler tamamlandı!"
