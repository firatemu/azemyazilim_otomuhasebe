# Backend Build ve Restart Talimatları

## 🚀 Hızlı Başlangıç

Backend'i build etmek ve restart etmek için aşağıdaki komutları çalıştırın:

### Yöntem 1: Otomatik Script (Önerilen)

```bash
cd /var/www/api-stage/server
chmod +x build-and-restart.sh
./build-and-restart.sh
```

### Yöntem 2: Manuel Adımlar

```bash
cd /var/www/api-stage/server

# 1. Dependencies kontrolü
npm install

# 2. Build
npm run build

# 3. Prisma generate
npx prisma generate

# 4. Restart (PM2 kullanılıyorsa)
pm2 restart api-stage

# VEYA manuel start
npm run start:prod
```

## ✅ Build Sonrası Kontrol

Backend'in çalıştığını kontrol etmek için:

```bash
# Health check
curl https://staging-api.otomuhasebe.com/api

# Hızlı endpoint test
curl https://staging-api.otomuhasebe.com/api/hizli/token-status
curl https://staging-api.otomuhasebe.com/api/hizli/urn-config
```

## 🔍 Sorun Giderme

### Build Hatası Alıyorsanız:

1. **TypeScript hataları:**
   ```bash
   npm run lint
   ```

2. **Prisma hataları:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

3. **Module bulunamadı hataları:**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

### PM2 Restart Çalışmıyorsa:

```bash
# PM2 process listesi
pm2 list

# Manuel restart
pm2 restart api-stage

# VEYA yeni process başlat
pm2 start dist/src/main.js --name api-stage
```

## 📝 Notlar

- Build işlemi genellikle 1-2 dakika sürer
- Production build için `npm run build` kullanın
- Development için `npm run start:dev` kullanın (watch mode)
- Backend port: **3020** (staging)
- Global API prefix: **/api**

## 🔗 Endpoint'ler

Build sonrası aşağıdaki endpoint'ler çalışır olmalı:

- `GET /api/hizli/token-status` - Token durumu
- `GET /api/hizli/incoming` - Gelen e-faturalar
- `POST /api/hizli/login` - Login işlemi
- `GET /api/hizli/urn-config` - URN konfigürasyonu

