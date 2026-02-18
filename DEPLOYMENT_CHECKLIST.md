# 🚀 Production Deployment Checklist

## ✅ Ön Hazırlık (ZORUNLU)

### 1. Environment Değişkenleri
`.env.production` dosyasında şunlar **mutlaka** olmalı:

```bash
# Redis (BullMQ için)
REDIS_HOST=redis
REDIS_PORT=6379

# S3 Backup (opsiyonel ama önerilen)
S3_BUCKET=otomuhasebe-backups
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=eu-central-1
```

### 2. Temiz Build + Deploy

```bash
cd /var/www

# Servisleri durdur
docker compose \
  --env-file docker/compose/.env.production \
  -f docker/compose/docker-compose.base.yml \
  -f docker/compose/docker-compose.prod.yml \
  down

# Backend'i rebuild et (BullMQ paketleri için)
docker compose \
  --env-file docker/compose/.env.production \
  -f docker/compose/docker-compose.base.yml \
  -f docker/compose/docker-compose.prod.yml \
  build backend

# Tüm servisleri başlat
docker compose \
  --env-file docker/compose/.env.production \
  -f docker/compose/docker-compose.base.yml \
  -f docker/compose/docker-compose.prod.yml \
  up -d
```

---

## 🔍 Kritik Testler (BUNLAR GEÇMEDEN CANLIYA GÜVENME)

### Test 1: Log Kontrolü (İlk 5 Dakika)

```bash
docker logs otomuhasebe-backend-prod --tail=200 -f
```

**Aradığınız şeyler:**
- ✅ `Redis connected` veya `BullMQ initialized`
- ✅ `Application started on port 3000`
- ❌ `Prisma tenant context missing` → **DUR, düzelt**
- ❌ `Cannot connect to Redis` → **REDIS_HOST kontrol et**

### Test 2: Tenant İzolasyon Testi (KRİTİK)

**Senaryo:**
1. Tenant A ile login yap
2. Tenant B'nin verisini **bilerek** sorgula (örn: `/api/stok?tenantId=tenant-b-id`)
3. **Beklenen sonuç:** Boş array `[]` veya `403 Forbidden`
4. **Kabul edilemez:** Tenant B verisi gelirse → **HEMEN DUR**

### Test 3: Queue Testi

API'den email veya PDF tetikle:

```bash
# Örnek: Email gönder
curl -X POST https://api.otomuhasebe.com/api/test/send-email \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Beklenen:**
- API response **anında** dönmeli (200 OK)
- Job worker log'da görünmeli:
  ```bash
  docker logs otomuhasebe-backend-prod | grep "Processing email job"
  ```

### Test 4: Backup Testi (1 kere yeter)

```bash
cd /var/www
./backup-full.sh
```

**Kontrol:**
- ✅ Local dump: `/var/backups/database/database-backup-*.sql.gz`
- ✅ S3 upload: Log'da `Yedek başarıyla S3'e yüklendi` mesajı

---

## 🟢 Sistem Güvenlik Durumu

Bu konfigürasyonla:
- ✅ **100 tenant rahat** çalışır
- ✅ **CPU spike'lar izole** (Docker limits sayesinde)
- ✅ **Tenant data leak riski çok düşük** (Prisma extension)
- ✅ **Backup artık gerçekten backup** (S3)

---

## ⚠️ Bilinen Teknik Borçlar

1. **Prisma `as any` cast**: Runtime güvenli ama tip güvenliği yok
   - **Etki:** Şu an için yok
   - **Çözüm:** Prisma upgrade'de typed wrapper yap

2. **BullMQ Worker**: Şu an aynı container'da
   - **Etki:** Yok (100 tenant için yeterli)
   - **Çözüm:** İleride ayrı worker container

---

## 🆘 Sorun Giderme

### Redis bağlanamıyor
```bash
docker exec -it otomuhasebe-redis redis-cli ping
# PONG dönmeli
```

### Tenant izolasyon çalışmıyor
`TenantMiddleware` log'larını aç:
```typescript
// tenant.middleware.ts içinde
console.log('Tenant ID:', req.tenantId);
```

### Queue job'lar çalışmıyor
```bash
docker exec -it otomuhasebe-redis redis-cli
> KEYS bull:email:*
# Job'lar görünmeli
```
