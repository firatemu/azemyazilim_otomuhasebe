#!/bin/bash

# Backend'i PM2 ile yeniden başlatma script'i
# Kullanım: ./restart-backend-pm2.sh

set -e

echo "🔄 Backend PM2 ile yeniden başlatılıyor..."

cd /var/www/api-stage/server

# Build yap
echo "🔨 Build yapılıyor..."
npm run build

# PM2 ile restart
echo "🚀 PM2 ile restart ediliyor..."
pm2 restart api-stage

# Durum kontrolü
echo "📊 Durum kontrol ediliyor..."
sleep 3
pm2 status api-stage

# Port kontrolü
if netstat -tlnp 2>/dev/null | grep -q 3020; then
    echo "✅ Backend port 3020'de dinliyor"
else
    echo "❌ Backend port 3020'de dinlemiyor!"
    exit 1
fi

echo "✅ Backend başarıyla yeniden başlatıldı!"
echo ""
echo "📋 Logları görmek için: pm2 logs api-stage"
echo "📊 Durumu görmek için: pm2 status"

