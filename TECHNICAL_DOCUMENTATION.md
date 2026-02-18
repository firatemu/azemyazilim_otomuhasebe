# Otomuhasebe Teknik Dökümantasyon

Bu döküman, Otomuhasebe projesinin teknoloji yığını, mimari yapısı, Docker konfigürasyonu ve operasyonel süreçleri hakkında kapsamlı bilgiler içermektedir.

---

## 1. Proje Genel Bakış
Otomuhasebe, mikroişletmeler ve KOBİ'ler için geliştirilmiş, **Multi-tenant (Çoklu Kiracılı)** yapıda bir ERP/SaaS platformudur. Sistem; finansal yönetim, stok takibi, faturalandırma ve raporlama gibi temel muhasebe süreçlerini modernize etmeyi hedefler.

---

## 2. Teknoloji Yığını (Tech Stack)

### 2.1. Backend (Sunucu Tarafı)
- **Framework:** [NestJS](https://nestjs.com/) (v11) - Verimli, ölçeklenebilir Node.js sunucu tarafı uygulamaları için.
- **Dil:** TypeScript
- **ORM:** [Prisma](https://www.prisma.io/) - Tip güvenli veritabanı erişimi.
- **Veritabanı:** PostgreSQL (v16) - İlişkisel veritabanı.
- **Önbellek (Cache):** Redis (v7) - Performans ve oturum yönetimi.
- **Kimlik Doğrulama:** JWT (JSON Web Token) & Passport.js.
- **Öne Çıkan Kütüphaneler:**
  - `ExcelJS` & `PDFMake`: Dinamik rapor ve belge oluşturma.
  - `Nodemailer`: E-posta gönderimi.
  - `Throttler`: API Rate Limiting.

### 2.2. Frontend (Arayüz Tarafı)
Sistem üç ana arayüzden oluşur:

#### A. Kullanıcı Paneli (User Panel)
- **Framework:** [Next.js](https://nextjs.org/) (v16)
- **UI Kütüphanesi:** Material UI (MUI) v7
- **Veri Yakalama:** TanStack Query (React Query)
- **Özellikler:** Dashboard, stok yönetimi, cari takibi, raporlama.

#### B. Yönetim Paneli (Admin Panel)
- **Framework:** React (v19) + [Vite](https://vitejs.dev/)
- **UI Kütüphanesi:** Material UI (MUI) v7
- **Durum Yönetimi:** Zustand
- **Veri Yakalama:** TanStack Query

#### C. Karşılama Sayfası (Landing Page)
- **Framework:** Next.js (v16)
- **Styling:** TailwindCSS v4
- **Animasyon:** Framer Motion

---

## 3. Altyapı ve Docker Yapısı

Sistem tamamen konteynerize edilmiş olup Docker Compose ile yönetilmektedir.

### 3.1. Servisler ve Konteynerler
Sistemde aşağıdaki konteynerler aktif olarak rol alır:

1.  **`caddy`**: Reverse proxy ve SSL yönetimi (Let's Encrypt). Tüm trafiği karşılar ve ilgili servislere dağıtır.
2.  **`postgres`**: Ana veritabanı sunucusu.
3.  **`redis`**: Geçici veri depolama ve önbellekleme.
4.  **`backend`**: İş mantığını yürüten NestJS API uygulaması.
5.  **`user-panel`**: Müşterilerin kullandığı ana arayüz.
6.  **`admin-panel`**: Platform yöneticileri için yönetim arayüzü.
7.  **`landing-page`**: Tanıtım ve kayıt sayfası.

### 3.2. Docker Compose Yapılandırması
Konfigürasyon, modüler bir yapıda üç farklı dosyada tutulur:
- `docker-compose.base.yml`: Tüm servislerin ortak ayarları (imajlar, network, volume).
- `docker-compose.staging.yml`: Test ortamı spesifik ayarları.
- `docker-compose.prod.yml`: Canlı ortam (Production) ayarları ve optimizasyonları.

---

## 4. Mimari Özellikler

### 4.1. Multi-Tenancy (Çoklu Kiracılık)
Platform, "Database-per-tenant" veya "Schema-per-tenant" yerine, ortak veritabanı üzerinde **Tenant Isolation (Kiracı İzolasyonu)** prensibiyle çalışır.
- Her istekte `TenantMiddleware` devreye girerek subdomain veya header üzerinden kiracıyı (tenant) tespit eder.
- Prisma üzerinden yapılan tüm sorgular bu kiracı ID'si ile filtrelenir.

### 4.2. Reverse Proxy ve Yönlendirme
**Caddy** sunucusu, gelen isteklere göre yönlendirme yapar:
- `app.otomuhasebe.com` -> `user-panel`
- `admin.otomuhasebe.com` -> `admin-panel`
- `api.otomuhasebe.com` -> `backend`
- `otomuhasebe.com` -> `landing-page`

---

## 5. Operasyonel Süreçler (DevOps)

### 5.1. Dağıtım (Deployment)
Sistemde otomatize edilmiş dağıtım betikleri bulunur:
- `deploy-production.sh`: Canlı ortama geçiş sürecini yönetir (Yedekleme -> Build -> Migration -> Update).
- `Makefile`: Sık kullanılan komutları (`up`, `down`, `logs`, `migrate`) standartlaştırır.

### 5.2. Veritabanı Migrasyonları
Prisma kullanılarak şema değişiklikleri yönetilir:
```bash
npx prisma migrate deploy
```
Bu komut, dağıtım sırasında Docker konteyneri içerisinde otomatik olarak çalıştırılır.

### 5.3. Yedekleme (Backup)
Sistemde günlük veritabanı yedekleme mekanizması (`pg_dump`) mevcuttur ve yedekler `/var/www/backups` dizininde saklanır.

---

## 6. Güvenlik ve Performans
- **SSL:** Caddy aracılığıyla HTTPs zorunluluğu ve otomatik sertifika yönetimi.
- **Güvenlik Başlıkları:** HSTS, Content-Security-Policy (CSP), X-Frame-Options yapılandırmaları.
- **Rate Limiting:** API tarafında brute-force ataklarına karşı sınırlama.
- **Gzip/Zstd:** Trafik sıkıştırma ile daha hızlı sayfa yüklemeleri.

---
**Döküman Tarihi:** 31 Ocak 2026
