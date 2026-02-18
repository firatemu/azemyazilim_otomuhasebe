# ✅ Hızlı Teknoloji Entegrasyonu - Tamamlandı

## 📋 Yapılan İşlemler

### 1. Backend Modülleri ✅
- ✅ `src/modules/hizli/` klasörü ve tüm alt dosyalar oluşturuldu
- ✅ SOAP client servisi (strong-soap)
- ✅ Login hash encryption (SHA256 → Base64)
- ✅ Service, Controller, Cron job
- ✅ AppModule'a HizliModule eklendi

### 2. Database ✅
- ✅ Prisma schema güncellendi
- ✅ Migration dosyası hazırlandı
- ✅ Index'ler eklendi

### 3. Frontend ✅
- ✅ E-fatura sayfası (`/efatura/gelen`)
- ✅ IncomingGrid component (MUI DataGrid)
- ✅ XmlModal component
- ✅ API routes

### 4. Dependencies ✅
- ✅ strong-soap
- ✅ xml2js
- ✅ @nestjs/schedule
- ✅ @types/xml2js

## 🚀 Kurulum Adımları

### Seçenek 1: Otomatik Kurulum (Önerilen)

```bash
cd /var/www/api-stage/server

# Tüm adımları otomatik yapar
npm run setup:hizli:full

# Veya Node.js script ile
npm run setup:hizli
```

### Seçenek 2: Manuel Kurulum

```bash
cd /var/www/api-stage/server

# 1. Environment variables ekle
npm run setup:hizli:env
# veya manuel olarak .env dosyasına ekle

# 2. Dependencies yükle
npm install

# 3. Prisma generate
npx prisma generate

# 4. Migration uygula
npx prisma migrate deploy
# veya
npx prisma migrate dev --name add_hizli_models

# 5. Build
npm run build

# 6. PM2 restart
pm2 restart api-stage
```

## 🔧 Environment Variables

`.env` dosyasına şu değişkenleri ekleyin:

```env
# Hızlı Teknoloji Entegrasyonu
HIZLI_API_KEY=9785bcc39536
HIZLI_SECRET_KEY=9785bcc3953673cfb92246398b25449ad25e
HIZLI_USERNAME=hizlitest
HIZLI_PASSWORD=Test.1234
HIZLI_WSDL=https://econnecttest.hizliteknoloji.com.tr/Services/HizliService.svc?wsdl
```

## 🧪 Test

### Backend Endpoints

```bash
# 1. Login
curl -X POST http://localhost:3000/api/hizli/login

# 2. Token Status
curl http://localhost:3000/api/hizli/token-status

# 3. Incoming Documents
curl http://localhost:3000/api/hizli/incoming
```

### Frontend

- URL: `http://localhost:3001/efatura/gelen`
- Özellikler:
  - MUI DataGrid ile liste
  - XML görüntüleme
  - XML indirme
  - Otomatik yenileme (React Query)

## 📝 Önemli Notlar

1. **Migration**: İlk kurulumda migration çalıştırılmalı
2. **Environment Variables**: Tüm HIZLI_* değişkenleri .env'de olmalı
3. **Cron Job**: Her 12 saatte bir otomatik token yenileme yapılır
4. **LoginHash**: 3 gün geçerli, otomatik yenilenir
5. **Token**: 3 gün geçerli, otomatik yenilenir

## 🔍 Sorun Giderme

### Migration Hatası
```bash
# Manuel migration
psql -d your_database -f prisma/migrations/create-hizli-models.sql
```

### Build Hatası
```bash
# TypeScript hatalarını kontrol et
npm run build 2>&1 | grep error
```

### SOAP Client Hatası
- WSDL URL'ini kontrol edin
- SSL sertifikası test ortamında rejectUnauthorized: false

### Token Hatası
- LoginHash'in 3 günden eski olmadığını kontrol edin
- Token expiration'ı kontrol edin

## 📚 Dosya Yapısı

```
src/modules/hizli/
├── hizli.module.ts
├── hizli.service.ts
├── hizli.controller.ts
├── dto/
│   └── login.dto.ts
├── utils/
│   ├── encrypt-login.ts
│   └── soap-client.ts
└── cron/
    └── hizli.cron.ts

prisma/
├── schema.prisma (güncellendi)
└── migrations/
    └── 20250101000000_add_hizli_models/
        ├── migration.sql
        └── migration_lock.toml

src/app/efatura/gelen/
└── page.tsx

src/components/efatura/
├── IncomingGrid.tsx
└── XmlModal.tsx
```

## ✅ Kurulum Tamamlandı!

Tüm dosyalar hazır ve entegrasyon tamamlandı. Kurulum script'lerini çalıştırarak sistemi aktif edebilirsiniz.

