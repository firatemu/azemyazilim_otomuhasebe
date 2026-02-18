#!/bin/bash

# Hızlı Teknoloji endpoint'leri için backend restart script

set -e

echo "🔨 Backend build başlatılıyor..."
cd /var/www/api-stage/server

# Build işlemi
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build başarısız!"
  exit 1
fi

echo "✅ Build başarılı!"

# PM2 ile restart
echo "🔄 PM2 restart ediliyor..."
pm2 restart api-stage || pm2 restart all

echo "✅ Backend restart edildi!"

# Route'ların çalıştığını test et
echo "🧪 Endpoint testleri..."
sleep 3

echo ""
echo "Test ediliyor: GET /api/hizli/token-status"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://staging-api.otomuhasebe.com/api/hizli/token-status || echo "⚠️  Endpoint'e erişilemedi"

echo ""
echo "Test ediliyor: GET /api/hizli/incoming"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://staging-api.otomuhasebe.com/api/hizli/incoming || echo "⚠️  Endpoint'e erişilemedi"

echo ""
echo "✅ Script tamamlandı!"
echo ""
echo "PM2 durumunu kontrol edin: pm2 list"
echo "Backend log'larını görün: pm2 logs api-stage"

