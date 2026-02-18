# Hızlı Teknoloji SOAP Entegrasyonu - Kurulum Özeti

## ✅ Tamamlanan Görevler

### Backend
- ✅ Prisma Schema güncellendi (hizliToken, efaturaInbox modelleri)
- ✅ encrypt-login.ts utility (SHA256 → Base64 algoritması)
- ✅ soap-client.ts (SOAP client servisi)
- ✅ hizli.service.ts (login, getValidToken, getIncomingEFatura)
- ✅ hizli.controller.ts (POST /login, GET /incoming, GET /token-status)
- ✅ hizli.cron.ts (Her 12 saatte token yenileme)
- ✅ hizli.module.ts (NestJS modülü)
- ✅ AppModule'a HizliModule eklendi

### Frontend
- ✅ /app/efatura/gelen/page.tsx (Ana sayfa)
- ✅ /components/efatura/IncomingGrid.tsx (MUI DataGrid)
- ✅ /components/efatura/XmlModal.tsx (XML görüntüleme modal)
- ✅ /app/api/hizli/incoming/route.ts (Next.js API route)
- ✅ /app/api/hizli/token-status/route.ts (Token durumu API route)

### Package Dependencies
- ✅ strong-soap eklendi
- ✅ xml2js eklendi
- ✅ @nestjs/schedule eklendi
- ✅ @types/xml2js eklendi

## 📋 Yapılması Gerekenler

### 1. Database Migration
```bash
cd /var/www/api-stage/server
npx prisma migrate dev --name add_hizli_models
# veya manuel migration:
psql -d your_database -f prisma/migrations/create-hizli-models.sql
```

### 2. Environment Variables (.env)
Aşağıdaki değerleri `.env` dosyasına ekleyin:
```env
HIZLI_API_KEY=9785bcc39536
HIZLI_SECRET_KEY=9785bcc3953673cfb92246398b25449ad25e
HIZLI_USERNAME=hizlitest
HIZLI_PASSWORD=Test.1234
HIZLI_WSDL=https://econnecttest.hizliteknoloji.com.tr/Services/HizliService.svc?wsdl
```

### 3. NPM Install
```bash
# Backend
cd /var/www/api-stage/server
npm install

# Frontend (gerekirse)
cd /var/www/panel-stage/client
npm install
```

### 4. Build & Restart
```bash
# Backend build
cd /var/www/api-stage/server
npm run build
pm2 restart api-stage
```

## 🔑 LoginHash Algoritması

```
input = username + password + secretKey + yyyyMMdd
hash = SHA256(input)
encryptedUser = Base64(hash)
```

- LoginHash 3 gün geçerli
- 3 gün sonra otomatik yenilenir (cron job)
- Token expiration: 3 gün

## 📡 API Endpoints

### Backend (NestJS)
- `POST /api/hizli/login` - Login yap ve token kaydet
- `GET /api/hizli/incoming` - Gelen e-faturaları getir
- `GET /api/hizli/token-status` - Token durumunu kontrol et

### Frontend (Next.js API Routes)
- `GET /api/hizli/incoming` - Backend'den e-faturaları proxy eder
- `GET /api/hizli/token-status` - Backend'den token durumunu proxy eder

## 🎨 Frontend Sayfası

- URL: `/efatura/gelen`
- Özellikler:
  - MUI DataGrid ile liste görünümü
  - XML görüntüleme modal
  - XML indirme
  - React Query ile otomatik yenileme
  - Token durumu göstergesi

## ⚙️ Cron Job

- Her 12 saatte bir çalışır (00:00 ve 12:00)
- Token expiration kontrolü
- LoginHash yaş kontrolü
- Gerekirse otomatik login

## 📝 Notlar

- Tenant kullanılmıyor (staging/test ortamı için)
- Test credentials kullanılıyor
- SOAP client test ortamı için SSL verification kapalı
- XML parse işlemi robust hata yönetimi ile yapılıyor

## 🚀 Test Etme

1. Login yap:
```bash
curl -X POST http://localhost:3000/api/hizli/login
```

2. Token durumunu kontrol et:
```bash
curl http://localhost:3000/api/hizli/token-status
```

3. Gelen e-faturaları getir:
```bash
curl http://localhost:3000/api/hizli/incoming
```

4. Frontend'de test et:
```
http://localhost:3001/efatura/gelen
```

## 🔧 Sorun Giderme

- SOAP client hatası: WSDL URL'ini kontrol edin
- Token hatası: LoginHash'in 3 günden eski olmadığını kontrol edin
- XML parse hatası: SOAP response formatını kontrol edin
- Database hatası: Migration'ın çalıştığından emin olun

