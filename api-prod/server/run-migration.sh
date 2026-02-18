#!/bin/bash

# Prisma Migration Script
# Bu script HizliToken tablosunu oluşturmak için migration çalıştırır

set -e

echo "🚀 Prisma Migration başlatılıyor..."

cd /var/www/api-stage/server

echo "📋 1. Migration durumu kontrol ediliyor..."
npx prisma migrate status || true

echo "📝 2. Migration oluşturuluyor..."
npx prisma migrate dev --name add_hizli_token --create-only || {
    echo "⚠️ Migration oluşturulamadı, mevcut migration'lar kontrol ediliyor..."
}

echo "🔄 3. Migration uygulanıyor..."
npx prisma migrate deploy || {
    echo "⚠️ migrate deploy başarısız, migrate dev deneniyor..."
    npx prisma migrate dev --name add_hizli_token || {
        echo "❌ Migration başarısız!"
        exit 1
    }
}

echo "⚙️ 4. Prisma Client generate ediliyor..."
npx prisma generate

echo "✅ Migration tamamlandı!"
echo ""
echo "📊 Migration durumu:"
npx prisma migrate status

echo ""
echo "🎉 Tüm işlemler başarıyla tamamlandı!"

