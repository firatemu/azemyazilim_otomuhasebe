# API Kalıcı Deployment Çözümü

## Sorun
API sürekli port 3001'de çalışmıyordu. Hata: `Error: Cannot find module '/var/www/api-stage/server/dist/src/main'`

## Kök Sebep
- PM2 ecosystem.config.js dosyasında yanlış script path: `./dist/main.js`
- Doğru path: `./dist/src/main.js`
- NODE_ENV production olarak ayarlanmıştı, staging olmalıydı

## Çözüm

### 1. ecosystem.config.js Düzeltildi
```javascript
script: './dist/src/main.js'  // ✅ Doğru path
NODE_ENV: 'staging'            // ✅ Doğru environment
```

### 2. Deployment Script Oluşturuldu
Kullanım:
```bash
cd /var/www/api-stage/server
./deploy.sh
```

### 3. PM2 Otomatik Başlatma Aktif Edildi
```bash
pm2 save
pm2 startup
```

## Deployment Adımları

### Manuel Deployment:
```bash
cd /var/www/api-stage/server
npm run build
npx prisma generate
pm2 restart api-stage
```

### Otomatik Deployment (Önerilen):
```bash
cd /var/www/api-stage/server
./deploy.sh
```

## Kontrol Komutları

### PM2 Status:
```bash
pm2 status
pm2 logs api-stage
pm2 monit
```

### Port Kontrolü:
```bash
netstat -tlnp | grep 3001
curl http://localhost:3001/api/cari
```

### API Test:
```bash
curl http://localhost:3001/api/cari
# Expected: 401 Unauthorized (normal - authentication gerektirir)
```

## Troubleshooting

### API Çalışmıyorsa:
```bash
pm2 logs api-stage --lines 50
pm2 restart api-stage
```

### Build Hatası Varsa:
```bash
cd /var/www/api-stage/server
npm install
npm run build
pm2 restart api-stage
```

### Database Migration Gerekiyorsa:
```bash
cd /var/www/api-stage/server
npx prisma migrate deploy
pm2 restart api-stage
```

## Dosya Yapısı
```
/var/www/api-stage/server/
├── ecosystem.config.js  # PM2 configuration (DÜZELTİLDİ)
├── deploy.sh           # Deployment script (YENİ)
├── dist/
│   └── src/
│       └── main.js     # Build output
└── prisma/
    └── schema.prisma   # Database schema
```

## Son Değişiklikler (Dec 5, 2025)

1. ✅ ecosystem.config.js düzeltildi
2. ✅ deploy.sh script'i oluşturuldu
3. ✅ PM2 startup aktif edildi
4. ✅ vergiDairesiKodu field'ı eklendi (backend + frontend)

## İletişim
Sorun olursa: `pm2 logs api-stage`
