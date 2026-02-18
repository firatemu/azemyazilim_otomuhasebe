#!/bin/bash

# Root kontrolü - root değilse sudo kullan (NOPASSWD ile çalışır)
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

echo "🛑 Backend durduruluyor..."
pm2 stop all 2>/dev/null || $SUDO pkill -f "node.*nest" || true

echo "🧹 Eski build temizleniyor..."
cd /var/yedekparca/server
rm -rf dist

echo "🔨 Build yapılıyor..."
npm run build

echo "🚀 Backend başlatılıyor..."
pm2 start npm --name "yedekparca-backend" -- run start:prod

echo "✅ Backend yeniden başlatıldı!"
echo ""
echo "📋 Logları görmek için: pm2 logs yedekparca-backend"

