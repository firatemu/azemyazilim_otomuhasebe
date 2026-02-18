#!/bin/bash

echo "=========================================="
echo "🔍 Build Durumu Kontrolü"
echo "=========================================="
echo ""

if [ -f /var/www/api-stage/server/dist/src/modules/hizli/hizli.service.js ]; then
    echo "✅ HizliService build edilmiş"
    echo ""
    echo "📦 Build dosyaları:"
    ls -lh /var/www/api-stage/server/dist/src/modules/hizli/*.js 2>/dev/null | awk '{print $9, "(" $5 ")"}'
    echo ""
    echo "🔄 PM2 restart ediliyor..."
    pm2 restart api-stage
    sleep 3
    echo ""
    echo "🧪 Test:"
    curl -s http://localhost:3020/api/hizli/token-status | head -3
else
    echo "⏳ Build henüz tamamlanmamış"
    echo ""
    echo "📋 Son build logları:"
    tail -20 /tmp/build-hizli-final.log 2>/dev/null || echo "Log bulunamadı"
    echo ""
    echo "💡 Build işlemi devam ediyor olabilir. Biraz bekleyip tekrar çalıştırın."
fi

echo ""
echo "=========================================="

