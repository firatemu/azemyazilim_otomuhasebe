#!/bin/bash

echo "=========================================="
echo "🔧 Hizli Modülü Build ve Restart"
echo "=========================================="
echo ""

cd /var/www/api-stage/server

echo "[1/3] TypeScript build başlatılıyor..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız!"
    exit 1
fi

echo ""
echo "[2/3] Build kontrolü..."
if [ -f "dist/src/modules/hizli/hizli.controller.js" ]; then
    echo "✅ HizliController build edildi"
else
    echo "❌ HizliController bulunamadı!"
    exit 1
fi

if [ -f "dist/src/modules/hizli/hizli.service.js" ]; then
    echo "✅ HizliService build edildi"
else
    echo "❌ HizliService bulunamadı!"
    exit 1
fi

echo ""
echo "[3/3] PM2 restart ediliyor..."
pm2 restart api-stage

if [ $? -ne 0 ]; then
    echo "❌ PM2 restart başarısız!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ İşlem tamamlandı!"
echo "=========================================="
echo ""
echo "🧪 Test:"
echo "curl http://localhost:3020/api/hizli/token-status"
echo "curl http://localhost:3020/api/hizli/incoming"
echo ""

