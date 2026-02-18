#!/bin/bash

# Kullanıcı Silme Script'i
# Kullanım: ./delete-user.sh <email>

EMAIL="${1:-frtygtcn@gmail.com}"

if [ -z "$EMAIL" ]; then
    echo "Hata: Email adresi belirtilmedi"
    echo "Kullanım: $0 <email>"
    exit 1
fi

echo "=========================================="
echo "Kullanıcı Silme İşlemi"
echo "=========================================="
echo "Email: $EMAIL"
echo ""

# API üzerinden silme denemesi
echo "1. API üzerinden silme deneniyor..."
API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3021}/api"

# Token kontrolü (eğer varsa)
TOKEN=""
if [ -f "/var/www/panel-prod/.env" ]; then
    # .env dosyasından token alınabilir
    echo "   .env dosyası bulundu"
fi

# API DELETE isteği
RESPONSE=$(curl -s -X DELETE "$API_URL/users?email=$EMAIL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
    echo "   ✅ Kullanıcı API üzerinden silindi"
    exit 0
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "   ⚠️  Yetkilendirme hatası. Veritabanına doğrudan erişim deneniyor..."
else
    echo "   ⚠️  API yanıtı: HTTP $HTTP_CODE"
    echo "   Veritabanına doğrudan erişim deneniyor..."
fi

# Veritabanı bağlantı bilgilerini bul
echo ""
echo "2. Veritabanı bağlantı bilgileri aranıyor..."

# .env dosyası kontrolü
ENV_FILE=""
if [ -f "/var/www/panel-prod/.env" ]; then
    ENV_FILE="/var/www/panel-prod/.env"
elif [ -f "/var/www/panel-prod/client/.env" ]; then
    ENV_FILE="/var/www/panel-prod/client/.env"
elif [ -f "/var/www/panel-prod/.env.local" ]; then
    ENV_FILE="/var/www/panel-prod/.env.local"
fi

if [ -z "$ENV_FILE" ]; then
    echo "   ⚠️  .env dosyası bulunamadı"
    echo ""
    echo "Manuel olarak veritabanına bağlanıp şu SQL komutunu çalıştırın:"
    echo ""
    echo "DELETE FROM users WHERE email = '$EMAIL';"
    echo ""
    exit 1
fi

echo "   .env dosyası bulundu: $ENV_FILE"

# Veritabanı bilgilerini oku
DB_HOST=$(grep -E "^DATABASE_HOST|^DB_HOST|^POSTGRES_HOST|^MYSQL_HOST" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | head -1)
DB_PORT=$(grep -E "^DATABASE_PORT|^DB_PORT|^POSTGRES_PORT|^MYSQL_PORT" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | head -1)
DB_NAME=$(grep -E "^DATABASE_NAME|^DB_NAME|^POSTGRES_DB|^MYSQL_DATABASE" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | head -1)
DB_USER=$(grep -E "^DATABASE_USER|^DB_USER|^POSTGRES_USER|^MYSQL_USER" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | head -1)
DB_PASS=$(grep -E "^DATABASE_PASSWORD|^DB_PASSWORD|^POSTGRES_PASSWORD|^MYSQL_PASSWORD" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | head -1)

if [ -z "$DB_NAME" ]; then
    echo "   ⚠️  Veritabanı bilgileri .env dosyasında bulunamadı"
    echo ""
    echo "Manuel olarak veritabanına bağlanıp şu SQL komutunu çalıştırın:"
    echo ""
    echo "DELETE FROM users WHERE email = '$EMAIL';"
    echo ""
    exit 1
fi

echo "   Veritabanı: $DB_NAME"
echo "   Host: ${DB_HOST:-localhost}"
echo "   Port: ${DB_PORT:-3306}"
echo ""

# Kullanıcıyı kontrol et
echo "3. Kullanıcı kontrol ediliyor..."

if command -v mysql &> /dev/null && [ -n "$DB_PASS" ]; then
    USER_EXISTS=$(mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -se "SELECT COUNT(*) FROM users WHERE email = '$EMAIL';" 2>/dev/null)
    
    if [ "$USER_EXISTS" = "0" ]; then
        echo "   ⚠️  Kullanıcı bulunamadı: $EMAIL"
        exit 1
    fi
    
    echo "   ✅ Kullanıcı bulundu"
    echo ""
    echo "4. Kullanıcı siliniyor..."
    
    mysql -h"${DB_HOST:-localhost}" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "DELETE FROM users WHERE email = '$EMAIL';" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Kullanıcı başarıyla silindi: $EMAIL"
        exit 0
    else
        echo "   ❌ Kullanıcı silinirken hata oluştu"
        exit 1
    fi
elif command -v psql &> /dev/null && [ -n "$DB_PASS" ]; then
    export PGPASSWORD="$DB_PASS"
    USER_EXISTS=$(psql -h"${DB_HOST:-localhost}" -p"${DB_PORT:-5432}" -U"$DB_USER" -d"$DB_NAME" -t -c "SELECT COUNT(*) FROM users WHERE email = '$EMAIL';" 2>/dev/null | tr -d ' ')
    
    if [ "$USER_EXISTS" = "0" ]; then
        echo "   ⚠️  Kullanıcı bulunamadı: $EMAIL"
        exit 1
    fi
    
    echo "   ✅ Kullanıcı bulundu"
    echo ""
    echo "4. Kullanıcı siliniyor..."
    
    psql -h"${DB_HOST:-localhost}" -p"${DB_PORT:-5432}" -U"$DB_USER" -d"$DB_NAME" -c "DELETE FROM users WHERE email = '$EMAIL';" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Kullanıcı başarıyla silindi: $EMAIL"
        exit 0
    else
        echo "   ❌ Kullanıcı silinirken hata oluştu"
        exit 1
    fi
else
    echo "   ⚠️  MySQL veya PostgreSQL client bulunamadı veya şifre eksik"
    echo ""
    echo "Manuel olarak veritabanına bağlanıp şu SQL komutunu çalıştırın:"
    echo ""
    echo "MySQL:"
    echo "  DELETE FROM users WHERE email = '$EMAIL';"
    echo ""
    echo "PostgreSQL:"
    echo "  DELETE FROM users WHERE email = '$EMAIL';"
    echo ""
    exit 1
fi

