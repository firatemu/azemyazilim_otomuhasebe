#!/bin/bash

# Root kontrolü - root değilse sudo kullan (NOPASSWD ile çalışır)
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

echo "🛑 Backend durduruluyor..."
pm2 stop all

echo "🔧 Prisma generate yapılıyor..."
cd /var/yedekparca/server
npx prisma generate

echo "🧹 Eski build temizleniyor..."
rm -rf dist

echo "🔨 Build yapılıyor..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build başarılı!"
    echo "🚀 Backend başlatılıyor..."
    pm2 start npm --name "yedekparca-backend" -- run start:prod
    echo ""
    echo "✅ Tamamlandı!"
    echo "📋 Logları görmek için: pm2 logs yedekparca-backend"
else
    echo "❌ Build başarısız! Hata loglarını kontrol edin."
    exit 1
fi

