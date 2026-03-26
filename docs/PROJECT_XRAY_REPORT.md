# OtoMuhasebe — Proje Röntgen Raporu

Bu doküman, `otomuhasebe` kod tabanının amacını, ana bileşenlerini, çalışma şeklini, backend/DB mimarisini, kullanılan teknolojileri ve yerel geliştirme akışını **tek bir yerde** toplar.

> Kapsam: Repo içinde görülen ana uygulamalar `api-stage/server` (backend), `panel-stage/client` (panel), `b2b-portal` (B2B portal) ve `infra/compose` (Docker Compose).

> Not: Bu rapor “yüksek seviye özet”in ötesine geçer; akış diyagramları, modül envanteri, env/konfig haritası, yerel çalışma senaryoları ve operasyonel checklist içerir.

---

## 1) Ürün amacı ve problem tanımı

**OtoMuhasebe**, çok kiracılı (multi-tenant) bir ERP/SaaS uygulamasıdır. Otomotiv servis ve ticari operasyonlarına yönelik:

- **Finans & muhasebe**: cari hesaplar, tahsilat/ödeme, kasa, banka, çek/senet
- **Satış & satın alma**: fatura, sipariş, irsaliye, teklifler, satış temsilcisi
- **Stok & ürün**: ürün, barkod, hareketler, sayım, fiyat kartları/listeleri
- **İK**: personel, maaş plan/ödemeleri, avans
- **Servis**: iş emirleri, araçlar, parça talepleri, servis faturaları
- **B2B**: müşteri/ürün/kampanya/sipariş/kargo/reklam/raporlama + portal erişimleri

Hedef: tek bir backend ve ortak veri modeli üzerinde birden fazla UI ile (panel + B2B portal + POS) işletmenin operasyonlarını uçtan uca yönetmek.

---

## 2) Repo bileşenleri (yüksek seviye)

- **Backend (API)**: `api-stage/server`
  - NestJS tabanlı REST API
  - Prisma ORM + PostgreSQL
  - Redis (cache / session / queue)
  - MinIO (S3 uyumlu dosya saklama)
  - BullMQ (job queue)

- **Ana panel (UI)**: `panel-stage/client`
  - Next.js App Router
  - MUI (Material UI), Zustand, React Query
  - `/api/*` istekleri için Node.js runtime proxy route’ları (CORS/yerel proxy kolaylığı)

- **B2B Portal (UI)**: `b2b-portal`
  - Next.js tabanlı portal uygulaması

- **Docker/Infra**: `infra/compose`
  - Development/staging/prod compose dosyaları ve servis topolojileri

---

## 2.1) Klasör yapısı (kısa harita)

Aşağıdaki harita, “ne nerede?” sorusuna hızlı cevap verir:

- `api-stage/server/`
  - `src/`: NestJS kaynak kodu (modüller, common altyapı)
  - `prisma/`: Prisma schema + seed/migration yardımcıları
  - `dist/`: build çıktısı (Docker/host sahiplik sorunlarına dikkat)
  - `.env`, `.env.staging`: çalışma ortamı ayarları
- `panel-stage/client/`
  - `src/app/`: Next.js App Router sayfaları ve API route’ları
  - `src/components/`: UI bileşenleri (Layout, ortak component’ler, B2B admin UI)
  - `next.config.ts`: Next yapılandırması (PWA, build davranışları)
  - `.env.local`: panel yerel ayarları (proxy hedefi vb.)
- `b2b-portal/`
  - B2B portal UI uygulaması (compose içinde servis olarak da tanımlı)
- `infra/compose/`
  - `docker-compose.dev.yml`: yerel dev topolojisi (postgres/redis/minio/backend/panel/b2b-portal)

---

## 3) Çalışma prensibi: istek akışı ve tenant izolasyonu

### 3.1 Tenant (kiracı) çözümleme

Backend tarafında tenant izolasyonunun omurgası `TenantMiddleware`’dir:

- İsteklerden `x-tenant-id` başlığını okuyabilir.
- `Authorization: Bearer <token>` içinden tenantId taşıyan JWT payload’ı kullanabilir.
- Staging/development ortamlarında, tenant bulunamazsa “default tenant” fallback’i yapabilir.

Kaynak: `api-stage/server/src/common/middleware/tenant.middleware.ts`

### 3.2 Global API prefix + Swagger

Backend `main.ts` içinde:

- `app.setGlobalPrefix('api')` ile tüm endpoint’ler `/api/...` altında
- Swagger UI: `/api-docs`

Kaynak: `api-stage/server/src/main.ts`

---

## 3.3 İstek akışı (Panel → Backend) — temel mimari diyagram

Panelin `/api/*` üzerinden backend’e ulaşması hedeflenir (CORS/tek base path).

```mermaid
flowchart LR
  U[Tarayıcı] -->|HTTP (Same Origin)| P[panel-stage/client\nNext.js]
  P -->|Server-side proxy\n/api/*| B[api-stage/server\nNestJS API]
  B -->|Prisma| DB[(PostgreSQL)]
  B -->|Cache/Session/Queue| R[(Redis)]
  B -->|Object Storage| M[(MinIO / S3)]
```

---

## 4) Backend mimarisi (NestJS)

### 4.1 Modül yapısı

Backend, NestJS’in “Module → Controller → Service → DTO” yaklaşımıyla bölümlenmiştir.

Örnek modüller (tam liste repo içinde geniştir):
- Auth, Tenants, Users, Roles/Permissions
- Invoice, Collection, Cashbox, Bank, CheckBill
- Product, Warehouse, InventoryCount, PriceCard/PriceList
- WorkOrder, ServiceInvoice, PartRequest
- B2B (portal + admin)

### 4.2 Güvenlik katmanları

Genel yaklaşım:
- JWT tabanlı doğrulama (auth modülü)
- Tenant izolasyonu (`TenantMiddleware` + servislerde tenant filtreleri)
- Rate-limit/Throttle (ThrottlerModule)
- Helmet + compression (HTTP güvenliği/perf)

---

### 4.3 Backend “common” katmanı (çekirdek altyapı)

`api-stage/server/src/common/` altında tipik olarak şu parçalar bulunur:

- **Middleware**: tenant çözümleme (`TenantMiddleware`)
- **Guards**: JWT guard’ları, role/permission guard’ları, modül erişim guard’ları, B2B license guard
- **Filters**: HTTP/Prisma/AllExceptions filtreleri (hata standardizasyonu)
- **Interceptors**: logging ve timeout benzeri cross-cutting işler
- **Services**: PrismaService, RedisService, TenantResolverService, LicenseService, cache servisleri

Bu katman, tüm modüllerin ortak standarda uymasını sağlar.

### 4.4 B2B ve ERP auth ayrımı (neden var?)

Projede iki farklı “kimlik” akışı görülür:

- **ERP / Panel kullanıcıları**: `/api/auth/*` (ör. `/api/auth/login`) üzerinden token alır.
- **B2B portal kullanıcıları**: domain + claim guard’ları ile kısıtlanır (B2B JWT secret farklılaştırılabilir).

Bu ayrımın ana sebepleri:
- B2B portalda domain tabanlı tenant çözümleme (B2B domain → tenant)
- B2B kullanıcı rollerinin ERP kullanıcı rollerinden farklı iş kuralları

---

## 5) Veri katmanı: Prisma + PostgreSQL

### 5.1 Prisma

- Prisma client: `@prisma/client`
- Schema: `api-stage/server/prisma/schema.prisma`

Repo genelinde veri modeli multi-tenant olacak şekilde genişletilmiş görünür. `Tenant` modeli çok sayıda ilişkiyi taşır; B2B tarafı için ayrıca `B2BLicense`, `B2BTenantConfig`, `B2BDomain`, `B2BProduct`, `B2BOrder` vb. modeller bulunur.

### 5.2 Çok kiracılı tasarım izleri

Tenant tablosu ve ilişkiler:
- `Tenant` modeli, hem ERP çekirdek modellerini hem de B2B model grubunu ilişkilendirir.
- Index ve map’ler (örn. `@@map("tenants")`) ile DB isimlendirme ve performans hedeflenir.

Kaynak: `api-stage/server/prisma/schema.prisma`

---

### 5.3 B2B veri modeli (yüksek seviye)

Prisma schema içinde B2B için ayrık bir model grubu bulunur. Tenant ilişkisi üst modelden akar:

- **Lisans & Konfig**: `B2BLicense`, `B2BTenantConfig`, `B2BDomain`
- **Katalog**: `B2BProduct`, `B2BStock`, `B2BWarehouseConfig`
- **Müşteri & satış**: `B2BCustomer`, `B2BCustomerClass`, `B2BSalesperson`
- **Kampanya**: `B2BDiscount`
- **Sepet & sipariş**: `B2BCart`, `B2BCartItem`, `B2BOrder`, `B2BOrderItem`, `B2BDeliveryMethod`
- **İletişim**: `B2BNotification`, `B2BAdvertisement`
- **Finans**: `B2BAccountMovement`

Bu, B2B’nin ERP core’dan bağımsız ekranlar sunmasını ama aynı tenant çatısı altında çalışmasını sağlar.

---

## 6) B2B altyapısı (Backend + UI)

### 6.1 B2B portal backend modülü

`B2bPortalModule`:
- Portal auth / catalog / cart / order / advertisements / account / notifications / salesperson controller’larını içerir.
- JWT secret’ı `B2B_JWT_SECRET` üzerinden override edilebilir.

Kaynak: `api-stage/server/src/modules/b2b-portal/b2b-portal.module.ts`

### 6.2 B2B lisans kontrolü

B2B endpoint’leri, tenant bazlı bir lisans kontrolü ile korunur:

- Guard: `B2BLicenseGuard`
- Cache: `B2bLicenseCacheService` (Redis, TTL=300s)
- DB: `b2BLicense` tablosu (`tenantId` üzerinden)

Kaynak:
- `api-stage/server/src/common/guards/b2b-license.guard.ts`
- `api-stage/server/src/common/services/b2b-license-cache.service.ts`

> Not (Geliştirme): Yerel geliştirmede lisans kontrolünü “dev modunda bypass” etmek istiyorsanız bu, backend tarafında açıkça kurgulanmış bir env-flag ile yapılmalıdır (örn. `B2B_ENABLED=false`). Repo içinde farklı compose/env dosyalarında B2B flag’leri bulunabildiği için ekipçe tek bir standart belirlenmesi önerilir.

---

### 6.3 B2B Admin UI (Panel) — sayfa envanteri

Panel tarafında “B2B Yönetimi” altında şu sayfalar görünür:

- `/b2b-admin` — özet/landing
- `/b2b-admin/settings` — domain / lisans / görünüm ayarları
- `/b2b-admin/customers` ve `/b2b-admin/customers/[id]` — müşteri listesi + detay + FIFO preview
- `/b2b-admin/customer-classes` — müşteri sınıfları
- `/b2b-admin/salespersons` — plasiyer yönetimi
- `/b2b-admin/products` — ürün görünürlük + görsel
- `/b2b-admin/discounts` — indirim/kampanya
- `/b2b-admin/orders` — siparişler
- `/b2b-admin/delivery-methods` — teslimat yöntemleri
- `/b2b-admin/advertisements` — banner/popup vb.
- `/b2b-admin/reports` — raporlar
- `/b2b-admin/sync` — senkron durumları

Bu sayfalar genelde backend tarafındaki `/api/b2b-admin/*` endpoint’lerine bağlanır.

---

## 7) Frontend (Panel): Next.js + MUI

### 7.1 Teknoloji seti

`panel-stage/client/package.json` üzerinden görülen ana parçalar:
- Next.js (App Router)
- React 19
- MUI (Material UI) + DataGrid + Date Pickers
- Zustand (state)
- React Query (server state)
- Axios (HTTP)
- next-pwa (PWA caching)

### 7.2 API erişimi / proxy

Panel tarafında tarayıcıdan doğrudan backend’e CORS ile gitmek yerine, `/api/*` altından **server-side proxy** yaklaşımı kullanılır. Böylece:
- CORS problemi azalır
- Token/cookie yönetimi daha kontrollü olur
- Tek bir base path (`/api/...`) ile çağrı standardize edilir

Not: Repo içinde hem Next config hem de route handler tabanlı proxy desenleri görülebilir; proje standardı “tek yerden proxy” olacak şekilde sade tutulmalıdır.

---

### 7.3 Panel authentication (oturum) — pratik akış

Login ekranında tipik akış:

1) UI → `POST /api/auth/login` (proxy üzerinden backend’e gider)  
2) Backend → `accessToken`, `refreshToken`, `user` döner  
3) UI → `/api/auth/cookies` route’u ile cookie set eder  
4) UI → `/dashboard` yönlendirme

Bu modelin iki amacı vardır:
- Token’ları sunucu tarafı cookie ile taşımak (SSR/hydration uyumu)
- Client-side state (Zustand) ile hızlı UI tepkisi

---

## 8) Docker ve yerel geliştirme

### 8.1 Dev compose topolojisi

`infra/compose/docker-compose.dev.yml` ile görülen servisler:
- Postgres (`5433:5432`)
- Redis (`127.0.0.1:6379`)
- MinIO (`9000`, `9001`)
- Backend (container) `backend-staging` → host `3020`
- Panel (container) `user-panel-staging` → host `3010`
- B2B portal (container) `b2b-portal` → host `3002`

Kaynak: `infra/compose/docker-compose.dev.yml`

### 8.2 Önerilen yerel çalıştırma (Docker ile)

```bash
cd infra/compose
docker compose -f docker-compose.dev.yml up -d
```

Sonrasında:
- Panel: `http://localhost:3010`
- Backend: `http://localhost:3020/api`
- Swagger: `http://localhost:3020/api-docs`
- MinIO Console: `http://localhost:9001`
- B2B portal: `http://localhost:3002`

---

### 8.3 Yerel geliştirme — “tek kaynak Docker” prensibi (öneri)

Bu repoda hem:
- host üzerinde `npm run dev` çalıştırma
- hem de compose ile container içinde çalıştırma

görülebiliyor. En stabil yerel akış genelde şudur:

- Dev ortamı **tamamen compose ile** ayağa kaldır.
- Panel ve backend için **tek port seti** kullan (3010/3020/3002).
- Host üzerindeki aynı portu kullanan süreçleri minimize et.

---

## 8.4 Konfigürasyon (env) haritası — kritik değişkenler

### Backend (`api-stage/server/.env`)

Sık kullanılanlar:
- `NODE_ENV`: `development` / `staging` / `production`
- `PORT`: backend portu
- `DATABASE_URL`: PostgreSQL bağlantısı
- `REDIS_URL`
- `MINIO_*`: MinIO endpoint/keys/bucket
- `JWT_SECRET` (+ varsa `JWT_ACCESS_SECRET`)
- `CORS_ORIGINS`: izinli origin listesi
- `STAGING_DEFAULT_TENANT_ID`: tenant fallback
- (B2B) `B2B_JWT_SECRET`, `B2B_ENABLED` (takım standardına göre)

### Panel (`panel-stage/client/.env.local`)

- `API_PROXY_TARGET`: panelin proxy ettiği backend hedefi (örn. `http://127.0.0.1:3022` veya compose içi hostname)

---

## 9) Operasyonel notlar (gözlemler)

- **Port çakışmaları**: WSL/host üzerinde 3010/3020 gibi portlar sıkça dolu olabilir. Compose ile standardize etmek, “tek kaynak” üzerinden çalıştırmak (container) işleri kolaylaştırır.
- **Build artifact izinleri**: `api-stage/server/dist` gibi klasörler bazen root sahipliği ile kalabilir. Docker ile çalışırken volume sahipliği/UID eşleştirmesi önemlidir.
- **Multi-tenant header standardı**: `x-tenant-id` üzerinden tenant seçim akışı belirgin; entegrasyon yapan istemcilerin bu standardı taşıması gerekir.

---

### 9.1 Sık karşılaşılan sorunlar (Troubleshooting)

- **504 Gateway Timeout (Panel → /api/***)**
  - Proxy hedefi (API) ayakta değil veya yanlış port/hostname.
  - Çözüm: backend health check + `API_PROXY_TARGET` doğrulaması.
- **`ERR_CONTENT_DECODING_FAILED`**
  - Proxy + compression header uyumsuzluğu (gzip header’ı yanlış taşınırsa).
  - Çözüm: proxy response header’larında `content-encoding/content-length` normalize etmek.
- **B2B “module license is not active”**
  - DB’de `B2BLicense` aktif değil veya guard bypass/flag yanlış.
  - Çözüm: tenantId’nin doğru çözüldüğünü doğrula, lisans kaydını/flag’i kontrol et, Redis cache TTL’i nedeniyle gecikme olabileceğini unutma.
- **`EACCES` / dist izin hataları**
  - Host↔container volume sahiplik problemi.
  - Çözüm: dev akışını tamamen Docker ile standardize et veya UID/GID eşlemesini düzelt.

---

## 10) Sözlük (kısaltmalar)

- **ERP**: Enterprise Resource Planning
- **SaaS**: Software as a Service
- **B2B**: Business-to-business portal ve yönetim modülü
- **RLS**: Row Level Security (repo dokümantasyonunda geçebilir)

---

## 11) Test stratejisi (mevcut durum + öneri)

Backend tarafında Jest ile unit test’ler bulunur:

- `api-stage/server` → `npm test`

Önerilen katmanlar:

- **Unit**: Prisma mock (DB’ye vurmaz)
- **Integration**: Docker PostgreSQL ile ayrı test DB
- **E2E**: API için Supertest, UI için Playwright

---

## 12) Güvenlik ve uyumluluk (kontrol listesi)

- **Tenant izolasyonu**: tüm DB sorguları tenant bazlı filtrelenmeli.
- **Soft delete**: `deletedAt: null` filtreleri standardize edilmeli.
- **PII**: log’larda hassas veri maskeleme.
- **JWT**: her korumalı endpoint’te doğrulama; refresh akışı.
- **Dosya upload**: MinIO bucket policy + path traversal koruması.

---

## Ek: Teknoloji envanteri (kısa)

### Backend (`api-stage/server`)
- NestJS 11, Express 5
- Prisma 6 + PostgreSQL
- Redis 4
- BullMQ
- MinIO
- Swagger/OpenAPI
- Jest (unit tests)

### Panel (`panel-stage/client`)
- Next.js 16, React 19
- MUI 7 + DataGrid
- Zustand, React Query
- Axios
- PWA (next-pwa)

