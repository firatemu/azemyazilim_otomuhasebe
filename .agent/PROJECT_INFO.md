# Otomuhasebe Projesi - Detaylı Bilgilendirme

## 📋 Proje Hakkında

**Proje Adı:** Otomuhasebe  
**Tip:** Multi-Tenant SaaS ERP Sistemi  
**Sektör:** Muhasebe ve İşletme Yönetimi  
**Mimari:** Microservices (Docker Compose)

### Temel Özellikler
- Multi-tenant (çoklu kiracı) yapı
- Tenant izolasyonu (her firma kendi veritabanı alanında)
- Subdomain bazlı tenant yönlendirme
- Role-based access control (RBAC)
- Real-time cache (Redis)
- Background job processing (BullMQ)

---

## 🏗️ Proje Yapısı

### Ortamlar
- **Staging:** Test ve geliştirme ortamı
- **Production:** Canlı ortam

### Ana Servisler
1. **Backend API** (NestJS)
   - Staging: `compose-backend-staging-1`
   - Production: `compose-backend-prod-1`
   - Port: 3000 (staging), 3001 (production)

2. **User Panel** (Next.js)
   - Staging: `compose-user-panel-staging-1`
   - Production: `compose-user-panel-prod-1`
   - Port: 3002 (staging), 3003 (production)

3. **Admin Panel** (Next.js)
   - Staging: `compose-admin-panel-staging-1`
   - Production: `compose-admin-panel-prod-1`

4. **Landing Page** (Next.js)
   - Staging: `compose-landing-page-staging-1`
   - Production: `compose-landing-page-prod-1`

5. **Altyapı Servisleri**
   - PostgreSQL: `otomuhasebe-postgres`
   - Redis: `otomuhasebe-redis`
   - Caddy (Reverse Proxy): `otomuhasebe-caddy`

---

## 💻 Teknoloji Stack'i

### Backend (NestJS)
```json
{
  "framework": "NestJS 11.1.8",
  "language": "TypeScript 5.9.3",
  "orm": "Prisma 6.18.0",
  "database": "PostgreSQL",
  "cache": "Redis 4.7.1",
  "queue": "BullMQ 5.41.6",
  "auth": "JWT (Passport)",
  "validation": "class-validator, class-transformer",
  "security": "Helmet, Throttler",
  "email": "Nodemailer",
  "pdf": "PDFMake",
  "excel": "ExcelJS",
  "compression": "compression"
}
```

**Önemli Backend Paketleri:**
- `@nestjs/common`, `@nestjs/core` - NestJS core
- `@nestjs/jwt`, `@nestjs/passport` - Authentication
- `@nestjs/schedule` - Cron jobs
- `@nestjs/throttler` - Rate limiting
- `@prisma/client` - Database ORM
- `bcrypt` - Password hashing
- `axios` - HTTP client
- `strong-soap` - SOAP client (entegrasyonlar için)

### Frontend (Next.js)
```json
{
  "framework": "Next.js 15.x",
  "language": "TypeScript",
  "ui": "Material UI (MUI) v7",
  "forms": "react-hook-form + Zod",
  "state": "TanStack Query (React Query)",
  "notifications": "Notistack",
  "http": "Axios",
  "icons": "Lucide React, MUI Icons"
}
```

**Önemli Frontend Paketleri:**
- `@mui/material`, `@mui/icons-material` - UI components
- `react-hook-form` - Form yönetimi
- `zod` - Schema validation
- `@tanstack/react-query` - Server state management
- `notistack` - Toast notifications
- `axios` - API client

### Database & Cache
- **PostgreSQL:** Ana veritabanı
- **Redis:** Cache ve session yönetimi
- **Prisma:** ORM ve migration tool

### DevOps & Infrastructure
- **Docker & Docker Compose:** Containerization
- **Caddy:** Reverse proxy ve SSL
- **Git:** Version control

---

## 🔧 Geliştirilen 10 MCP Sunucusu

### 1. Prisma Schema MCP
**Amaç:** Prisma şema yönetimi ve analizi  
**Özellikler:**
- Schema analizi (model sayısı, ilişkiler)
- Model ilişkilerini görüntüleme
- Index önerileri
- Model listesi

**Kullanım Alanları:**
- Veritabanı şemasını hızlıca anlamak
- Eksik index'leri tespit etmek
- Model ilişkilerini görselleştirmek

---

### 2. Docker Operations MCP
**Amaç:** Docker konteyner yönetimi  
**Özellikler:**
- Konteyner durum kontrolü
- Hızlı restart
- Log izleme
- Kaynak kullanımı (CPU, RAM)
- Sağlık kontrolü

**Kullanım Alanları:**
- Servisleri yeniden başlatmak
- Log'ları hızlıca kontrol etmek
- Kaynak kullanımını monitör etmek

---

### 3. Database Query Helper MCP
**Amaç:** Veritabanı sorgu optimizasyonu  
**Özellikler:**
- SQL → Prisma çevirici
- Yavaş sorgu analizi
- Query execution plan
- Veritabanı backup
- Tablo istatistikleri

**Kullanım Alanları:**
- SQL sorgularını Prisma'ya çevirmek
- Performans sorunlarını tespit etmek
- Backup almak

---

### 4. Multi-Tenant Context MCP
**Amaç:** Multi-tenant yapı yönetimi  
**Özellikler:**
- Tenant listesi
- Tenant detayları
- Tenant veri sayıları
- İzolasyon testi
- Aktivite takibi

**Kullanım Alanları:**
- Tenant'ları yönetmek
- Veri izolasyonunu test etmek
- Tenant aktivitelerini izlemek

---

### 5. API Testing & Documentation MCP
**Amaç:** API test ve dokümantasyon  
**Özellikler:**
- Endpoint keşfi (controller tarama)
- Endpoint testi
- Sağlık kontrolü
- Postman collection oluşturma

**Kullanım Alanları:**
- API endpoint'lerini test etmek
- Postman collection oluşturmak
- API sağlığını kontrol etmek

---

### 6. Frontend Component Generator MCP
**Amaç:** Frontend component otomasyonu  
**Özellikler:**
- CRUD sayfa üretici (Material UI)
- Form component (react-hook-form + Zod)
- TanStack Query hooks
- TypeScript type tanımları

**Kullanım Alanları:**
- Yeni CRUD sayfaları oluşturmak
- Form component'leri üretmek
- Boilerplate koddan kaçınmak

---

### 7. Deployment & CI/CD MCP
**Amaç:** Deployment otomasyonu  
**Özellikler:**
- Servis deploy
- Rollback
- Deployment durumu

**Kullanım Alanları:**
- Servisleri deploy etmek
- Deployment durumunu kontrol etmek

---

### 8. Log Analyzer MCP
**Amaç:** Log analizi  
**Özellikler:**
- Hata bulma
- Performans analizi
- Güvenlik taraması

**Kullanım Alanları:**
- Hataları hızlıca bulmak
- Performans sorunlarını tespit etmek
- Güvenlik loglarını taramak

---

### 9. Redis Cache Manager MCP
**Amaç:** Cache yönetimi  
**Özellikler:**
- Cache istatistikleri
- Cache temizleme
- Key okuma

**Kullanım Alanları:**
- Cache'i yönetmek
- Cache istatistiklerini görmek
- Belirli key'leri temizlemek

---

### 10. Email Template Manager MCP
**Amaç:** Email şablon yönetimi  
**Özellikler:**
- Şablon oluşturma (welcome, reset-password, invoice)
- Şablon önizleme

**Kullanım Alanları:**
- Email şablonları oluşturmak
- Şablonları önizlemek

---

## 📁 Dizin Yapısı

```
/var/www/
├── api-stage/server/          # Backend staging
├── api-prod/server/           # Backend production
├── panel-stage/client/        # User panel staging
├── panel-prod/client/         # User panel production
├── admin-stage/               # Admin panel staging
├── admin-otomuhasebe/         # Admin panel production
├── otomuhasebe-landing/       # Landing page
├── docker/                    # Docker configs
├── .mcp-servers/              # MCP sunucuları
│   ├── prisma-schema-mcp/
│   ├── docker-ops-mcp/
│   ├── db-query-mcp/
│   ├── tenant-context-mcp/
│   ├── api-docs-mcp/
│   ├── component-gen-mcp/
│   ├── deployment-mcp/
│   ├── log-analyzer-mcp/
│   ├── redis-cache-mcp/
│   └── email-template-mcp/
└── docker-compose.yml
```

---

## 🎯 Geliştirme Workflow'u

1. **Backend Geliştirme:**
   - NestJS modülleri oluştur
   - Prisma schema güncelle
   - Migration çalıştır
   - Controller/Service/DTO yaz
   - Validation ekle

2. **Frontend Geliştirme:**
   - Material UI component'leri kullan
   - react-hook-form + Zod ile form oluştur
   - TanStack Query ile API entegrasyonu
   - Type-safe development (TypeScript)

3. **Testing:**
   - API endpoint'leri test et
   - Multi-tenant izolasyonu kontrol et
   - Log'ları incele

4. **Deployment:**
   - Docker container'ları yeniden başlat
   - Health check yap
   - Log'ları izle

---

## 🔑 Önemli Notlar

### Multi-Tenant Yapı
- Her tenant'ın kendi `tenantId`'si var
- Tüm Prisma sorgularında `tenantId` filtresi zorunlu
- Middleware ile tenant context yönetimi
- Subdomain bazlı tenant çözümleme

### Güvenlik
- JWT authentication
- Role-based access control
- Rate limiting (Throttler)
- Helmet security headers
- Password hashing (bcrypt)

### Performans
- Redis cache
- Database indexing
- Query optimization
- Compression middleware

### Kod Standartları
- TypeScript strict mode
- ESLint + Prettier
- Class-validator ile validation
- DTO pattern
- Service layer pattern

---

Bu bilgiler ışığında `.agent/rules/` veya skill dosyanız için öneriler:

1. **Proje context'i** her zaman hatırlanmalı
2. **Multi-tenant** yapıya özel kurallar
3. **MCP kullanımı** için kısayollar
4. **Kod standartları** ve best practices
5. **Teknoloji stack'e** özel yönergeler
