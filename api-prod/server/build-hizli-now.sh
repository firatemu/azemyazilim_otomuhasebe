#!/bin/bash

echo "=========================================="
echo "Hizli Modülü Build ve Restart"
echo "=========================================="
echo ""

cd /var/www/api-stage/server

echo "[1/4] TypeScript build başlatılıyor..."
echo "NOT: Build işlemi 1-2 dakika sürebilir..."
npm run build > /tmp/build-hizli.log 2>&1 &
BUILD_PID=$!

echo "Build PID: $BUILD_PID"
echo "Log dosyası: /tmp/build-hizli.log"
echo ""
echo "Build işlemi arka planda çalışıyor..."
echo "İlerlemeyi görmek için: tail -f /tmp/build-hizli.log"
echo ""

# Build'in bitmesini bekle
wait $BUILD_PID
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo "❌ Build başarısız!"
    echo "Son 20 satır:"
    tail -20 /tmp/build-hizli.log
    exit 1
fi

echo "[2/4] Build kontrolü..."
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

if [ -f "dist/src/modules/hizli/hizli.module.js" ]; then
    echo "✅ HizliModule build edildi"
else
    echo "❌ HizliModule bulunamadı!"
    exit 1
fi

echo ""
echo "[3/4] PM2 restart ediliyor..."
pm2 restart api-stage

if [ $? -ne 0 ]; then
    echo "❌ PM2 restart başarısız!"
    exit 1
fi

echo ""
echo "[4/4] Servis durumu kontrol ediliyor..."
sleep 3
pm2 list | grep api-stage

echo ""
echo "=========================================="
echo "✅ İşlem tamamlandı!"
echo "=========================================="
echo ""
echo "🧪 Test:"
echo "curl http://localhost:3020/api/hizli/token-status"
echo "curl http://localhost:3020/api/hizli/incoming"
echo ""

