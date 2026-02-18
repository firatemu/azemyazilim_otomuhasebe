# 🚗 Yedek Parça Otomasyonu - Full-Stack Web Projesi

Modern, hızlı ve responsive bir yedek parça stok ve satış yönetim sistemi.

## 📋 Proje Hakkında

Bu proje, otomotiv yedek parça firmalar için geliştirilmiş kapsamlı bir web tabanlı otomasyon sistemidir. Stok, cari, fatura, tahsilat, kasa, depo, masraf ve raporlama işlemlerini kolayca yönetmenizi sağlar.

## 🧱 Teknoloji Yığını

### Frontend
- **React 19** - Modern UI library
- **Next.js 15** - App Router ile SSR framework
- **Material-UI 5** - UI component library
- **TanStack Table** - Veri tabloları
- **React Query** - Server state yönetimi
- **Zustand** - Client state yönetimi
- **React Hook Form + Zod** - Form yönetimi ve validasyon
- **Axios** - HTTP client
- **Recharts** - Grafik ve raporlama

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - İlişkisel veritabanı
- **JWT** - Access + Refresh token authentication
- **bcrypt** - Şifre hashleme

### DevOps & Deployment
- **Nginx** - Reverse proxy ve web server
- **PM2** - Process manager
- **Ubuntu 22.04 LTS** - İşletim sistemi

## 📦 Kurulum

### Gereksinimler

- Node.js v20+
- pnpm
- PostgreSQL 14+
- Nginx (production için)

### 1. Veritabanı Kurulumu

```bash
# PostgreSQL kurulumu
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Veritabanı ve kullanıcı oluşturma
sudo -u postgres psql -c "CREATE DATABASE yedekparca;"
sudo -u postgres psql -c "CREATE USER yedekparca_user WITH ENCRYPTED PASSWORD 'yedekparca123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE yedekparca TO yedekparca_user;"
sudo -u postgres psql -c "ALTER USER yedekparca_user CREATEDB;"
```

### 2. Backend Kurulumu

```bash
cd /var/yedekparca/server

# Bağımlılıkları yükle
pnpm install

# .env dosyasını yapılandır (zaten mevcut)
# DATABASE_URL, JWT secrets vs.

# Prisma migration
npx prisma migrate dev

# Build
pnpm run build

# Development modda çalıştır
pnpm run start:dev

# Production modda çalıştır
pnpm run start:prod
```

### 3. Frontend Kurulumu

```bash
cd /var/yedekparca/client

# Bağımlılıkları yükle
pnpm install

# .env.local dosyasını yapılandır (zaten mevcut)
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Build
pnpm run build

# Development modda çalıştır
pnpm run dev

# Production modda çalıştır
pnpm run start
```

## 🚀 Production Deployment

### PM2 ile Servis Yönetimi

```bash
# PM2 kurulumu
npm install -g pm2

# Servisleri başlat
cd /var/yedekparca
pm2 start ecosystem.config.js

# Servisleri kaydet
pm2 save

# Sistem başlangıcında otomatik başlat
pm2 startup

# Servis durumunu kontrol et
pm2 status

# Logları görüntüle
pm2 logs

# Servisleri yeniden başlat
pm2 restart all
```

### Nginx Yapılandırması

Nginx config dosyası: `/etc/nginx/sites-available/stnoto.com`

```bash
# Nginx'i test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx

# Nginx durumunu kontrol et
sudo systemctl status nginx
```

### SSL Sertifikası (Certbot ile)

```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx -y

# SSL sertifikası al
sudo certbot --nginx -d stnoto.com -d www.stnoto.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

## 📱 Modüller

### 1. Dashboard
- Özet kartlar (Stok, Cari, Satış, Kâr)
- Satış trend grafikleri
- Aylık karşılaştırma grafikleri

### 2. Stok Yönetimi
- Stok listesi ve arama
- Yeni stok ekleme/düzenleme
- Eşdeğer ürün eşleştirme
- Stok hareketleri

### 3. Cari Yönetimi
- Cari listesi (Müşteri/Tedarikçi)
- Cari ekleme/düzenleme
- Cari hareketleri ve bakiye takibi

### 4. Fatura
- Alış/Satış fatura listesi
- Fatura oluşturma
- Fatura detayları ve kalemler

### 5. Tahsilat
- Tahsilat/Ödeme kayıtları
- Farklı ödeme tipleri (Nakit, Kredi Kartı, Havale, vb.)

### 6. Kasa
- Kasa listesi ve bakiyeler
- Kasa hareketleri

### 7. Depo
- Depo listesi
- Raf yönetimi
- Ürün-Raf eşleştirme

### 8. Masraf
- Masraf listesi
- Kategori yönetimi
- Masraf takibi

### 9. Raporlama
- Stok raporu
- Satış raporu
- Cari raporu
- Excel ve PDF export

### 10. Ayarlar
- Kullanıcı yönetimi
- Genel ayarlar

## 🔐 Kimlik Doğrulama

Sistem JWT tabanlı authentication kullanır:
- **Access Token**: 15 dakika geçerlilik
- **Refresh Token**: 7 gün geçerlilik
- Otomatik token yenileme
- Şifreler bcrypt ile hash'lenir

### İlk Kullanıcı Oluşturma

```bash
cd /var/yedekparca/server

# Prisma Studio'yu aç
npx prisma studio

# Veya psql ile:
sudo -u postgres psql yedekparca
INSERT INTO users (id, email, username, password, "fullName", role, "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'admin@stnoto.com', 'admin', '$2b$10$hashedpassword', 'Admin User', 'ADMIN', true, NOW(), NOW());
```

## 📂 Proje Yapısı

```
/var/yedekparca/
├── server/                 # Backend (NestJS)
│   ├── src/
│   │   ├── modules/       # Backend modülleri
│   │   │   ├── auth/      # Authentication
│   │   │   ├── stok/      # Stok yönetimi
│   │   │   ├── cari/      # Cari yönetimi
│   │   │   ├── fatura/    # Fatura
│   │   │   ├── tahsilat/  # Tahsilat
│   │   │   ├── kasa/      # Kasa
│   │   │   ├── depo/      # Depo
│   │   │   └── masraf/    # Masraf
│   │   ├── common/        # Ortak servisler
│   │   └── prisma/        # Prisma şemaları
│   ├── .env              # Environment variables
│   └── package.json
│
├── client/                # Frontend (Next.js)
│   ├── src/
│   │   ├── app/          # Next.js App Router sayfaları
│   │   ├── components/   # React bileşenleri
│   │   │   └── Layout/   # Layout bileşenleri
│   │   ├── lib/          # Utilities (axios, theme)
│   │   ├── stores/       # Zustand stores
│   │   └── types/        # TypeScript tipleri
│   ├── .env.local        # Environment variables
│   └── package.json
│
├── ecosystem.config.js   # PM2 configuration
└── README.md            # Bu dosya
```

## 🛠️ Geliştirme Komutları

### Backend

```bash
cd /var/yedekparca/server

# Development
pnpm run start:dev

# Build
pnpm run build

# Production
pnpm run start:prod

# Prisma
npx prisma studio          # Database GUI
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate Prisma Client
```

### Frontend

```bash
cd /var/yedekparca/client

# Development
pnpm run dev

# Build
pnpm run build

# Production
pnpm run start

# Lint
pnpm run lint
```

## 🌐 URL'ler

### Development
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Prisma Studio: http://localhost:5555

### Production
- Web: https://stnoto.com
- API: https://stnoto.com/api

## 📊 Veritabanı Şeması

Veritabanı şeması Prisma ORM ile yönetilir. Ana tablolar:

- **users**: Kullanıcılar
- **stoklar**: Stok ürünleri
- **cariler**: Müşteri ve tedarikçiler
- **faturalar**: Fatura kayıtları
- **fatura_kalemleri**: Fatura detayları
- **tahsilatlar**: Tahsilat/Ödeme kayıtları
- **kasalar**: Kasa tanımları
- **depolar**: Depo ve raf bilgileri
- **masraflar**: Masraf kayıtları

## 🔧 Sorun Giderme

### Backend çalışmıyor
```bash
pm2 logs yedekparca-backend
pm2 restart yedekparca-backend
```

### Frontend çalışmıyor
```bash
pm2 logs yedekparca-frontend
pm2 restart yedekparca-frontend
```

### Database bağlantı hatası
```bash
# PostgreSQL durumunu kontrol et
sudo systemctl status postgresql

# Veritabanı erişimini test et
psql -U yedekparca_user -d yedekparca -h localhost
```

### Nginx hatası
```bash
# Nginx durumunu kontrol et
sudo systemctl status nginx

# Nginx config'i test et
sudo nginx -t

# Nginx loglarını kontrol et
sudo tail -f /var/log/nginx/stnoto-error.log
```

## 💾 Yedekleme ve Geri Yükleme

### Tam Sistem Yedeği

**Son Yedek:** `BACKUPS/FULL_BACKUP_20251102_203631`  
**Tarih:** 2 Kasım 2025, 20:36:31  
**Boyut:** 832 KB  
**Durum:** ✅ Hazır

### Yedek İçeriği:
- ✅ Database (PostgreSQL dump)
- ✅ Backend kaynak kodları
- ✅ Frontend kaynak kodları
- ✅ Tüm config dosyaları
- ✅ Dokümantasyon

### Hızlı Geri Yükleme:
```bash
cd /var/yedekparca/BACKUPS/FULL_BACKUP_20251102_203631
sudo ./RESTORE.sh
```

**Detaylı Bilgi:** `BACKUPS/BACKUP_BILGILERI.md`

### Yeni Backup Alma:
```bash
# Manuel backup script'i (yakında eklenecek)
cd /var/yedekparca/scripts
./create-backup.sh
```

---

## 📚 Dokümantasyon

- **FORM-PING-SORUNU-COZUMU.md** - React form performans optimizasyonu
- **BACKUPS/BACKUP_BILGILERI.md** - Yedekleme sistemi bilgileri
- **BACKUPS/FULL_BACKUP_*/README.md** - Backup detayları

---

## 📝 Lisans

Bu proje özel bir projedir ve ticari kullanım için geliştirilmiştir.

## 👨‍💻 Geliştirici

Yedek Parça Otomasyonu - 2025

---

## ⚠️ Production Öncesi Kontrol Listesi

Production ortamda kullanmadan önce:
1. ✅ `.env` dosyalarındaki secret key'leri değiştirin
2. ✅ Güçlü database şifreleri kullanın
3. ✅ SSL sertifikası kurun
4. ✅ Firewall ayarlarını yapın
5. ✅ Düzenli yedekleme stratejisi oluşturun
6. ✅ PM2 loglarını izleyin
7. ✅ Nginx rate limiting ayarlayın
8. ✅ Database backup'larını otomatikleştirin

