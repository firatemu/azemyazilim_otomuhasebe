#!/bin/bash

# Türkiye İstanbul Timezone Kurulum Script'i
# Bu script veritabanı ve uygulama timezone ayarlarını yapılandırır

echo "=========================================="
echo "Türkiye İstanbul Timezone Kurulumu"
echo "=========================================="

# 1. Sistem timezone'unu kontrol et ve ayarla
echo ""
echo "1. Sistem timezone kontrolü..."
CURRENT_TZ=$(timedatectl | grep "Time zone" | awk '{print $3}')
echo "Mevcut timezone: $CURRENT_TZ"

if [ "$CURRENT_TZ" != "Europe/Istanbul" ]; then
    echo "⚠️  Sistem timezone'u Europe/Istanbul değil!"
    echo "Sistem timezone'unu değiştirmek için:"
    echo "  sudo timedatectl set-timezone Europe/Istanbul"
else
    echo "✅ Sistem timezone'u zaten Europe/Istanbul"
fi

# 2. Node.js timezone ayarı
echo ""
echo "2. Node.js timezone ayarı..."
if [ -z "$TZ" ]; then
    echo "⚠️  TZ environment variable tanımlı değil"
    echo "Ekleyin: export TZ=Europe/Istanbul"
else
    echo "✅ TZ environment variable: $TZ"
fi

# 3. Veritabanı timezone ayarları
echo ""
echo "3. Veritabanı timezone ayarları..."
echo ""
echo "MySQL için:"
echo "  SET GLOBAL time_zone = '+03:00';"
echo "  SET time_zone = '+03:00';"
echo ""
echo "PostgreSQL için:"
echo "  SET timezone = 'Europe/Istanbul';"
echo ""
echo "MongoDB için:"
echo "  MongoDB timezone'u otomatik olarak sistem timezone'unu kullanır"
echo ""

# 4. Mevcut veritabanı verilerini güncelleme
echo "4. Mevcut veritabanı verilerini güncelleme..."
echo ""
echo "⚠️  ÖNEMLİ: Mevcut tarih/saat verilerini güncellemek için:"
echo "   - Veritabanı yedeği alın"
echo "   - Gerekli migration script'lerini çalıştırın"
echo ""

# 5. Environment variable'ları .env dosyasına ekle
echo "5. .env dosyası kontrolü..."
if [ -f "/var/www/panel-prod/client/.env" ]; then
    if ! grep -q "TZ=Europe/Istanbul" "/var/www/panel-prod/client/.env"; then
        echo "TZ=Europe/Istanbul" >> "/var/www/panel-prod/client/.env"
        echo "✅ TZ environment variable .env dosyasına eklendi"
    else
        echo "✅ TZ environment variable zaten .env dosyasında mevcut"
    fi
else
    echo "⚠️  .env dosyası bulunamadı, oluşturuluyor..."
    echo "TZ=Europe/Istanbul" > "/var/www/panel-prod/client/.env"
    echo "✅ .env dosyası oluşturuldu"
fi

echo ""
echo "=========================================="
echo "Kurulum tamamlandı!"
echo "=========================================="
echo ""
echo "Sonraki adımlar:"
echo "1. Sistem timezone'unu ayarlayın (gerekirse)"
echo "2. Veritabanı timezone'unu ayarlayın"
echo "3. Uygulamayı yeniden başlatın"
echo ""

