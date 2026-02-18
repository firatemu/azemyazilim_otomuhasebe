#!/bin/bash
# Otomatik Veritabanı Yedekleme Scripti

# Root kontrolü - root değilse sudo kullan (NOPASSWD ile çalışır)
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

# Yapılandırma
DB_NAME="yedekparca"
DB_USER="yedekparca_user"
BACKUP_DIR="/var/backups/yedekparca"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
LOG_FILE="/var/log/yedekparca-backup.log"

# Eski yedekleri temizle (30 günden eski)
RETENTION_DAYS=30

echo "$(date '+%Y-%m-%d %H:%M:%S') - Yedekleme başlatılıyor..." >> "$LOG_FILE"

# PostgreSQL yedeği al
export PGPASSWORD='yedekparca123'
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE" 2>> "$LOG_FILE"

if [ $? -eq 0 ]; then
    # Yedeklenen dosyayı sıkıştır
    gzip "$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.gz"
    
    # Dosya boyutunu logla
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Yedekleme başarılı: $BACKUP_FILE ($SIZE)" >> "$LOG_FILE"
    
    # Eski yedekleri temizle
    find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $RETENTION_DAYS günden eski yedekler temizlendi" >> "$LOG_FILE"
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - HATA: Yedekleme başarısız!" >> "$LOG_FILE"
    exit 1
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') - Yedekleme tamamlandı" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"

