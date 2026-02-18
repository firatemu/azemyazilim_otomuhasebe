# 🚀 Test Ortamından Canlı Ortama Deploy Rehberi

Bu rehber, test ortamındaki (panel-stage) değişiklikleri canlı ortama (panel-prod) nasıl deploy edeceğinizi açıklar.

## 📋 Hızlı Başlangıç

### Otomatik Deploy (Önerilen)

```bash
/var/www/panel-stage/scripts/deploy-to-prod.sh
```

Script otomatik olarak:
- ✅ Backup alır
- ✅ Dosyaları kopyalar
- ✅ Build yapar
- ✅ Uygulamayı restart eder
- ✅ Health check yapar

## 🔧 Manuel Yöntemler

### 1. Git Kullanarak Deploy

Eğer projeniz Git ile yönetiliyorsa:

```bash
# Test ortamında değişiklikleri commit et
cd /var/www/panel-stage
git add .
git commit -m "Deployment: [Değişiklik açıklaması]"
git push origin develop

# Canlı ortama geç
cd /var/www/panel-prod
git pull origin main

# Build ve restart
cd client
npm install --production
npm run build
pm2 restart panel-prod --update-env
pm2 save
```

### 2. Dosya Kopyalama ile Deploy

Git kullanmıyorsanız:

```bash
# 1. Backup al
BACKUP_DIR="/var/www/backups/pre-deploy-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r /var/www/panel-prod/client/.next "$BACKUP_DIR/.next.backup" 2>/dev/null || true

# 2. Dosyaları kopyala
rsync -av --exclude 'node_modules' \
          --exclude '.next' \
          --exclude '.git' \
          --exclude '*.log' \
          /var/www/panel-stage/client/ /var/www/panel-prod/client/

# 3. Build yap
cd /var/www/panel-prod/client
npm install --production
npm run build

# 4. Restart
pm2 restart panel-prod --update-env
pm2 save
```

## ⚠️ Önemli Notlar

1. **Backup Alın**: Her zaman deploy öncesi backup alın
2. **Test Edin**: Deploy sonrası canlı ortamı mutlaka test edin
3. **Logları Kontrol Edin**: `pm2 logs panel-prod` ile logları kontrol edin
4. **Rollback Hazır Olun**: Sorun durumunda hızlıca geri alabilmek için backup'ı saklayın

## 🔄 Rollback (Geri Alma)

Eğer bir sorun çıkarsa:

```bash
# Backup'tan geri yükle
BACKUP_DIR="/var/www/backups/pre-deploy-[TARIH]"
rm -rf /var/www/panel-prod/client/.next
cp -r "$BACKUP_DIR/.next.backup" /var/www/panel-prod/client/.next
pm2 restart panel-prod
```

## ✅ Deploy Sonrası Kontrol Listesi

- [ ] Canlı ortam açılıyor mu?
- [ ] Login sayfası çalışıyor mu?
- [ ] API bağlantıları çalışıyor mu?
- [ ] PM2 durumu "online" mı?
- [ ] Loglarda hata var mı? (`pm2 logs panel-prod`)
- [ ] Kullanıcılar sisteme girebiliyor mu?

## 📞 Sorun Giderme

### Build Hatası
```bash
cd /var/www/panel-prod/client
rm -rf node_modules .next
npm install --production
npm run build
```

### PM2 Restart Sorunu
```bash
pm2 delete panel-prod
cd /var/www/panel-prod/client
pm2 start npm --name "panel-prod" -- start
pm2 save
```

### Port Çakışması
```bash
# Hangi port kullanılıyor kontrol et
sudo ss -ltnp | grep -E '3000|3001'
# PM2 config'de port değiştir
```

