# ✅ HizliToken Migration Hazır!

## 🎯 Yapılan İşlemler

1. ✅ Migration dosyası oluşturuldu: `prisma/migrations/20251207120000_add_hizli_token/migration.sql`
2. ✅ Migration script'i oluşturuldu: `apply-hizli-token-migration.js`
3. ✅ Package.json'a script eklendi: `npm run migrate:hizli-token`

## 🚀 Migration'ı Uygulama

### Yöntem 1: NPM Script (Önerilen)

```bash
cd /var/www/api-stage/server
npm run migrate:hizli-token
npx prisma generate
```

### Yöntem 2: Node Script

```bash
cd /var/www/api-stage/server
node apply-hizli-token-migration.js
npx prisma generate
```

### Yöntem 3: Prisma Migrate

```bash
cd /var/www/api-stage/server
npx prisma migrate deploy
npx prisma generate
```

## 🔄 Server'ı Yeniden Başlatma

Migration uygulandıktan sonra:

```bash
# PM2 kullanıyorsanız
pm2 restart all

# Veya
npm run start:prod
```

## ✅ Kontrol

1. Token yönetimi sayfasına gidin: https://staging.otomuhasebe.com/fatura/hizli-token-yonetimi
2. "Login Test Et" butonuna tıklayın
3. Backend loglarında şu mesajları görmelisiniz:
   - `📝 Token veritabanına kaydediliyor...`
   - `✅ Token veritabanına başarıyla kaydedildi!`
   - `✅ Token doğrulandı - veritabanında mevcut`
4. Token frontend'de görüntülenecek

## 📋 Oluşturulan Dosyalar

- `prisma/migrations/20251207120000_add_hizli_token/migration.sql` - Migration SQL
- `apply-hizli-token-migration.js` - Migration script'i
- `run-all-migrations.sh` - Tüm migration'ları çalıştıran script
- `MIGRATION_TALIMATI.md` - Detaylı talimatlar

## 🔍 Sorun Giderme

Eğer migration hatası alırsanız:

1. Veritabanı bağlantısını kontrol edin: `.env` dosyasında `DATABASE_URL`
2. Prisma Client'ı generate edin: `npx prisma generate`
3. Migration durumunu kontrol edin: `npx prisma migrate status`

