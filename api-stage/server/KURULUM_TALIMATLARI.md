# 🚀 Hızlı Teknoloji Entegrasyonu - Kurulum Talimatları

## ✅ Tüm Dosyalar Hazır!

Entegrasyon tamamlandı. Şimdi kurulum adımlarını takip edin.

## 📋 Kurulum Adımları

### 1. Environment Variables Ekle

```bash
cd /var/www/api-stage/server

# Otomatik ekleme
npm run setup:hizli:env

# VEYA manuel olarak .env dosyasına ekle:
```

`.env` dosyasına şu satırları ekleyin:

```env
# Hızlı Teknoloji Entegrasyonu
HIZLI_API_KEY=9785bcc39536
HIZLI_SECRET_KEY=9785bcc3953673cfb92246398b25449ad25e
HIZLI_USERNAME=hizlitest
HIZLI_PASSWORD=Test.1234
HIZLI_WSDL=https://econnecttest.hizliteknoloji.com.tr/Services/HizliService.svc?wsdl

# PK ve GB URN değerleri (opsiyonel - default değerler kullanılır)
HIZLI_GB_URN=urn:mail:defaultgb@hizlibilisimteknolojileri.net
HIZLI_PK_URN=urn:mail:defaultpk@hizlibilisimteknolojileri.net
```

### 2. Tüm Kurulumu Çalıştır

```bash
cd /var/www/api-stage/server

# Otomatik kurulum (tüm adımlar)
npm run setup:hizli:full
```

Bu komut şunları yapar:
1. ✅ Environment variables kontrolü
2. ✅ NPM dependencies yükleme
3. ✅ Prisma generate
4. ✅ Migration uygulama
5. ✅ Build
6. ✅ PM2 restart

### 3. VEYA Manuel Kurulum

```bash
cd /var/www/api-stage/server

# 1. Dependencies
npm install

# 2. Prisma Client
npx prisma generate

# 3. Migration
npx prisma migrate deploy
# veya
npx prisma migrate dev --name add_hizli_models

# 4. Build
npm run build

# 5. Restart
pm2 restart api-stage
```

## 🧪 Test

### Backend API Test

```bash
# 1. Login
curl -X POST http://localhost:3000/api/hizli/login

# 2. Token Status
curl http://localhost:3000/api/hizli/token-status

# 3. Incoming Documents
curl http://localhost:3000/api/hizli/incoming
```

### Frontend Test

Tarayıcıda açın:
```
http://localhost:3001/efatura/gelen
```

## 📝 Önemli Notlar

1. **Migration**: İlk kurulumda mutlaka çalıştırın
2. **Environment Variables**: Tüm HIZLI_* değişkenleri gerekli
3. **Cron Job**: Her 12 saatte bir otomatik token yenileme
4. **LoginHash**: 3 gün geçerli, otomatik yenilenir
5. **Token**: 3 gün geçerli, otomatik yenilenir

## 🔍 Sorun Giderme

### Migration Hatası
```bash
# Manuel SQL migration
psql -d your_database -f prisma/migrations/create-hizli-models.sql
```

### Build Hatası
```bash
npm run build 2>&1 | grep error
```

### PM2 Restart Hatası
```bash
pm2 status
pm2 logs api-stage --lines 50
```

## ✅ Kurulum Tamamlandı!

Kurulum script'lerini çalıştırdıktan sonra sistem hazır olacaktır.

