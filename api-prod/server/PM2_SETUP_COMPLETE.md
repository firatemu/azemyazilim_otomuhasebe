# PM2 Backend Yönetimi - Kalıcı Çözüm

## ✅ Yapılan İşlemler

1. **PM2 ile Backend Başlatıldı**
   - Backend artık PM2 process manager ile yönetiliyor
   - Otomatik restart özelliği aktif
   - Log dosyaları: `/var/log/pm2/api-stage-*.log`

2. **Otomatik Başlatma Yapılandırıldı**
   - PM2 konfigürasyonu kaydedildi (`pm2 save`)
   - Sunucu yeniden başlatıldığında backend otomatik başlayacak

3. **Ecosystem Config Güncellendi**
   - `exec_mode: 'fork'` (NestJS için uygun)
   - `autorestart: true` (crash durumunda otomatik restart)
   - `min_uptime: '10s'` (minimum çalışma süresi)
   - `max_restarts: 10` (maksimum restart sayısı)
   - `restart_delay: 4000` (restart arası bekleme)

## 📋 Kullanım Komutları

### Backend Durumu
```bash
pm2 status
pm2 logs api-stage
pm2 monit
```

### Backend Yönetimi
```bash
# Restart
pm2 restart api-stage

# Stop
pm2 stop api-stage

# Start
pm2 start api-stage

# Yeniden başlat (build + restart)
cd /var/www/api-stage/server
./restart-backend-pm2.sh
```

### Log İzleme
```bash
# Tüm loglar
pm2 logs api-stage

# Sadece hata logları
pm2 logs api-stage --err

# Sadece output logları
pm2 logs api-stage --out

# Log dosyaları
tail -f /var/log/pm2/api-stage-error.log
tail -f /var/log/pm2/api-stage-out.log
```

## 🔧 Sorun Giderme

### Backend çalışmıyorsa:
```bash
# PM2 durumunu kontrol et
pm2 status

# Backend'i yeniden başlat
pm2 restart api-stage

# Logları kontrol et
pm2 logs api-stage --lines 50
```

### Port 3020 kullanılıyorsa:
```bash
# Port'u kullanan process'i bul
netstat -tlnp | grep 3020

# PM2 process'ini restart et
pm2 restart api-stage
```

### PM2 process'i görmüyorsanız:
```bash
# PM2'yi yeniden başlat
pm2 kill
cd /var/www/api-stage/server
pm2 start ecosystem.config.js
pm2 save
```

## 🚀 Otomatik Başlatma

Backend artık sunucu yeniden başlatıldığında otomatik olarak başlayacak. Eğer otomatik başlatma çalışmıyorsa:

```bash
# Startup script'i yeniden oluştur
pm2 startup systemd -u root --hp /root

# Çıkan komutu çalıştırın (genellikle sudo systemctl enable pm2-root)
```

## 📊 Monitoring

PM2 monit ile real-time monitoring:
```bash
pm2 monit
```

## ✅ Test

Backend'in çalıştığını test etmek için:
```bash
curl http://127.0.0.1:3020/api/hizli/token-status
```

## 📝 Notlar

- Backend port: `3020`
- Log dosyaları: `/var/log/pm2/api-stage-*.log`
- Config dosyası: `/var/www/api-stage/server/ecosystem.config.js`
- Restart script: `/var/www/api-stage/server/restart-backend-pm2.sh`

