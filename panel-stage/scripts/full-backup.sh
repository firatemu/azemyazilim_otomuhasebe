#!/bin/bash
# Tam Sistem Yedeği Scripti

# Root kontrolü - root değilse sudo kullan (NOPASSWD ile çalışır)
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

# Tarih ve yedek dizini
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="/var/yedekparca/BACKUPS"
BACKUP_DIR="$BACKUP_ROOT/FULL_BACKUP_$BACKUP_DATE"
LOG_FILE="$BACKUP_ROOT/backup_$BACKUP_DATE.log"

# Yedek dizinini oluştur
mkdir -p "$BACKUP_DIR"

echo "════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "🗄️  TAM SUNUCU YEDEKLEMESİ BAŞLATILIYOR" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "📅 Tarih: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "📁 Yedek Dizini: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# 1. Veritabanı Yedeği
echo "1/7 - 🗄️  Veritabanı yedekleniyor..." | tee -a "$LOG_FILE"
export PGPASSWORD='yedekparca123'
pg_dump -U yedekparca_user -h localhost yedekparca > "$BACKUP_DIR/database.sql" 2>> "$LOG_FILE"
if [ $? -eq 0 ]; then
    gzip "$BACKUP_DIR/database.sql"
    DB_SIZE=$(du -h "$BACKUP_DIR/database.sql.gz" | cut -f1)
    echo "   ✅ Veritabanı yedeklendi ($DB_SIZE)" | tee -a "$LOG_FILE"
else
    echo "   ❌ Veritabanı yedeği başarısız!" | tee -a "$LOG_FILE"
fi

# 2. Backend Kaynak Kodları
echo "" | tee -a "$LOG_FILE"
echo "2/7 - 📦 Backend kaynak kodları yedekleniyor..." | tee -a "$LOG_FILE"
tar -czf "$BACKUP_DIR/backend-source.tar.gz" \
    -C /var/yedekparca/server \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.env' \
    . 2>> "$LOG_FILE"
if [ $? -eq 0 ]; then
    BACKEND_SIZE=$(du -h "$BACKUP_DIR/backend-source.tar.gz" | cut -f1)
    echo "   ✅ Backend kaynak kodları yedeklendi ($BACKEND_SIZE)" | tee -a "$LOG_FILE"
else
    echo "   ❌ Backend yedeği başarısız!" | tee -a "$LOG_FILE"
fi

# 3. Frontend Kaynak Kodları
echo "" | tee -a "$LOG_FILE"
echo "3/7 - 🎨 Frontend kaynak kodları yedekleniyor..." | tee -a "$LOG_FILE"
tar -czf "$BACKUP_DIR/frontend-source.tar.gz" \
    -C /var/yedekparca/client \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='build' \
    . 2>> "$LOG_FILE"
if [ $? -eq 0 ]; then
    FRONTEND_SIZE=$(du -h "$BACKUP_DIR/frontend-source.tar.gz" | cut -f1)
    echo "   ✅ Frontend kaynak kodları yedeklendi ($FRONTEND_SIZE)" | tee -a "$LOG_FILE"
else
    echo "   ❌ Frontend yedeği başarısız!" | tee -a "$LOG_FILE"
fi

# 4. Yapılandırma Dosyaları
echo "" | tee -a "$LOG_FILE"
echo "4/7 - ⚙️  Yapılandırma dosyaları yedekleniyor..." | tee -a "$LOG_FILE"
mkdir -p "$BACKUP_DIR/config"

# .env dosyaları
cp /var/yedekparca/server/.env "$BACKUP_DIR/config/server.env" 2>> "$LOG_FILE" || true
cp /var/yedekparca/client/.env.local "$BACKUP_DIR/config/client.env.local" 2>> "$LOG_FILE" || true

# Nginx yapılandırması
$SUDO cp /etc/nginx/sites-available/stnoto "$BACKUP_DIR/config/nginx-stnoto" 2>> "$LOG_FILE" || true

# PM2 ecosystem
cp /var/yedekparca/ecosystem.config.js "$BACKUP_DIR/config/ecosystem.config.js" 2>> "$LOG_FILE" || true

# Scriptler
cp -r /var/yedekparca/scripts "$BACKUP_DIR/config/" 2>> "$LOG_FILE" || true
cp /var/yedekparca/*.sh "$BACKUP_DIR/config/" 2>> "$LOG_FILE" || true

echo "   ✅ Yapılandırma dosyaları yedeklendi" | tee -a "$LOG_FILE"

# 5. Sistem Bilgileri
echo "" | tee -a "$LOG_FILE"
echo "5/7 - 📊 Sistem bilgileri toplaniyor..." | tee -a "$LOG_FILE"
mkdir -p "$BACKUP_DIR/system-info"

# PM2 durumu
pm2 list > "$BACKUP_DIR/system-info/pm2-status.txt" 2>&1
pm2 env 0 > "$BACKUP_DIR/system-info/pm2-env.txt" 2>&1

# Sistem servisleri
$SUDO systemctl status nginx > "$BACKUP_DIR/system-info/nginx-status.txt" 2>&1
$SUDO systemctl status postgresql > "$BACKUP_DIR/system-info/postgresql-status.txt" 2>&1
$SUDO systemctl status fail2ban > "$BACKUP_DIR/system-info/fail2ban-status.txt" 2>&1

# Crontab
crontab -l > "$BACKUP_DIR/system-info/crontab.txt" 2>&1

# Paket listesi
dpkg -l > "$BACKUP_DIR/system-info/installed-packages.txt" 2>&1

# Node ve npm versiyonları
node --version > "$BACKUP_DIR/system-info/node-version.txt" 2>&1
npm --version > "$BACKUP_DIR/system-info/npm-version.txt" 2>&1

# Sistem bilgileri
uname -a > "$BACKUP_DIR/system-info/system-info.txt"
cat /etc/os-release >> "$BACKUP_DIR/system-info/system-info.txt"

echo "   ✅ Sistem bilgileri toplandı" | tee -a "$LOG_FILE"

# 6. SSL Sertifikaları (varsa)
echo "" | tee -a "$LOG_FILE"
echo "6/7 - 🔐 SSL sertifikaları yedekleniyor..." | tee -a "$LOG_FILE"
if [ -d "/etc/letsencrypt" ]; then
    $SUDO tar -czf "$BACKUP_DIR/letsencrypt-backup.tar.gz" -C /etc letsencrypt 2>> "$LOG_FILE"
    if [ $? -eq 0 ]; then
        SSL_SIZE=$(du -h "$BACKUP_DIR/letsencrypt-backup.tar.gz" | cut -f1)
        echo "   ✅ SSL sertifikaları yedeklendi ($SSL_SIZE)" | tee -a "$LOG_FILE"
    else
        echo "   ⚠️  SSL sertifikaları yedeklenemedi" | tee -a "$LOG_FILE"
    fi
else
    echo "   ℹ️  SSL sertifikası bulunamadı" | tee -a "$LOG_FILE"
fi

# 7. Yedek Bilgi Dosyası Oluştur
echo "" | tee -a "$LOG_FILE"
echo "7/7 - 📝 Yedek bilgi dosyası oluşturuluyor..." | tee -a "$LOG_FILE"

cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
═══════════════════════════════════════════════════════════
🗄️  YEDEK PARÇA OTOMASYONU - TAM SUNUCU YEDEĞİ
═══════════════════════════════════════════════════════════

📅 Yedekleme Tarihi: $(date '+%Y-%m-%d %H:%M:%S')
🖥️  Sunucu: $(hostname)
💾 İşletim Sistemi: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)
📦 Node Versiyonu: $(node --version)
🔧 npm Versiyonu: $(npm --version)

═══════════════════════════════════════════════════════════
📦 YEDEK İÇERİĞİ
═══════════════════════════════════════════════════════════

✅ Veritabanı (PostgreSQL)
   - database.sql.gz

✅ Backend Kaynak Kodları
   - backend-source.tar.gz
   - node_modules hariç

✅ Frontend Kaynak Kodları  
   - frontend-source.tar.gz
   - node_modules hariç

✅ Yapılandırma Dosyaları
   - .env dosyaları
   - Nginx yapılandırması
   - PM2 ecosystem
   - Tüm scriptler

✅ SSL Sertifikaları
   - Let's Encrypt sertifikaları (varsa)

✅ Sistem Bilgileri
   - PM2 durumu
   - Servis durumları
   - Crontab
   - Kurulu paketler listesi

═══════════════════════════════════════════════════════════
🔧 GERİ YÜKLEME TALİMATLARI
═══════════════════════════════════════════════════════════

1. Veritabanını Geri Yükle:
   gunzip -c database.sql.gz | psql -U yedekparca_user -d yedekparca

2. Backend'i Geri Yükle:
   tar -xzf backend-source.tar.gz -C /var/yedekparca/server/
   cd /var/yedekparca/server
   npm install
   npm run build

3. Frontend'i Geri Yükle:
   tar -xzf frontend-source.tar.gz -C /var/yedekparca/client/
   cd /var/yedekparca/client
   npm install
   npm run build

4. Yapılandırmaları Geri Yükle:
   cp config/server.env /var/yedekparca/server/.env
   cp config/client.env.local /var/yedekparca/client/.env.local
   sudo cp config/nginx-stnoto /etc/nginx/sites-available/stnoto
   sudo nginx -t && sudo systemctl reload nginx

5. SSL Sertifikalarını Geri Yükle (varsa):
   sudo tar -xzf letsencrypt-backup.tar.gz -C /etc/

6. Servisleri Başlat:
   pm2 restart all

═══════════════════════════════════════════════════════════
📞 DESTEK
═══════════════════════════════════════════════════════════

Yedek Tarihi: $BACKUP_DATE
Yedek Konumu: $BACKUP_DIR

EOF

echo "   ✅ Bilgi dosyası oluşturuldu" | tee -a "$LOG_FILE"

# Yedek boyutunu hesapla
echo "" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "✅ YEDEKLEME TAMAMLANDI!" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "📊 Yedek Özeti:" | tee -a "$LOG_FILE"
echo "   📁 Konum: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "   💾 Toplam Boyut: $TOTAL_SIZE" | tee -a "$LOG_FILE"
echo "   📋 Log Dosyası: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "📋 Yedek İçeriği:" | tee -a "$LOG_FILE"
ls -lh "$BACKUP_DIR" | tail -n +2 | awk '{printf "   %s  %s\n", $5, $9}' | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "📝 Detaylı bilgi için: $BACKUP_DIR/BACKUP_INFO.txt" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

exit 0

