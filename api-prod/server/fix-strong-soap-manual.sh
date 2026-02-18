#!/bin/bash
# Manuel strong-soap Kurulum ve Düzeltme Scripti
# Bu script'i yeni bir SSH bağlantısında çalıştırın

set -e

echo "=========================================="
echo "🔧 strong-soap Modülü Kurulum Scripti"
echo "=========================================="
echo ""

cd /var/www/api-stage/server

echo "📦 1. Takılı npm/node process'lerini sonlandırılıyor..."
pkill -9 npm 2>/dev/null || true
pkill -9 node 2>/dev/null || true
sleep 2

echo "📦 2. PM2 process'lerini kontrol ediliyor..."
pm2 delete api-stage 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 2

echo "📦 3. strong-soap modülü kontrol ediliyor..."
if [ -d "node_modules/strong-soap" ]; then
    echo "✅ strong-soap zaten yüklü"
else
    echo "❌ strong-soap bulunamadı, yükleniyor..."
    npm install strong-soap --save --no-audit --no-fund
fi

echo "📦 4. Tüm dependencies kontrol ediliyor..."
npm install --no-audit --no-fund

echo "📦 5. Build yapılıyor..."
npm run build

echo "📦 6. PM2 başlatılıyor..."
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "=========================================="
echo "✅ İşlem tamamlandı!"
echo "=========================================="
echo ""
echo "🧪 Test:"
echo "   curl http://localhost:3020/api/hizli/token-status"
echo "   pm2 logs api-stage --lines 20"


