---
description: Troubleshooting workflow for common issues
---

# Troubleshooting Workflow

Bu workflow, sık karşılaşılan sorunları çözmek için kullanılır.

## 1. Backend 502 Bad Gateway Hatası

### Adım 1: Container Durumunu Kontrol Et

**MCP Kullan**: `docker-ops-mcp`

// turbo
```bash
docker ps -a
```

Backend container çalışıyor mu?

### Adım 2: Backend Loglarını İncele

**MCP Kullan**: `log-analyzer-mcp`

// turbo
```bash
docker logs --tail 100 compose-backend-staging-1
```

Hata mesajlarını ara:
- TypeScript compilation errors
- Database connection errors
- Redis connection errors
- Missing environment variables

### Adım 3: Backend'i Yeniden Başlat

// turbo
```bash
docker restart compose-backend-staging-1
```

### Adım 4: Health Check

```bash
curl http://localhost:3001/health
```

## 2. Database Connection Error

### Adım 1: PostgreSQL Container Kontrol

// turbo
```bash
docker ps | grep postgres
```

### Adım 2: Database Bağlantısını Test Et

```bash
docker exec -it compose-postgres-1 psql -U postgres -d otomuhasebe -c "SELECT 1;"
```

### Adım 3: DATABASE_URL Kontrol Et

```bash
cat /var/www/.env.staging | grep DATABASE_URL
```

### Adım 4: PostgreSQL'i Yeniden Başlat

```bash
docker restart compose-postgres-1
```

## 3. Redis Connection Error

### Adım 1: Redis Container Kontrol

// turbo
```bash
docker ps | grep redis
```

### Adım 2: Redis Bağlantısını Test Et

```bash
docker exec -it compose-redis-1 redis-cli PING
```

Beklenen yanıt: `PONG`

### Adım 3: REDIS_URL Kontrol Et

```bash
cat /var/www/.env.staging | grep REDIS_URL
```

### Adım 4: Redis'i Yeniden Başlat

```bash
docker restart compose-redis-1
```

## 4. Frontend Build Hatası

### Adım 1: Node Modules Temizle

```bash
cd /var/www/panel-stage/client
rm -rf node_modules package-lock.json
npm install
```

### Adım 2: Next.js Cache Temizle

// turbo
```bash
rm -rf .next
```

### Adım 3: TypeScript Hatalarını Kontrol Et

```bash
npm run build
```

### Adım 4: Dependency Conflict Kontrol

```bash
npm list --depth=0
```

## 5. Tenant Isolation Hatası

### Adım 1: Tenant Context Kontrol

**MCP Kullan**: `tenant-context-mcp`

Tüm tenant'ları listele ve kontrol et

### Adım 2: TenantId Middleware Kontrol

`src/middleware/tenant.middleware.ts` dosyasını kontrol et

### Adım 3: Database Query'lerini İncele

**MCP Kullan**: `db-query-mcp`

Yavaş sorguları bul ve tenantId filtresi olup olmadığını kontrol et

### Adım 4: Code Review

Tüm Prisma query'lerinde `where: { tenantId }` olduğundan emin ol

## 6. Slow Query / Performance Issue

### Adım 1: Yavaş Sorguları Bul

**MCP Kullan**: `db-query-mcp`

1 saniyeden yavaş sorguları listele

### Adım 2: Index Önerilerini Al

**MCP Kullan**: `prisma-schema-mcp`

Index önerilerini kontrol et

### Adım 3: Query Explain Analizi

```bash
docker exec -it compose-postgres-1 psql -U postgres -d otomuhasebe
```

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE tenantId = 'xxx';
```

### Adım 4: Index Ekle

Schema'ya index ekle ve migration oluştur

## 7. Cache Invalidation Sorunu

### Adım 1: Cache İstatistiklerini Kontrol

**MCP Kullan**: `redis-cache-mcp`

### Adım 2: Belirli Key'leri Temizle

```bash
docker exec -it compose-redis-1 redis-cli KEYS "tenant:*:users:*"
```

### Adım 3: Tüm Cache'i Temizle (Dikkatli!)

```bash
docker exec -it compose-redis-1 redis-cli FLUSHDB
```

## 8. Docker Container Restart Loop

### Adım 1: Container Loglarını İncele

```bash
docker logs --tail 200 [container_name]
```

### Adım 2: Container'ı Durdur

```bash
docker stop [container_name]
```

### Adım 3: Sorunlu Kodu Düzelt

### Adım 4: Container'ı Yeniden Başlat

```bash
docker start [container_name]
```

## 9. Migration Hatası

### Adım 1: Migration Durumunu Kontrol

```bash
cd /var/www/api-stage/server
npx prisma migrate status
```

### Adım 2: Pending Migration'ları Uygula

```bash
npx prisma migrate deploy
```

### Adım 3: Migration Conflict Çöz

```bash
npx prisma migrate resolve --applied [migration_name]
```

## 10. JWT Authentication Hatası

### Adım 1: JWT Secret Kontrol

```bash
cat /var/www/.env.staging | grep JWT_SECRET
```

### Adım 2: Token Expiry Kontrol

Backend'de token expiry ayarlarını kontrol et

### Adım 3: Cookie/Header Kontrol

Browser DevTools'da cookie ve authorization header'ı kontrol et

## ✅ Genel Troubleshooting Checklist

- [ ] Container'lar çalışıyor mu?
- [ ] Log'larda hata var mı?
- [ ] Environment variables doğru mu?
- [ ] Database bağlantısı çalışıyor mu?
- [ ] Redis bağlantısı çalışıyor mu?
- [ ] Migration'lar uygulandı mı?
- [ ] Cache temizlendi mi?
- [ ] Dependency'ler güncel mi?
- [ ] TypeScript hataları var mı?
- [ ] Tenant isolation sağlanıyor mu?
