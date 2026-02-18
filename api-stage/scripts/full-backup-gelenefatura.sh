#!/bin/bash

# Full Backup Script - Gelen E-Fatura Projesi
# Yedek adı: gelenefatura
# Tarih: $(date +%Y%m%d_%H%M%S)

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Yedek adı
BACKUP_NAME="gelenefatura"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/${BACKUP_NAME}_${TIMESTAMP}"
BACKUP_FILE="${BACKUP_NAME}_${TIMESTAMP}.tar.gz"

echo -e "${GREEN}🚀 Full Backup Başlatılıyor: ${BACKUP_NAME}${NC}"
echo -e "${YELLOW}📁 Yedek klasörü: ${BACKUP_DIR}${NC}"

# Yedek klasörünü oluştur
mkdir -p "${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}/database"
mkdir -p "${BACKUP_DIR}/www"
mkdir -p "${BACKUP_DIR}/yedekparca"
mkdir -p "${BACKUP_DIR}/logs"

# 1. Database Yedeği
echo -e "${GREEN}📊 Database yedeği alınıyor...${NC}"
cd /var/www/api-stage/server

# Prisma database URL'ini kontrol et
if [ -f .env ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

    if [ ! -z "$DATABASE_URL" ]; then
        # PostgreSQL yedeği
        if echo "$DATABASE_URL" | grep -q "postgresql://"; then
            DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
            DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
            DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
            DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
            DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*@[^:]*:\([^\/]*\)\/.*/\1/p')

            echo "PostgreSQL yedeği alınıyor: ${DB_NAME}"
            export PGPASSWORD="${DB_PASS}"
            pg_dump -h "${DB_HOST}" -p "${DB_PORT:-5432}" -U "${DB_USER}" -d "${DB_NAME}" -F c -f "${BACKUP_DIR}/database/${BACKUP_NAME}_database_${TIMESTAMP}.dump" 2>&1 || {
                echo -e "${YELLOW}⚠️  PostgreSQL yedeği alınamadı, devam ediliyor...${NC}"
            }
            unset PGPASSWORD
        # MySQL yedeği
        elif echo "$DATABASE_URL" | grep -q "mysql://"; then
            DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
            DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
            DB_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
            DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
            DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*@[^:]*:\([^\/]*\)\/.*/\1/p')

            echo "MySQL yedeği alınıyor: ${DB_NAME}"
            mysqldump -h "${DB_HOST}" -P "${DB_PORT:-3306}" -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" > "${BACKUP_DIR}/database/${BACKUP_NAME}_database_${TIMESTAMP}.sql" 2>&1 || {
                echo -e "${YELLOW}⚠️  MySQL yedeği alınamadı, devam ediliyor...${NC}"
            }
        fi
    fi
fi

# 2. www Klasörü Yedeği (api-stage ve panel-stage)
echo -e "${GREEN}📦 www klasörü yedeği alınıyor...${NC}"
cd /var

# api-stage yedeği
if [ -d "www/api-stage" ]; then
    echo "  → api-stage yedeği alınıyor..."
    tar -czf "${BACKUP_DIR}/www/api-stage_${TIMESTAMP}.tar.gz" \
        --exclude="www/api-stage/server/node_modules" \
        --exclude="www/api-stage/server/dist" \
        --exclude="www/api-stage/server/.next" \
        --exclude="www/api-stage/server/.cache" \
        --exclude="www/api-stage/server/prisma/migrations" \
        --exclude="www/api-stage/server/*.log" \
        "www/api-stage" 2>&1 || echo -e "${YELLOW}⚠️  api-stage yedeği alınamadı${NC}"
fi

# panel-stage yedeği
if [ -d "www/panel-stage" ]; then
    echo "  → panel-stage yedeği alınıyor..."
    tar -czf "${BACKUP_DIR}/www/panel-stage_${TIMESTAMP}.tar.gz" \
        --exclude="www/panel-stage/client/node_modules" \
        --exclude="www/panel-stage/client/.next" \
        --exclude="www/panel-stage/client/.cache" \
        --exclude="www/panel-stage/client/out" \
        --exclude="www/panel-stage/client/*.log" \
        "www/panel-stage" 2>&1 || echo -e "${YELLOW}⚠️  panel-stage yedeği alınamadı${NC}"
fi

# 3. yedekparca Klasörü Yedeği (eğer varsa)
if [ -d "yedekparca" ]; then
    echo -e "${GREEN}📦 yedekparca klasörü yedeği alınıyor...${NC}"
    tar -czf "${BACKUP_DIR}/yedekparca/yedekparca_${TIMESTAMP}.tar.gz" \
        --exclude="yedekparca/server/node_modules" \
        --exclude="yedekparca/server/dist" \
        --exclude="yedekparca/client/node_modules" \
        --exclude="yedekparca/client/.next" \
        --exclude="yedekparca/BACKUPS" \
        --exclude="yedekparca/*.log" \
        "yedekparca" 2>&1 || echo -e "${YELLOW}⚠️  yedekparca yedeği alınamadı${NC}"
fi

# 4. Log Dosyaları
echo -e "${GREEN}📋 Log dosyaları yedeği alınıyor...${NC}"
if [ -d "/var/log/pm2" ]; then
    cp -r /var/log/pm2 "${BACKUP_DIR}/logs/pm2" 2>&1 || echo -e "${YELLOW}⚠️  PM2 logları kopyalanamadı${NC}"
fi

# 5. Environment Dosyaları
echo -e "${GREEN}🔐 Environment dosyaları yedeği alınıyor...${NC}"
mkdir -p "${BACKUP_DIR}/env"
find /var/www -name ".env*" -type f ! -path "*/node_modules/*" 2>/dev/null | while read env_file; do
    rel_path=$(echo "$env_file" | sed 's|^/var/||')
    mkdir -p "${BACKUP_DIR}/env/$(dirname "$rel_path")"
    cp "$env_file" "${BACKUP_DIR}/env/$rel_path" 2>&1 || true
done

# 6. Yedek Bilgi Dosyası
echo -e "${GREEN}📝 Yedek bilgi dosyası oluşturuluyor...${NC}"
cat > "${BACKUP_DIR}/BACKUP_INFO.txt" << EOF
Yedek Adı: ${BACKUP_NAME}
Tarih: $(date '+%Y-%m-%d %H:%M:%S')
Sunucu: $(hostname)
Kullanıcı: $(whoami)

İçerik:
- Database yedeği (varsa)
- www/api-stage projesi
- www/panel-stage projesi
- yedekparca projesi (varsa)
- PM2 log dosyaları
- Environment dosyaları

Yedek Boyutu: $(du -sh "${BACKUP_DIR}" | cut -f1)

Yedek Klasörü: ${BACKUP_DIR}
EOF

# 7. Tüm yedeği tek bir tar.gz dosyasına sıkıştır
echo -e "${GREEN}🗜️  Yedek sıkıştırılıyor...${NC}"
cd /var/backups
tar -czf "${BACKUP_FILE}" "${BACKUP_NAME}_${TIMESTAMP}" 2>&1

# Yedek boyutunu göster
BACKUP_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo -e "${GREEN}✅ Yedek başarıyla oluşturuldu!${NC}"
echo -e "${GREEN}📦 Yedek dosyası: ${BACKUP_FILE}${NC}"
echo -e "${GREEN}📊 Yedek boyutu: ${BACKUP_SIZE}${NC}"
echo -e "${GREEN}📁 Yedek konumu: /var/backups/${BACKUP_FILE}${NC}"

# Yedek bilgisini logla
echo "$(date '+%Y-%m-%d %H:%M:%S') - Full backup oluşturuldu: ${BACKUP_FILE} (${BACKUP_SIZE})" >> /var/log/backup.log

# Eski klasörü sil (opsiyonel - sadece tar.gz dosyasını tutmak için)
# rm -rf "${BACKUP_DIR}"

echo -e "${GREEN}🎉 Full backup tamamlandı!${NC}"

