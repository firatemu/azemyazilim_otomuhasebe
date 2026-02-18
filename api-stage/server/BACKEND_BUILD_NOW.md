# 🚨 BACKEND BUILD VE RESTART - ACİL

## Durum
Backend endpoint'leri 404 veriyor: `/api/hizli/token-status` ve `/api/hizli/incoming`

**Sebep:** Backend henüz build edilmemiş veya restart edilmemiş.

## ✅ HIZLI ÇÖZÜM

Terminal'de şu komutları sırayla çalıştırın:

```bash
cd /var/www/api-stage/server

# 1. Cache temizle (opsiyonel ama önerilir)
rm -rf dist

# 2. Dependencies kontrol et
npm install

# 3. BUILD (ÖNEMLİ!)
npm run build

# 4. Prisma generate
npx prisma generate

# 5. RESTART
# PM2 kullanıyorsanız:
pm2 restart api-stage

# VEYA process'i bulup restart edin:
pm2 list
pm2 restart <process-name>

# VEYA manuel restart:
# Önce çalışan process'i durdurun (Ctrl+C veya kill)
# Sonra:
npm run start:prod
```

## 🔍 Build Başarılı mı Kontrol Edin

Build başarılıysa `dist/` klasörü oluşmalı:

```bash
ls -la dist/src/modules/hizli/
```

Şu dosyalar olmalı:
- `hizli.controller.js`
- `hizli.service.js`
- `hizli.module.js`

## 🧪 Endpoint'leri Test Edin

Build ve restart sonrası:

```bash
# Token status
curl https://staging-api.otomuhasebe.com/api/hizli/token-status

# Incoming
curl https://staging-api.otomuhasebe.com/api/hizli/incoming

# Test endpoint
curl https://staging-api.otomuhasebe.com/api/hizli/urn-config
```

**Beklenen Sonuç:** 200 OK ve JSON response

## ❌ Hata Alırsanız

### Build hatası:
```bash
# TypeScript hatalarını kontrol et
npm run lint

# Modül eksikse
npm install @nestjs/schedule
```

### Prisma hatası:
```bash
npx prisma generate
npx prisma migrate deploy
```

### PM2 hatası:
```bash
# Process listesi
pm2 list

# Log'ları kontrol et
pm2 logs api-stage

# Process'i silip yeniden başlat
pm2 delete api-stage
pm2 start dist/src/main.js --name api-stage
```

## 📝 Özet

1. ✅ `cd /var/www/api-stage/server`
2. ✅ `npm install` (eğer dependencies eksikse)
3. ✅ `npm run build`
4. ✅ `npx prisma generate`
5. ✅ `pm2 restart api-stage` VEYA `npm run start:prod`

**NOT:** Build işlemi 1-2 dakika sürebilir. Sabırlı olun!

