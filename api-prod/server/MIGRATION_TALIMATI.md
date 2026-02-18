# HizliToken Migration Talimatı

## ✅ Migration Dosyası Oluşturuldu

Migration dosyası başarıyla oluşturuldu:
- `prisma/migrations/20251207120000_add_hizli_token/migration.sql`

## 🚀 Migration'ı Uygulama Adımları

### 1. Terminal'de şu komutları çalıştırın:

```bash
cd /var/www/api-stage/server

# Migration'ı uygula
npx prisma migrate deploy

# Veya development için:
npx prisma migrate dev --name add_hizli_token
```

### 2. Prisma Client'ı Generate Edin:

```bash
npx prisma generate
```

### 3. Migration Durumunu Kontrol Edin:

```bash
npx prisma migrate status
```

### 4. Backend Server'ı Yeniden Başlatın:

```bash
# PM2 kullanıyorsanız
pm2 restart all

# Veya
npm run start:prod
```

## 📋 Alternatif: Script Kullanımı

Eğer script kullanmak isterseniz:

```bash
chmod +x /var/www/api-stage/server/run-migration.sh
/var/www/api-stage/server/run-migration.sh
```

## ✅ Kontrol

Migration başarılı olduktan sonra:

1. Token yönetimi sayfasına gidin: https://staging.otomuhasebe.com/fatura/hizli-token-yonetimi
2. "Login Test Et" butonuna tıklayın
3. Token veritabanına kaydedilecek
4. Token görüntülenecek

## 🔍 Sorun Giderme

Eğer migration hatası alırsanız:

1. Veritabanı bağlantısını kontrol edin
2. `.env` dosyasında `DATABASE_URL` değişkeninin doğru olduğundan emin olun
3. Migration loglarını kontrol edin

