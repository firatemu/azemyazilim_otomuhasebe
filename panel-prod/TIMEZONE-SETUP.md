# Türkiye İstanbul Timezone Kurulum Kılavuzu

Bu kılavuz, projenin tüm zaman formatlarını Türkiye İstanbul (Europe/Istanbul, UTC+3) timezone'una göre yapılandırmak için gerekli adımları içerir.

## 📋 İçindekiler

1. [Sistem Timezone Ayarları](#sistem-timezone-ayarları)
2. [Node.js/Next.js Timezone Ayarları](#nodejsnextjs-timezone-ayarları)
3. [Veritabanı Timezone Ayarları](#veritabanı-timezone-ayarları)
4. [Uygulama Kodunda Kullanım](#uygulama-kodunda-kullanım)
5. [Kontrol ve Test](#kontrol-ve-test)

## 🔧 Sistem Timezone Ayarları

### Linux Sistemlerde

```bash
# Mevcut timezone'u kontrol et
timedatectl

# Timezone'u Europe/Istanbul olarak ayarla
sudo timedatectl set-timezone Europe/Istanbul

# Kontrol et
timedatectl | grep "Time zone"
```

### Otomatik Kurulum Script'i

```bash
cd /var/www/panel-prod
chmod +x setup-timezone.sh
./setup-timezone.sh
```

## ⚙️ Node.js/Next.js Timezone Ayarları

### 1. Environment Variable Ayarları

`.env` dosyanıza (veya `.env.local`) aşağıdaki satırı ekleyin:

```env
TZ=Europe/Istanbul
```

### 2. Next.js Config

`next.config.ts` dosyasına timezone ayarı zaten eklenmiştir:

```typescript
process.env.TZ = 'Europe/Istanbul';
```

### 3. Package.json Script'lerini Güncelleme

Gerekirse script'lere timezone ekleyebilirsiniz:

```json
{
  "scripts": {
    "dev": "TZ=Europe/Istanbul next dev",
    "build": "TZ=Europe/Istanbul next build",
    "start": "TZ=Europe/Istanbul next start"
  }
}
```

## 🗄️ Veritabanı Timezone Ayarları

### MySQL

```sql
-- Global timezone ayarı
SET GLOBAL time_zone = '+03:00';

-- Session timezone ayarı
SET time_zone = '+03:00';

-- Kontrol
SELECT @@global.time_zone, @@session.time_zone;
```

**Kalıcı ayar için `my.cnf` dosyasına ekleyin:**

```ini
[mysqld]
default-time-zone = '+03:00'
```

### PostgreSQL

```sql
-- Timezone ayarı
SET timezone = 'Europe/Istanbul';

-- Kontrol
SHOW timezone;
```

**Kalıcı ayar için `postgresql.conf` dosyasına ekleyin:**

```ini
timezone = 'Europe/Istanbul'
```

### MongoDB

MongoDB otomatik olarak sistem timezone'unu kullanır. Sistem timezone'unu ayarladıktan sonra MongoDB de aynı timezone'u kullanacaktır.

### Veritabanı Script'i

Hazır SQL script'ini kullanabilirsiniz:

```bash
# MySQL için
mysql -u kullanici -p veritabani_adi < database-timezone-setup.sql

# PostgreSQL için
psql -U kullanici -d veritabani_adi -f database-timezone-setup.sql
```

## 💻 Uygulama Kodunda Kullanım

### Date Utility Fonksiyonları

Projeye `src/lib/dateUtils.ts` dosyası eklenmiştir. Bu dosya Türkiye İstanbul timezone'u için özel fonksiyonlar içerir:

```typescript
import { 
  formatDateTurkey, 
  formatDateTimeTurkey, 
  formatTimeTurkey,
  getNowTurkey 
} from '@/lib/dateUtils';

// Tarih formatlama
const formattedDate = formatDateTurkey(new Date()); // "01.01.2024"

// Tarih ve saat formatlama
const formattedDateTime = formatDateTimeTurkey(new Date()); // "01.01.2024 14:30:00"

// Sadece saat
const formattedTime = formatTimeTurkey(new Date()); // "14:30:00"

// Şu anki zaman
const now = getNowTurkey();
```

### Mevcut Kodlarda Güncelleme

Mevcut `formatDate` fonksiyonlarını `dateUtils.ts`'deki fonksiyonlarla değiştirebilirsiniz:

**Önce:**
```typescript
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR');
};
```

**Sonra:**
```typescript
import { formatDateTurkey } from '@/lib/dateUtils';

// Kullanım
const formatted = formatDateTurkey(date);
```

## ✅ Kontrol ve Test

### 1. Sistem Timezone Kontrolü

```bash
date
timedatectl
```

### 2. Node.js Timezone Kontrolü

```bash
node -e "console.log(new Date().toString())"
node -e "console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)"
```

### 3. Veritabanı Timezone Kontrolü

**MySQL:**
```sql
SELECT NOW(), @@session.time_zone;
```

**PostgreSQL:**
```sql
SELECT NOW(), current_setting('timezone');
```

### 4. Uygulama Testi

```typescript
// Test için
console.log('System timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
console.log('Current date:', new Date().toString());
console.log('Formatted (Turkey):', formatDateTurkey(new Date()));
```

## 🔄 Mevcut Verileri Güncelleme

⚠️ **ÖNEMLİ:** Mevcut veritabanı verilerini güncellemeden önce mutlaka yedek alın!

### UTC'den Istanbul'a Dönüştürme

**MySQL:**
```sql
UPDATE tablo_adi 
SET tarih_kolonu = CONVERT_TZ(tarih_kolonu, 'UTC', '+03:00')
WHERE tarih_kolonu IS NOT NULL;
```

**PostgreSQL:**
```sql
UPDATE tablo_adi 
SET tarih_kolonu = tarih_kolonu AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul'
WHERE tarih_kolonu IS NOT NULL;
```

## 📝 Notlar

1. **Yeni Kayıtlar:** Timezone ayarları yapıldıktan sonra yeni kayıtlar otomatik olarak doğru timezone'u kullanacaktır.

2. **Mevcut Veriler:** Eğer mevcut veriler farklı bir timezone'da saklanıyorsa, yukarıdaki UPDATE sorgularını kullanarak dönüştürebilirsiniz.

3. **API İstekleri:** Backend API'de de timezone ayarlarının yapıldığından emin olun.

4. **Sunucu Yeniden Başlatma:** Timezone ayarları yapıldıktan sonra uygulamayı ve veritabanını yeniden başlatmanız gerekebilir.

## 🆘 Sorun Giderme

### Timezone hala yanlış gösteriliyor

1. Sistem timezone'unu kontrol edin: `timedatectl`
2. Environment variable'ları kontrol edin: `echo $TZ`
3. Uygulamayı yeniden başlatın
4. Browser cache'ini temizleyin

### Veritabanı timezone hatası

1. Veritabanı bağlantı string'inde timezone parametresini kontrol edin
2. Veritabanı sunucusunun timezone'unu kontrol edin
3. Connection pool ayarlarını kontrol edin

## 📞 Destek

Sorun yaşarsanız:
1. Log dosyalarını kontrol edin
2. Veritabanı ve sistem timezone ayarlarını doğrulayın
3. Environment variable'ları kontrol edin

