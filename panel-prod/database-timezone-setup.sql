-- ============================================
-- Türkiye İstanbul Timezone Veritabanı Ayarları
-- ============================================
-- Bu script veritabanı timezone ayarlarını yapılandırır
-- MySQL ve PostgreSQL için örnekler içerir

-- ============================================
-- MySQL için
-- ============================================
-- Global timezone ayarı (tüm bağlantılar için)
SET GLOBAL time_zone = '+03:00';

-- Session timezone ayarı (mevcut bağlantı için)
SET time_zone = '+03:00';

-- Timezone'u kontrol et
SELECT @@global.time_zone, @@session.time_zone;

-- ============================================
-- PostgreSQL için
-- ============================================
-- Timezone ayarı
SET timezone = 'Europe/Istanbul';

-- Timezone'u kontrol et
SHOW timezone;

-- ============================================
-- Mevcut Tarih/Saat Verilerini Güncelleme
-- ============================================
-- NOT: Bu işlemler veritabanı yedeği alındıktan sonra yapılmalıdır
-- 
-- Eğer mevcut veriler UTC'de saklanıyorsa ve Istanbul'a çevirmek istiyorsanız:
-- 
-- MySQL örneği:
-- UPDATE tablo_adi 
-- SET tarih_kolonu = CONVERT_TZ(tarih_kolonu, 'UTC', '+03:00')
-- WHERE tarih_kolonu IS NOT NULL;
--
-- PostgreSQL örneği:
-- UPDATE tablo_adi 
-- SET tarih_kolonu = tarih_kolonu AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul'
-- WHERE tarih_kolonu IS NOT NULL;
--
-- ============================================
-- Yeni Kayıtlar İçin Otomatik Timezone
-- ============================================
-- Yeni kayıtlar otomatik olarak ayarlanan timezone'u kullanacaktır
-- 
-- MySQL'de TIMESTAMP kolonları otomatik olarak timezone'u kullanır
-- DATETIME kolonları timezone bilgisi içermez, uygulama seviyesinde yönetilmelidir
--
-- PostgreSQL'de TIMESTAMP WITH TIME ZONE kolonları otomatik olarak timezone'u kullanır
-- TIMESTAMP WITHOUT TIME ZONE kolonları timezone bilgisi içermez

-- ============================================
-- Kontrol Sorguları
-- ============================================
-- MySQL:
-- SELECT NOW() AS su_an, CONVERT_TZ(NOW(), @@session.time_zone, '+03:00') AS istanbul_zamani;
--
-- PostgreSQL:
-- SELECT NOW() AS su_an, NOW() AT TIME ZONE 'Europe/Istanbul' AS istanbul_zamani;

