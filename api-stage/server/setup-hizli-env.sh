#!/bin/bash

# Hızlı Teknoloji Environment Variables ekleme scripti

ENV_FILE="/var/www/api-stage/server/.env"

echo "=========================================="
echo "🔧 Hızlı Teknoloji Environment Variables"
echo "=========================================="
echo ""

if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env dosyası bulunamadı: $ENV_FILE"
    echo "Lütfen .env dosyasını oluşturun"
    exit 1
fi

# HIZLI değişkenlerini kontrol et
if grep -q "HIZLI_API_KEY" "$ENV_FILE"; then
    echo "✅ HIZLI_API_KEY zaten mevcut"
else
    echo "📝 HIZLI_API_KEY ekleniyor..."
    echo "" >> "$ENV_FILE"
    echo "# Hızlı Teknoloji Entegrasyonu" >> "$ENV_FILE"
    echo "HIZLI_API_KEY=9785bcc39536" >> "$ENV_FILE"
fi

if grep -q "HIZLI_SECRET_KEY" "$ENV_FILE"; then
    echo "✅ HIZLI_SECRET_KEY zaten mevcut"
else
    echo "📝 HIZLI_SECRET_KEY ekleniyor..."
    echo "HIZLI_SECRET_KEY=9785bcc3953673cfb92246398b25449ad25e" >> "$ENV_FILE"
fi

if grep -q "HIZLI_USERNAME" "$ENV_FILE"; then
    echo "✅ HIZLI_USERNAME zaten mevcut"
else
    echo "📝 HIZLI_USERNAME ekleniyor..."
    echo "HIZLI_USERNAME=hizlitest" >> "$ENV_FILE"
fi

if grep -q "HIZLI_PASSWORD" "$ENV_FILE"; then
    echo "✅ HIZLI_PASSWORD zaten mevcut"
else
    echo "📝 HIZLI_PASSWORD ekleniyor..."
    echo "HIZLI_PASSWORD=Test.1234" >> "$ENV_FILE"
fi

if grep -q "HIZLI_WSDL" "$ENV_FILE"; then
    echo "✅ HIZLI_WSDL zaten mevcut"
else
    echo "📝 HIZLI_WSDL ekleniyor..."
    echo "HIZLI_WSDL=https://econnecttest.hizliteknoloji.com.tr/Services/HizliService.svc?wsdl" >> "$ENV_FILE"
fi

echo ""
echo "✅ Environment variables eklendi/güncellendi"
echo ""
echo "📋 Eklenen değişkenler:"
echo "   - HIZLI_API_KEY"
echo "   - HIZLI_SECRET_KEY"
echo "   - HIZLI_USERNAME"
echo "   - HIZLI_PASSWORD"
echo "   - HIZLI_WSDL"
echo ""

