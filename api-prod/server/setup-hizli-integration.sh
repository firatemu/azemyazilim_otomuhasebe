#!/bin/bash

echo "=========================================="
echo "🔧 Hızlı Teknoloji Entegrasyonu Kurulumu"
echo "=========================================="
echo ""

cd /var/www/api-stage/server

# 1. Environment Variables kontrolü
echo "📋 1/5 Environment Variables kontrol ediliyor..."
if [ ! -f .env ]; then
    echo "⚠️  .env dosyası bulunamadı!"
    echo "Lütfen .env dosyasına şu değişkenleri ekleyin:"
    echo ""
    echo "HIZLI_API_KEY=9785bcc39536"
    echo "HIZLI_SECRET_KEY=9785bcc3953673cfb92246398b25449ad25e"
    echo "HIZLI_USERNAME=hizlitest"
    echo "HIZLI_PASSWORD=Test.1234"
    echo "HIZLI_WSDL=https://econnecttest.hizliteknoloji.com.tr/Services/HizliService.svc?wsdl"
    echo ""
    read -p "Devam etmek için Enter'a basın..."
else
    echo "✅ .env dosyası bulundu"
    echo "Aşağıdaki değişkenlerin .env dosyasında olduğundan emin olun:"
    echo "- HIZLI_API_KEY"
    echo "- HIZLI_SECRET_KEY"
    echo "- HIZLI_USERNAME"
    echo "- HIZLI_PASSWORD"
    echo "- HIZLI_WSDL"
    echo ""
fi

# 2. NPM Dependencies
echo ""
echo "📦 2/5 NPM dependencies yükleniyor..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install başarısız!"
    exit 1
fi
echo "✅ Dependencies yüklendi"

# 3. Prisma Migration
echo ""
echo "🗄️  3/5 Prisma migration çalıştırılıyor..."

# Önce Prisma client generate
echo "   → Prisma Client generate ediliyor..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma generate başarısız!"
    exit 1
fi

# Migration oluştur
echo "   → Migration oluşturuluyor..."
npx prisma migrate dev --name add_hizli_models --create-only

if [ $? -ne 0 ]; then
    echo "⚠️  Migration oluşturulamadı, manuel migration deneniyor..."
    # Manuel migration
    if [ -f prisma/migrations/create-hizli-models.sql ]; then
        echo "   → Manuel SQL migration çalıştırılıyor..."
        echo "   NOT: Veritabanı bağlantı bilgilerini kontrol edin"
        echo "   Komut: psql -d your_database -f prisma/migrations/create-hizli-models.sql"
    fi
else
    echo "✅ Migration oluşturuldu"
    
    # Migration'ı uygula
    echo "   → Migration uygulanıyor..."
    npx prisma migrate deploy
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Migration deploy başarısız, migrate dev deneniyor..."
        npx prisma migrate dev
    fi
    
    echo "✅ Migration uygulandı"
fi

# 4. Build
echo ""
echo "🔨 4/5 TypeScript build yapılıyor..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız!"
    exit 1
fi
echo "✅ Build tamamlandı"

# 5. Restart PM2
echo ""
echo "🔄 5/5 PM2 restart ediliyor..."
pm2 restart api-stage

if [ $? -ne 0 ]; then
    echo "⚠️  PM2 restart başarısız, manuel restart yapılmalı"
else
    echo "✅ PM2 restart edildi"
fi

echo ""
echo "=========================================="
echo "✅ Kurulum tamamlandı!"
echo "=========================================="
echo ""
echo "🧪 Test Endpoint'leri:"
echo ""
echo "1. Login:"
echo "   curl -X POST http://localhost:3000/api/hizli/login"
echo ""
echo "2. Token Status:"
echo "   curl http://localhost:3000/api/hizli/token-status"
echo ""
echo "3. Incoming Documents:"
echo "   curl http://localhost:3000/api/hizli/incoming"
echo ""
echo "4. Frontend:"
echo "   http://localhost:3001/efatura/gelen"
echo ""
echo "📋 PM2 Logs:"
echo "   pm2 logs api-stage --lines 30"
echo ""

