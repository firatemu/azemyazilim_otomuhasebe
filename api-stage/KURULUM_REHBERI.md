# Yedek Parça Otomasyonu - Sunucu Taşıma ve Kurulum Rehberi

Bu rehber, Yedek Parça Otomasyonu sistemini yeni bir sunucuya taşımak ve kurmak için adım adım talimatlar içermektedir.

## 📋 İçindekiler

1. [Sistem Gereksinimleri](#sistem-gereksinimleri)
2. [Bağımlılıkların Kurulumu](#bağımlılıkların-kurulumu)
3. [Proje Dosyalarının Kopyalanması](#proje-dosyalarının-kopyalanması)
4. [Veritabanı Kurulumu](#veritabanı-kurulumu)
5. [Environment Yapılandırması](#environment-yapılandırması)
6. [Bağımlılıkların Yüklenmesi](#bağımlılıkların-yüklenmesi)
7. [Prisma Migration'ları](#prisma-migrationları)
8. [Build İşlemleri](#build-işlemleri)
9. [PM2 ile Servislerin Başlatılması](#pm2-ile-servislerin-başlatılması)
10. [Nginx Yapılandırması](#nginx-yapılandırması)
11. [Güvenlik Ayarları](#güvenlik-ayarları)
12. [Yedekleme Stratejisi](#yedekleme-stratejisi)
13. [Sorun Giderme](#sorun-giderme)

---

## 🖥️ Sistem Gereksinimleri

### Minimum Gereksinimler
- **İşletim Sistemi:** Ubuntu 20.04 LTS veya üzeri (veya Debian tabanlı)
- **RAM:** 4 GB (önerilen: 8 GB)
- **Disk:** 20 GB boş alan
- **CPU:** 2 çekirdek (önerilen: 4 çekirdek)

### Yazılım Gereksinimleri
- **Node.js:** v20.19.5 veya üzeri
- **PostgreSQL:** 14 veya üzeri
- **PM2:** v5.0.0 veya üzeri
- **pnpm:** v10.20.0 (frontend için)
- **npm:** v9.0.0 veya üzeri (backend için)

---

## 📦 Bağımlılıkların Kurulumu

### 1. Sistem Güncellemeleri

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Node.js Kurulumu

```bash
# Node.js 20.x kurulumu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Versiyon kontrolü
node --version  # v20.19.5 veya üzeri olmalı
npm --version
```

### 3. PostgreSQL Kurulumu

```bash
# PostgreSQL kurulumu
sudo apt install postgresql postgresql-contrib -y

# PostgreSQL servisini başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Versiyon kontrolü
psql --version
```

### 4. PM2 Kurulumu

```bash
# PM2 global kurulumu
sudo npm install -g pm2

# PM2 logrotate kurulumu (log yönetimi için)
pm2 install pm2-logrotate

# PM2 startup script (sunucu yeniden başlatıldığında otomatik başlatma)
pm2 startup
# Çıkan komutu çalıştırın (genellikle sudo ile başlar)
```

### 5. pnpm Kurulumu (Frontend için)

```bash
# pnpm global kurulumu
sudo npm install -g pnpm@10.20.0

# Versiyon kontrolü
pnpm --version
```

### 6. Gerekli Sistem Paketleri

```bash
sudo apt install -y build-essential git curl wget
```

---

## 📁 Proje Dosyalarının Kopyalanması

### 1. Proje Klasörünün Oluşturulması

```bash
# Ana proje klasörünü oluştur
sudo mkdir -p /var/yedekparca
sudo chown -R $USER:$USER /var/yedekparca
cd /var/yedekparca
```

### 2. Dosyaların Kopyalanması

Eski sunucudan yeni sunucuya dosyaları kopyalayın:

**Seçenek 1: SCP ile (önerilen)**
```bash
# Eski sunucudan çalıştırın:
scp -r /var/yedekparca/* kullanici@yeni-sunucu-ip:/var/yedekparca/

# Veya sadece gerekli klasörleri:
scp -r /var/yedekparca/server kullanici@yeni-sunucu-ip:/var/yedekparca/
scp -r /var/yedekparca/client kullanici@yeni-sunucu-ip:/var/yedekparca/
scp -r /var/yedekparca/config kullanici@yeni-sunucu-ip:/var/yedekparca/
```

**Seçenek 2: Git ile (eğer repo varsa)**
```bash
cd /var/yedekparca
git clone <repository-url> .
```

**Seçenek 3: Tar arşivi ile**
```bash
# Eski sunucuda:
cd /var
tar -czf yedekparca-backup.tar.gz yedekparca/

# Yeni sunucuda:
cd /var
tar -xzf yedekparca-backup.tar.gz
```

### 3. Klasör Yapısı Kontrolü

```bash
cd /var/yedekparca
ls -la
# Şunlar görünmeli:
# - server/
# - client/
# - config/
# - ecosystem.config.js
```

---

## 🗄️ Veritabanı Kurulumu

### 1. PostgreSQL Kullanıcı ve Veritabanı Oluşturma

```bash
# PostgreSQL'e root olarak giriş yap
sudo -u postgres psql

# PostgreSQL içinde şu komutları çalıştır:
CREATE DATABASE yedekparca;
CREATE USER yedekparca_user WITH PASSWORD 'yedekparca123';
GRANT ALL PRIVILEGES ON DATABASE yedekparca TO yedekparca_user;
ALTER USER yedekparca_user CREATEDB;
\q
```

**⚠️ ÖNEMLİ:** Production ortamında güçlü bir şifre kullanın!

### 2. Veritabanı Yedeğinin İçe Aktarılması

Eski sunucudan veritabanı yedeğini alın:

```bash
# Eski sunucuda:
pg_dump -U yedekparca_user -d yedekparca > yedekparca_backup.sql

# Yeni sunucuda:
psql -U yedekparca_user -d yedekparca < yedekparca_backup.sql
```

**Alternatif: SCP ile aktarma**
```bash
# Eski sunucuda:
pg_dump -U yedekparca_user -d yedekparca > yedekparca_backup.sql

# Yeni sunucuda:
scp kullanici@eski-sunucu-ip:~/yedekparca_backup.sql ./
psql -U yedekparca_user -d yedekparca < yedekparca_backup.sql
```

---

## ⚙️ Environment Yapılandırması

### 1. Backend Environment Dosyası

```bash
cd /var/yedekparca/server
nano .env
```

Aşağıdaki içeriği ekleyin (değerleri kendi ortamınıza göre düzenleyin):

```env
# Database
DATABASE_URL="postgresql://yedekparca_user:yedekparca123@localhost:5432/yedekparca?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"

# JWT - GÜÇLÜ SECRET KEYLERI (Production için yeni oluşturun!)
JWT_ACCESS_SECRET="f54b1ade0bb9e925c2bfe0f2ab3c78150d4b117b0b05e48ad6e46d7b00f93dd27e8f882f787ec607b3fbae780ab647bb481c036f0d43e1c72ce9fe93db3331c2"
JWT_REFRESH_SECRET="39052c57fb05f82d69743f9e7fc527e6373b8cdca49069ca32d4554bf019b5584d96129f2b4be91202a207d3bf3894201e56d16370a23097946b361a49a2f6f1"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# App
PORT=3001
NODE_ENV=production
```

**⚠️ GÜVENLİK UYARISI:** Production ortamında JWT secret'ları mutlaka değiştirin!

```bash
# Yeni JWT secret oluşturma:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Frontend Environment Dosyası

```bash
cd /var/yedekparca/client
nano .env.local
```

Aşağıdaki içeriği ekleyin:

```env
NEXT_PUBLIC_API_URL=/api
```

Production için `.env.production` dosyası:

```bash
nano .env.production
```

```env
NEXT_PUBLIC_API_URL=/api
```

### 3. Config Klasörü Dosyaları

```bash
cd /var/yedekparca/config

# server.env dosyası (backend için)
nano server.env
# Backend .env ile aynı içerik

# client.env.local dosyası (frontend için)
nano client.env.local
# Frontend .env.local ile aynı içerik
```

---

## 📥 Bağımlılıkların Yüklenmesi

### 1. Backend Bağımlılıkları

```bash
cd /var/yedekparca/server

# npm ile bağımlılıkları yükle
npm install

# Prisma Client'ı oluştur
npx prisma generate
```

### 2. Frontend Bağımlılıkları

```bash
cd /var/yedekparca/client

# pnpm ile bağımlılıkları yükle
pnpm install
```

---

## 🔄 Prisma Migration'ları

### 1. Migration Durumunu Kontrol Et

```bash
cd /var/yedekparca/server
npx prisma migrate status
```

### 2. Migration'ları Uygula

Eğer migration'lar uygulanmamışsa:

```bash
# Development ortamında
npx prisma migrate dev

# Production ortamında (önerilen)
npx prisma migrate deploy
```

### 3. Prisma Client'ı Yeniden Oluştur

```bash
npx prisma generate
```

### 4. Veritabanı Şemasını Kontrol Et

```bash
npx prisma db pull  # Veritabanından şemayı çek (opsiyonel)
npx prisma studio   # Veritabanı görsel arayüzü (opsiyonel)
```

---

## 🏗️ Build İşlemleri

### 1. Backend Build

```bash
cd /var/yedekparca/server

# Production build
npm run build

# Build başarılı mı kontrol et
ls -la dist/
```

### 2. Frontend Build

```bash
cd /var/yedekparca/client

# Production build
pnpm run build

# Build başarılı mı kontrol et
ls -la .next/
```

---

## 🚀 PM2 ile Servislerin Başlatılması

### 1. PM2 Ecosystem Config Dosyası

```bash
cd /var/yedekparca
nano ecosystem.config.js
```

İçerik:

```javascript
module.exports = {
  apps: [
    {
      name: 'yedekparca-backend',
      cwd: '/var/yedekparca/server',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        TZ: 'Europe/Istanbul',
      },
      error_file: '/var/log/pm2/yedekparca-backend-error.log',
      out_file: '/var/log/pm2/yedekparca-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
    {
      name: 'yedekparca-frontend',
      cwd: '/var/yedekparca/client',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1.5G',
      env: {
        NODE_ENV: 'production',
        TZ: 'Europe/Istanbul',
        NODE_OPTIONS: '--max-old-space-size=1536',
        NEXT_PRIVATE_STANDALONE: 'true',
      },
      error_file: '/var/log/pm2/yedekparca-frontend-error.log',
      out_file: '/var/log/pm2/yedekparca-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
    },
  ],
};
```

### 2. Log Klasörünü Oluştur

```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

### 3. PM2 ile Servisleri Başlat

```bash
cd /var/yedekparca

# Ecosystem config ile başlat
pm2 start ecosystem.config.js

# Veya manuel olarak:
# Backend
cd /var/yedekparca/server
pm2 start dist/src/main.js --name yedekparca-backend --env production

# Frontend
cd /var/yedekparca/client
pm2 start "node_modules/next/dist/bin/next start -p 3000" --name yedekparca-frontend --env production
```

### 4. PM2 Durumunu Kontrol Et

```bash
pm2 status
pm2 logs
```

### 5. PM2 Servislerini Kaydet

```bash
# PM2 servislerini kaydet (sunucu yeniden başlatıldığında otomatik başlatma)
pm2 save

# Startup script'i oluştur
pm2 startup
# Çıkan komutu çalıştırın
```

### 6. PM2 Komutları

```bash
# Servisleri yeniden başlat
pm2 restart all

# Servisleri durdur
pm2 stop all

# Servisleri sil
pm2 delete all

# Logları görüntüle
pm2 logs yedekparca-backend
pm2 logs yedekparca-frontend

# Monitör
pm2 monit
```

---

## 🌐 Nginx Yapılandırması

### 1. Nginx Kurulumu

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Nginx Yapılandırma Dosyası

```bash
sudo nano /etc/nginx/sites-available/yedekparca
```

İçerik:

```nginx
server {
    listen 80;
    server_name stnoto.com www.stnoto.com;

    # Log dosyaları
    access_log /var/log/nginx/yedekparca-access.log;
    error_log /var/log/nginx/yedekparca-error.log;

    # Client (Frontend) - Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout ayarları
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API (Backend) - NestJS
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout ayarları
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # CORS headers (gerekirse)
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }

    # Uploads klasörü için statik dosya servisi
    location /api/uploads {
        alias /var/yedekparca/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js statik dosyalar
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### 3. Nginx Yapılandırmasını Aktif Et

```bash
# Symbolic link oluştur
sudo ln -s /etc/nginx/sites-available/yedekparca /etc/nginx/sites-enabled/

# Varsayılan yapılandırmayı kaldır (opsiyonel)
sudo rm /etc/nginx/sites-enabled/default

# Nginx yapılandırmasını test et
sudo nginx -t

# Nginx'i yeniden yükle
sudo systemctl reload nginx
```

### 4. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx -y

# SSL sertifikası al
sudo certbot --nginx -d stnoto.com -d www.stnoto.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

---

## 🔒 Güvenlik Ayarları

### 1. Firewall Yapılandırması

```bash
# UFW kurulumu
sudo apt install ufw -y

# Temel kurallar
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Gerekli portları aç
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Firewall'u aktif et
sudo ufw enable

# Durumu kontrol et
sudo ufw status
```

### 2. Dosya İzinleri

```bash
# Proje klasörü izinleri
sudo chown -R $USER:$USER /var/yedekparca
chmod -R 755 /var/yedekparca

# Uploads klasörü yazma izni
chmod -R 775 /var/yedekparca/server/uploads

# Environment dosyalarını koru
chmod 600 /var/yedekparca/server/.env
chmod 600 /var/yedekparca/client/.env.local
```

### 3. PostgreSQL Güvenlik

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Güvenli ayarlar:

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

```bash
sudo systemctl restart postgresql
```

### 4. JWT Secret'ları Değiştirme

Production ortamında mutlaka yeni JWT secret'ları oluşturun:

```bash
# Yeni secret oluştur
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# .env dosyasını güncelle
nano /var/yedekparca/server/.env
```

---

## 💾 Yedekleme Stratejisi

### 1. Veritabanı Yedekleme Scripti

```bash
sudo nano /usr/local/bin/backup-yedekparca.sh
```

İçerik:

```bash
#!/bin/bash
BACKUP_DIR="/var/yedekparca/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="yedekparca"
DB_USER="yedekparca_user"

mkdir -p $BACKUP_DIR

# Veritabanı yedeği
pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Eski yedekleri temizle (7 günden eski)
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Yedekleme tamamlandı: $BACKUP_DIR/db_backup_$DATE.sql"
```

```bash
chmod +x /usr/local/bin/backup-yedekparca.sh
```

### 2. Otomatik Yedekleme (Cron)

```bash
crontab -e
```

Ekleyin:

```
# Her gün saat 02:00'de yedekle
0 2 * * * /usr/local/bin/backup-yedekparca.sh >> /var/log/yedekparca-backup.log 2>&1
```

### 3. Manuel Yedekleme

```bash
# Veritabanı yedeği
pg_dump -U yedekparca_user -d yedekparca > backup_$(date +%Y%m%d_%H%M%S).sql

# Dosya yedeği
tar -czf yedekparca_files_$(date +%Y%m%d_%H%M%S).tar.gz /var/yedekparca/server /var/yedekparca/client
```

---

## 🔧 Sorun Giderme

### 1. Backend Başlamıyor

```bash
# Logları kontrol et
pm2 logs yedekparca-backend

# Manuel başlat
cd /var/yedekparca/server
npm run start:prod

# Port kullanımda mı?
sudo lsof -i :3001
```

### 2. Frontend Başlamıyor

```bash
# Logları kontrol et
pm2 logs yedekparca-frontend

# Manuel başlat
cd /var/yedekparca/client
pnpm run start

# Port kullanımda mı?
sudo lsof -i :3000
```

### 3. Veritabanı Bağlantı Hatası

```bash
# PostgreSQL çalışıyor mu?
sudo systemctl status postgresql

# Bağlantı testi
psql -U yedekparca_user -d yedekparca

# DATABASE_URL kontrolü
cd /var/yedekparca/server
cat .env | grep DATABASE_URL
```

### 4. Prisma Migration Hataları

```bash
cd /var/yedekparca/server

# Migration durumu
npx prisma migrate status

# Migration'ı sıfırla (DİKKAT: Veri kaybı olabilir)
npx prisma migrate reset

# Veya manuel migration
npx prisma migrate deploy
```

### 5. Port Çakışması

```bash
# Port kullanımını kontrol et
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Process'i sonlandır
sudo kill -9 <PID>
```

### 6. PM2 Sorunları

```bash
# PM2'yi temizle
pm2 delete all
pm2 kill

# Yeniden başlat
pm2 start ecosystem.config.js
pm2 save
```

### 7. Nginx Sorunları

```bash
# Yapılandırma testi
sudo nginx -t

# Nginx logları
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/yedekparca-error.log

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

---

## ✅ Kurulum Kontrol Listesi

Kurulumun başarılı olduğunu doğrulamak için:

- [ ] Node.js ve npm kurulu
- [ ] PostgreSQL kurulu ve çalışıyor
- [ ] PM2 kurulu
- [ ] pnpm kurulu
- [ ] Proje dosyaları kopyalandı
- [ ] Veritabanı oluşturuldu ve yedek yüklendi
- [ ] Environment dosyaları yapılandırıldı
- [ ] Backend bağımlılıkları yüklendi
- [ ] Frontend bağımlılıkları yüklendi
- [ ] Prisma migration'ları uygulandı
- [ ] Backend build edildi
- [ ] Frontend build edildi
- [ ] PM2 servisleri başlatıldı
- [ ] Nginx yapılandırıldı
- [ ] SSL sertifikası kuruldu (opsiyonel)
- [ ] Firewall yapılandırıldı
- [ ] Yedekleme scripti oluşturuldu
- [ ] Servisler test edildi

---

## 📞 Destek

Sorun yaşarsanız:

1. PM2 loglarını kontrol edin: `pm2 logs`
2. Nginx loglarını kontrol edin: `sudo tail -f /var/log/nginx/error.log`
3. PostgreSQL loglarını kontrol edin: `sudo tail -f /var/log/postgresql/postgresql-*.log`
4. Sistem loglarını kontrol edin: `journalctl -xe`

---

## 📝 Notlar

- Production ortamında mutlaka güçlü şifreler kullanın
- JWT secret'larını production'da değiştirin
- Düzenli yedekleme yapın
- SSL sertifikası kullanın (HTTPS)
- Firewall kurallarını düzenli kontrol edin
- PM2 loglarını düzenli temizleyin: `pm2 flush`

---

**Son Güncelleme:** 2025-11-15
**Versiyon:** 1.0.0

