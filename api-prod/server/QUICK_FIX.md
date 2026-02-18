# 🚨 ACİL DÜZELTME - Sistem Cevap Vermiyor

## Durum
Terminal komutları cevap vermiyor. Sistem donmuş veya shell takılmış olabilir.

## Çözüm Adımları

### 1. Yeni SSH Bağlantısı Açın
Mevcut terminal'i kapatıp **yeni bir SSH bağlantısı** açın.

### 2. Takılı Process'leri Sonlandırın
```bash
# Takılı npm/node process'lerini sonlandır
pkill -9 npm
pkill -9 node

# PM2'yi temizle
pm2 kill
```

### 3. strong-soap Modülünü Yükleyin
```bash
cd /var/www/api-stage/server

# Modülü yükle
npm install strong-soap --save

# Veya tüm dependencies'i yeniden yükle
npm install
```

### 4. Build Yapın
```bash
cd /var/www/api-stage/server
npm run build
```

### 5. PM2'yi Başlatın
```bash
cd /var/www/api-stage/server
pm2 start ecosystem.config.js
pm2 save
```

### 6. Test Edin
```bash
# API testi
curl http://localhost:3020/api/hizli/token-status

# PM2 durumu
pm2 list
pm2 logs api-stage --lines 20
```

## Alternatif: Script Kullanın

Yeni SSH bağlantısında:
```bash
cd /var/www/api-stage/server
chmod +x fix-strong-soap-manual.sh
bash fix-strong-soap-manual.sh
```

## Sorun Devam Ederse

1. **Sistem kaynaklarını kontrol edin:**
   ```bash
   df -h
   free -h
   top
   ```

2. **PM2 daemon'ı yeniden başlatın:**
   ```bash
   pm2 kill
   pm2 resurrect
   # Veya
   systemctl restart pm2-root
   ```

3. **Manuel node başlatma (PM2 çalışmıyorsa):**
   ```bash
   cd /var/www/api-stage/server
   NODE_ENV=staging PORT=3020 CORS_ORIGINS='https://staging.otomuhasebe.com,https://staging-api.otomuhasebe.com,http://localhost:3000' node dist/src/main.js
   ```


