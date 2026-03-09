# Database Migration Guide

Bu rehber, otomuhasebe veritabanı için hazırlanan migration dosyalarının nasıl çalıştırılacağını açıklar.

## 📋 İçindekiler

- [Ön Koşullar](#ön-koşullar)
- [Migration Dosyaları](#migration-dosyaları)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Detaylı Açıklama](#detaylı-açıklama)
- [Sonraki Adımlar](#sonraki-adımlar)
- [Sorun Giderme](#sorun-giderme)

## 🔧 Ön Koşullar

### Gereksinimler

1. **PostgreSQL 14+** yüklü olmalı
2. **psql** komut satırı aracı
3. **Veritabanı bağlantı bilgileri**
4. **Yazma izinleri** (script için `chmod +x`)

### Veritabanı Bağlantısı

Bağlantı bilgilerini ortam değişkenleri olarak ayarlayın:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_NAME=otomuhasebe_stage
```

Veya script içindeki varsayılan değerleri düzenleyin.

## 📁 Migration Dosyaları

Hazırlanan migration dosyaları:

| Dosya | Görev | Açıklama |
|-------|-------|----------|
| `migration_task_01_complete_fixed.sql` | TASK 1 | TenantId düzeltmeleri ve foreign key'ler |
| `migration_task_05_composite_indexes_fixed.sql` | TASK 5 | Composite index'ler (performans) |
| `migration_task_06_multi_currency_fixed.sql` | TASK 6 | Çoklu para birimi desteği |
| `migration_task_07_checkbill_endorsement_fixed.sql` | TASK 7 | Çek/Senet ciro düzeltmeleri |
| `migration_task_08_float_validation_fixed.sql` | TASK 8 | Float tip doğrulaması (sadece rapor) |
| `migration_task_09_brand_normalization_fixed.sql` | TASK 9 | Marka normalizasyonu |
| `migration_task_10_category_normalization_fixed.sql` | TASK 10 | Kategori normalizasyonu |
| `migration_task_11_vehicle_compatibility_fixed.sql` | TASK 11 | Araç uyumluluk alanları (JSON) |
| `migration_task_12_unit_duplication_fixed.sql` | TASK 12 | Birim mükerrer kayıtları |
| `migration_task_13_rls_preparation_fixed.sql` | TASK 13 | Row-Level Security hazırlığı |

## 🚀 Hızlı Başlangıç

### Tüm Migration'ları Bir Seferde Çalıştır

```bash
# Script'i çalıştır
./run_all_migrations.sh
```

Bu script:
1. ✅ Veritabanı bağlantısını test eder
2. ✅ Tenants tablosunu kontrol eder
3. ✅ Otomatik backup alır
4. ✅ Tüm migration'ları sırayla çalıştırır
5. ✅ Sonuçları raporlar

### Tek Tek Çalıştırma

Her görevi ayrı ayrı çalıştırabilirsiniz:

```bash
# TASK 1: TenantId düzeltmeleri
psql -h localhost -U postgres -d otomuhasebe_stage -f migration_task_01_complete_fixed.sql

# TASK 5: Composite index'ler
psql -h localhost -U postgres -d otomuhasebe_stage -f migration_task_05_composite_indexes_fixed.sql

# ... diğer TASK'lar
```

## 📖 Detaylı Açıklama

### TASK 1: TenantId Düzeltmeleri

**Amaç:** Tüm tablolarda tenantId sütunlarını NOT NULL yap ve foreign key'leri ekle.

**Değişiklikler:**
- `masraf_kategoriler`: tenant_id eklendi
- `price_cards`: tenant_id ve vat_rate eklendi
- `fatura_kalemleri`: tenant_id eklendi
- `siparis_kalemleri`: tenant_id eklendi
- `work_order_lines`: tenant_id eklendi
- `product_barcodes`: tenant_id eklendi
- `stock_moves`: tenant_id eklendi
- `product_location_stocks`: tenant_id eklendi
- `stock_cost_history`: tenant_id eklendi
- Tüm mevcut tablolarda tenant_id NOT NULL yapıldı

**Risk:** Orta - Veri kaybı yok, ancak foreign key constraint'leri ekleniyor.

### TASK 5: Composite Index'ler

**Amaç:** Yüksek hacimli tablolarda performansı artır.

**Index'ler:**
- `faturalar_tenant_tarih_idx`
- `faturalar_tenant_durum_idx`
- `kasa_hareketler_tenant_kasa_tarih_idx`
- `banka_hesap_hareketler_tenant_hesap_tarih_idx`
- `tahsilatlar_tenant_tarih_idx`
- `audit_logs_tenant_created_idx`
- Ve diğerleri...

**Risk:** Düşük - Sadece index ekliyor, veri değiştirmiyor.

### TASK 6: Çoklu Para Birimi

**Amaç:** Finansal hareket tablolarına çoklu para birimi desteği ekle.

**Değişiklikler:**
- `kasa_hareketler`: currency, exchange_rate, local_amount
- `banka_hesap_hareketler`: currency, exchange_rate, local_amount
- `firma_kredi_karti_hareketler`: currency, exchange_rate, local_amount
- `tahsilatlar`: currency, exchange_rate, local_amount

**Varsayılan:** Tüm mevcut kayıtlar TRY ve 1.0 exchange_rate.

**Risk:** Düşük - Yeni sütunlar ekleniyor, mevcut veri korunuyor.

### TASK 7: Çek/Senet Ciro

**Amaç:** Ciro edilen hesap için düzgün ilişki kur.

**Değişiklikler:**
- `cek_senetler`: `endorsed_account_id` eklendi (foreign key → cariler)
- `ciroEdilen` sütunu verisi yeni alana migrate edildi
- Eşleşmeyen kayıtlar için manuel review gerekli

**Risk:** Orta - Veri migration'ı eşleşme yapmaya çalışıyor, eşleşmeyen kayıtlar manuel kontrol gerektiriyor.

### TASK 8: Float Doğrulaması

**Amaç:** Float sütunlarını doğrula ve raporla.

**Not:** Bu script DEĞİŞİKLİK YAPMIYOR, sadece rapor üretiyor.

**Kontrol edilen tablolar:**
- `fatura_kalemleri`: fiyat, tutar, iskonto
- `price_cards`: fiyat, vat_rate
- `stoklar`: fiyat, alisFiyati
- `kasa_hareketler`: tutar
- `banka_hesap_hareketler`: tutar
- Ve diğerleri...

**Risk:** Yok - Sadece raporlama.

### TASK 9: Marka Normalizasyonu

**Amaç:** Mükerrer markaları birleştir.

**Adımlar:**
1. Mükerrer markaları tespit et
2. `consolidate_duplicate_brands()` fonksiyonunu çalıştır
3. Unique constraint ekle
4. Index'leri oluştur

**Risk:** Yüksek - Veri birleştirme işlemi, fonksiyonu manuel olarak çalıştırın!

**Önemli:** Fonksiyonu çalıştırmadan önce önce mükerrerleri inceleyin:
```sql
SELECT * FROM brand_duplicates;
```

### TASK 10: Kategori Normalizasyonu

**Amaç:** Mükerrer kategorileri birleştir.

**Adımlar:**
1. Mükerrer kategorileri tespit et
2. `consolidate_duplicate_categories()` fonksiyonunu çalıştır
3. Unique constraint ekle
4. Index'leri oluştur

**Risk:** Yüksek - Veri birleştirme işlemi, fonksiyonu manuel olarak çalıştırın!

**Önemli:** Fonksiyonu çalıştırmadan önce önce mükerrerleri inceleyin:
```sql
SELECT * FROM category_duplicates;
```

### TASK 11: Araç Uyumluluk

**Amaç:** Araç uyumluluk alanlarını JSON formatına çevir.

**Değişiklikler:**
- `compatible_years`: JSONB
- `compatible_models`: JSONB
- `compatible_bodies`: JSONB
- Virgülle ayrılmış string'lerden JSON array'lere migration

**Fonksiyonlar:**
- `is_year_compatible()`
- `is_model_compatible()`
- `is_body_compatible()`

**Risk:** Düşük - Veri dönüştürme, kayıp yok.

### TASK 12: Birim Mükerrer Kayıtları

**Amaç:** Mükerrer birimleri birleştir ve standardizasyon ekle.

**Değişiklikler:**
1. Mükerrer birimleri tespit et
2. `consolidate_duplicate_units()` fonksiyonunu çalıştır
3. Unique constraint ekle
4. `standard_unit_id` sütunu ekle
5. Birim standardizasyon mapping'i oluştur

**Risk:** Yüksek - Veri birleştirme işlemi, fonksiyonu manuel olarak çalıştırın!

**Önemli:** Fonksiyonu çalıştırmadan önce önce mükerrerleri inceleyin:
```sql
SELECT * FROM unit_duplicates;
```

### TASK 13: RLS Hazırlığı

**Amaç:** Row-Level Security için hazırlık yap (henüz aktif değil).

**Değişiklikler:**
- RLS helper fonksiyonları oluşturuldu
- RLS için index'ler eklendi
- Audit view oluşturuldu
- Policy template'ler hazırlandı

**NOT:** RLS henüz AKTİF DEĞİL! Sadece hazırlık yapıldı.

**RLS'yi Etkinleştirmek için:**
```sql
-- Her tablo için:
ALTER TABLE faturalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE stoklar ENABLE ROW LEVEL SECURITY;
-- ... vs

-- Policy'leri uygula:
CREATE POLICY tenant_isolation_policy ON faturalar
  FOR ALL TO authenticated
  USING ("tenantId" = current_user_tenant_id() OR is_super_admin())
  WITH CHECK ("TenantId" = current_user_tenant_id() OR is_super_admin());
```

**Risk:** Yok - Sadece hazırlık, RLS henüz aktif değil.

## ✅ Sonraki Adımlar

Migration'ları çalıştırdıktan sonra:

1. **Log'ları İncele**
   ```bash
   cat /tmp/TASK_*.log
   ```

2. **Uygulamayı Test Et**
   - Tüm CRUD işlemlerini test et
   - Multi-tenant izolasyonunu kontrol et
   - Performansı ölç

3. **Database Performansını İzle**
   ```sql
   EXPLAIN ANALYZE SELECT ... -- Sorgu planlarını kontrol et
   ```

4. **Backup'ı Güvenle Sakla**
   - Migration backup dosyasını sakla
   - Geri dönüş senaryosunu planla

5. **RLS Aktifleştirme (Opsiyonel)**
   - TASK 13 notlarını takip et
   - Test ortamında test et
   - Production'a almadan önce tam test

## 🔍 Sorun Giderme

### "Connection refused" Hatası

PostgreSQL sunucusu çalışmıyor:

```bash
# Docker ile
docker ps | grep postgres

# Başlat
docker-compose -f docker-compose.base.yml up -d postgres
```

### "Permission denied" Hatası

Script'e çalıştırma izni ver:

```bash
chmod +x run_all_migrations.sh
```

### "Tenants table not found" Hatası

Multi-tenancy henüz kurulu değil. Önce tenants tablosunu oluşturun.

### Migration Hatası

1. Log dosyasını kontrol et: `/tmp/TASK_*.log`
2. Backup'tan geri dön: `pg_dump -f backup.sql`
3. Hatayı düzelt ve tekrar dene

### Performans Sorunları

Index'lerin oluşturulması zaman alabilir:

```bash
# Index oluşturma progress'ini izle
SELECT query, state, wait_event_type, wait_event 
FROM pg_stat_activity 
WHERE query LIKE '%CREATE INDEX%';
```

## 📝 Notlar

- **Tüm migration'lar idempotent** - Tekrar çalıştırılabilir
- **Her TASK bağımsızdır** - İstenirse tek tek çalıştırılabilir
- **Backup zorunludur** - Önce backup alın, sonra migration çalıştırın
- **Test ortamında test edin** - Production'a almadan önce

## 🆘 Yardım

Sorun yaşarsanız:

1. Log dosyalarını kontrol edin
2. PostgreSQL log'larını inceleyin
3. Backup'tan geri dönün
4. Support ekibi ile iletişime geçin

---

**Son Güncelleme:** 2026-03-08  
**Versiyon:** 1.0  
**Status:** Hazır ve Test Edilmeye Hazır