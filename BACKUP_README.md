# Tam Yedekleme Sistemi

Bu script projenin (kod + veritabanı) eksiksiz yedeğini alır.

## Kullanım

### Otomatik Yedekleme (Önerilen)

```bash
cd /var/www
./backup-full.sh
```

Script otomatik olarak:
- `.env` dosyasından `DATABASE_URL` okumaya çalışır
- PostgreSQL veritabanı dump'ı alır
- Tüm proje kodlarını yedekler (node_modules hariç)
- Yedekleri `/var/backups/` dizinine kaydeder

### Manuel Veritabanı URL ile

Eğer `.env` dosyasından okuma başarısız olursa:

```bash
./backup-full.sh 'postgresql://user:password@host:5432/database_name'
```

### Environment Variable ile

```bash
export DATABASE_URL='postgresql://user:password@host:5432/database_name'
./backup-full.sh
```

## Yedekleme Kapsamı

### Veritabanı Yedeği
- **Konum:** `/var/backups/database/`
- **Format:** `database-backup-YYYY-MM-DD-HHMMSS.sql.gz`
- **İçerik:** Tam PostgreSQL dump (schema + data)

### Kod Yedeği
- **Konum:** `/var/backups/code/`
- **Format:** `code-backup-YYYY-MM-DD-HHMMSS.tar.gz`
- **İçerik:** Tüm proje dosyaları (node_modules hariç)

**Yedeklenen Dizinler:**
- `/var/www/api-stage/`
- `/var/www/api-prod/`
- `/var/www/panel-stage/`
- `/var/www/panel-prod/`
- `/var/www/admin-stage/`
- `/var/www/admin-otomuhasebe/`
- `/var/www/otomuhasebe-landing/`
- `/var/www/otomuhasebe-landing-prod/`

**Hariç Tutulanlar:**
- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `.cache/`
- `coverage/`
- `*.log`
- `*.tmp`

### Log Dosyaları
- **Konum:** `/var/backups/logs/`
- **Format:** `backup-YYYY-MM-DD-HHMMSS.log`

## Yedekleri Geri Yükleme

### Veritabanı Geri Yükleme

```bash
# Sıkıştırılmış dump'ı aç
gunzip /var/backups/database/database-backup-YYYY-MM-DD-HHMMSS.sql.gz

# Veritabanını geri yükle
psql -h localhost -U username -d database_name < /var/backups/database/database-backup-YYYY-MM-DD-HHMMSS.sql
```

### Kod Geri Yükleme

```bash
# Yedeği aç
cd /var
tar -xzf /var/backups/code/code-backup-YYYY-MM-DD-HHMMSS.tar.gz

# Dosyaları uygun yerlere kopyala
cp -r code-backup-YYYY-MM-DD-HHMMSS/* /var/www/
```

## Otomatik Yedekleme (Cron)

Günlük otomatik yedekleme için cron job ekleyin:

```bash
# Crontab düzenle
crontab -e

# Her gün saat 02:00'de yedekle
0 2 * * * /var/www/backup-full.sh >> /var/backups/logs/cron-backup.log 2>&1
```

## Sorun Giderme

### Veritabanı Yedeği Alınamıyor

1. `DATABASE_URL` environment variable'ı kontrol edin:
   ```bash
   echo $DATABASE_URL
   ```

2. `.env` dosyasını kontrol edin:
   ```bash
   grep DATABASE_URL /var/www/api-stage/server/.env
   ```

3. Manuel olarak parametre verin:
   ```bash
   ./backup-full.sh 'postgresql://user:pass@host:5432/db'
   ```

### Disk Alanı Yetersiz

Yedekler yaklaşık 2-3 GB yer kaplayabilir. Eski yedekleri temizleyin:

```bash
# 30 günden eski yedekleri sil
find /var/backups -type f -mtime +30 -delete
```

## Yedek Boyutları

- **Kod yedeği:** ~2-3 GB (sıkıştırılmış)
- **Veritabanı yedeği:** Veritabanı boyutuna bağlı (genellikle 100-500 MB sıkıştırılmış)

## Notlar

- Yedekleme işlemi sırasında sistem kaynakları kullanılır
- Büyük veritabanları için yedekleme uzun sürebilir
- Yedekler sıkıştırılmış formatda saklanır
- `.env` dosyaları yedeklenir (güvenlik için ayrı bir yerde saklanmalı)

