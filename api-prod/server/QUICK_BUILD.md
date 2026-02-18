# 🔨 Quick Build & Restart Guide

## Hızlı Build Komutları

### Yöntem 1: Tek Komut (Önerilen)
```bash
cd /var/www/api-stage/server && npm run build && pm2 restart api-stage && pm2 logs api-stage --lines 20
```

### Yöntem 2: Adım Adım
```bash
# 1. Backend klasörüne git
cd /var/www/api-stage/server

# 2. Build (TypeScript -> JavaScript)
npm run build

# 3. PM2 Restart
pm2 restart api-stage

# 4. Logs kontrol
pm2 logs api-stage --lines 20
```

### Yöntem 3: Script ile
```bash
# Script'i çalıştırılabilir yap
chmod +x /tmp/build-backend.sh

# Script'i çalıştır
/tmp/build-backend.sh
```

## ✅ Build Sonrası Test

### 1. Backend API Test
```bash
# Token Status (mevcut endpoint)
curl https://staging-api.otomuhasebe.com/api/fatura/efatura/token-status

# Test Integration (YENİ endpoint)
curl https://staging-api.otomuhasebe.com/api/fatura/efatura/test-integration
```

### 2. Frontend Test
```
https://staging.otomuhasebe.com/fatura/test-integration
```

## 🔍 Sorun Giderme

### Build Hatası Alırsanız
```bash
# TypeScript hatalarını kontrol
cd /var/www/api-stage/server
npm run build 2>&1 | grep error

# Linter hatalarını kontrol
npm run lint
```

### Endpoint 404 Alırsanız
```bash
# Compiled dosyada endpoint var mı kontrol
grep -n "testIntegration" /var/www/api-stage/server/dist/src/modules/fatura/fatura.controller.js

# PM2 status kontrol
pm2 status
pm2 logs api-stage --lines 30
```

### PM2 Çalışmıyorsa
```bash
# PM2 listesi
pm2 list

# Restart
pm2 restart api-stage

# Veya start (ilk kez)
pm2 start npm --name "api-stage" -- run start:prod
```

## 📋 Build Süreci

1. **TypeScript Compile**: `src/` → `dist/`
2. **PM2 Restart**: Yeni JavaScript kodunu yükle
3. **Test**: Endpoint'leri kontrol et

## 🎯 Beklenen Sonuç

Build başarılı olursa:
- ✅ `dist/src/modules/fatura/fatura.controller.js` güncellenecek
- ✅ `testIntegration` metodu compiled dosyada olacak
- ✅ `/api/fatura/efatura/test-integration` endpoint'i çalışacak
- ✅ Frontend test sayfası tam özelliklerle çalışacak

## 🚀 Hızlı Başlangıç

```bash
# Tek komut ile build + restart + test
cd /var/www/api-stage/server && \
npm run build && \
pm2 restart api-stage && \
sleep 2 && \
curl https://staging-api.otomuhasebe.com/api/fatura/efatura/test-integration | head -20
```

Başarılı olursa şunu göreceksiniz:
```json
{
  "success": true,
  "message": "Integration test completed successfully",
  "testResults": {
    "steps": [...],
    "success": true
  },
  "summary": {
    "totalSteps": 5,
    "successfulSteps": 5,
    "failedSteps": 0
  }
}
```

