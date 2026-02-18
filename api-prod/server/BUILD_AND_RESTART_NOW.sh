#!/bin/bash

# Backend Build ve Restart Script
# Bu script backend'i build eder, Prisma generate eder ve restart eder

set -e  # Hata durumunda dur

echo "🚀 Backend Build ve Restart başlatılıyor..."
echo "📁 Çalışma dizini: /var/www/api-stage/server"

cd /var/www/api-stage/server || exit 1

# 1. Dependencies kontrol
echo ""
echo "📦 1. Dependencies kontrol ediliyor..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️ node_modules bulunamadı, npm install çalıştırılıyor..."
    npm install
else
    echo "   ✅ node_modules mevcut"
fi

# 2. Eski build'i temizle (opsiyonel ama önerilir)
echo ""
echo "🗑️  2. Eski build temizleniyor..."
rm -rf dist
echo "   ✅ dist klasörü temizlendi"

# 3. TypeScript build
echo ""
echo "🔨 3. TypeScript build yapılıyor..."
npm run build

if [ $? -ne 0 ]; then
    echo "   ❌ Build başarısız!"
    echo "   💡 Hata detayları için: npm run lint"
    exit 1
fi

echo "   ✅ Build başarılı!"

# 4. Prisma generate
echo ""
echo "🗄️  4. Prisma client generate ediliyor..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "   ⚠️ Prisma generate'de uyarı olabilir, devam ediliyor..."
fi

echo "   ✅ Prisma generate tamamlandı"

# 5. Build dosyalarını kontrol et
echo ""
echo "✅ 5. Build dosyaları kontrol ediliyor..."
if [ -f "dist/src/modules/hizli/hizli.controller.js" ]; then
    echo "   ✅ HizliController build edildi"
else
    echo "   ⚠️ HizliController bulunamadı!"
fi

if [ -f "dist/src/modules/hizli/hizli.service.js" ]; then
    echo "   ✅ HizliService build edildi"
else
    echo "   ⚠️ HizliService bulunamadı!"
fi

# 6. PM2 restart
echo ""
echo "🔄 6. Backend restart ediliyor..."

# PM2 process var mı kontrol et
if command -v pm2 &> /dev/null; then
    # PM2 process listesinde api-stage var mı?
    if pm2 list | grep -q "api-stage"; then
        echo "   🔄 PM2 process 'api-stage' restart ediliyor..."
        pm2 restart api-stage
        echo "   ✅ PM2 restart tamamlandı!"
    else
        echo "   ⚠️ PM2 process 'api-stage' bulunamadı, yeni process başlatılıyor..."
        pm2 start dist/src/main.js --name api-stage
        echo "   ✅ Yeni PM2 process başlatıldı!"
    fi
    
    # PM2 status göster
    echo ""
    echo "📊 PM2 Status:"
    pm2 list
    
    # Son log'ları göster
    echo ""
    echo "📝 Son log'lar (son 10 satır):"
    pm2 logs api-stage --lines 10 --nostream || echo "   Log görüntülenemedi"
else
    echo "   ⚠️ PM2 bulunamadı!"
    echo "   💡 Manuel restart için:"
    echo "      npm run start:prod"
    echo "   VEYA"
    echo "      pm2 start dist/src/main.js --name api-stage"
fi

# 7. Test endpoint'leri
echo ""
echo "🧪 7. Endpoint testleri..."
echo ""
echo "   Test endpoint'lerini kontrol edin:"
echo "   curl https://staging-api.otomuhasebe.com/api/hizli/token-status"
echo "   curl https://staging-api.otomuhasebe.com/api/hizli/incoming"
echo "   curl https://staging-api.otomuhasebe.com/api/hizli/urn-config"
echo ""

echo "🎉 Build ve Restart işlemi tamamlandı!"
echo ""
echo "💡 Notlar:"
echo "   - Backend port: 3020 (staging)"
echo "   - API prefix: /api"
echo "   - Log'ları görmek için: pm2 logs api-stage"
echo "   - Process durumunu görmek için: pm2 list"

