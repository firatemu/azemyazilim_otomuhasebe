---
description: Deployment workflow for staging and production
---

# Deployment Workflow

Bu workflow, kod değişikliklerini staging ve production'a deploy etmek için kullanılır.

## Staging Deployment

### 1. Kod Değişikliklerini Commit Et

```bash
cd /var/www
git add .
git commit -m "feat: açıklayıcı commit mesajı"
git push origin main
```

### 2. Backend Deployment (Staging)

// turbo
```bash
cd /var/www/api-stage/server
```

#### Dependencies Güncelle (Gerekirse)

```bash
npm install
```

#### Build

```bash
npm run build
```

#### Container'ı Yeniden Başlat

// turbo
```bash
docker restart compose-backend-staging-1
```

#### Log Kontrol

**MCP Kullan**: `log-analyzer-mcp`

// turbo
```bash
docker logs -f compose-backend-staging-1
```

### 3. Frontend Deployment (Staging)

// turbo
```bash
cd /var/www/panel-stage/client
```

#### Dependencies Güncelle (Gerekirse)

```bash
npm install
```

#### Build

```bash
npm run build
```

#### Container'ı Yeniden Başlat

// turbo
```bash
docker restart compose-frontend-staging-1
```

### 4. Staging Test

Browser'da test et: `https://staging.otomuhasebe.com`

Kontrol et:
- [ ] Login çalışıyor mu?
- [ ] Yeni özellikler çalışıyor mu?
- [ ] Mevcut özellikler bozulmadı mı?
- [ ] Console'da hata var mı?

## Production Deployment

⚠️ **DİKKAT**: Production deployment dikkatli yapılmalıdır!

### 1. Backup Al

```bash
cd /var/www
./backup-full.sh
```

### 2. Database Migration (Gerekirse)

**Workflow Kullan**: `/database-migration` workflow'unu takip et

### 3. Backend Deployment (Production)

```bash
cd /var/www/api-prod/server
```

#### Code Sync

Staging'den production'a kod kopyala:

```bash
rsync -av --exclude='node_modules' --exclude='dist' \
  /var/www/api-stage/server/ /var/www/api-prod/server/
```

#### Dependencies Güncelle

```bash
npm install --production
```

#### Build

```bash
npm run build
```

#### Container'ı Yeniden Başlat

```bash
docker restart compose-backend-production-1
```

#### Log Kontrol

**MCP Kullan**: `log-analyzer-mcp`

```bash
docker logs -f compose-backend-production-1
```

### 4. Frontend Deployment (Production)

```bash
cd /var/www/panel-prod/client
```

#### Code Sync

```bash
rsync -av --exclude='node_modules' --exclude='.next' \
  /var/www/panel-stage/client/ /var/www/panel-prod/client/
```

#### Dependencies Güncelle

```bash
npm install --production
```

#### Build

```bash
npm run build
```

#### Container'ı Yeniden Başlat

```bash
docker restart compose-frontend-production-1
```

### 5. Cache Temizle (Gerekirse)

**MCP Kullan**: `redis-cache-mcp`

```bash
docker exec -it compose-redis-1 redis-cli FLUSHDB
```

### 6. Production Test

Browser'da test et: `https://otomuhasebe.com`

Kontrol et:
- [ ] Login çalışıyor mu?
- [ ] Yeni özellikler çalışıyor mu?
- [ ] Mevcut özellikler bozulmadı mı?
- [ ] Console'da hata var mı?
- [ ] Performance sorun var mı?

### 7. Monitoring

İlk 10 dakika log'ları izle:

```bash
docker logs -f compose-backend-production-1
```

**MCP Kullan**: `log-analyzer-mcp` ile hataları kontrol et

## Rollback (Acil Durum)

### Backend Rollback

```bash
cd /var/www
./docker-restore.sh
```

### Frontend Rollback

```bash
cd /var/www/panel-prod/client
git checkout HEAD~1
npm install
npm run build
docker restart compose-frontend-production-1
```

## Zero-Downtime Deployment (Gelişmiş)

### 1. Yeni Container Başlat

```bash
docker-compose up -d --scale backend=2
```

### 2. Health Check

```bash
curl http://localhost:3001/health
```

### 3. Eski Container'ı Durdur

```bash
docker stop compose-backend-production-1
```

### 4. Yeni Container'ı Rename Et

```bash
docker rename compose-backend-production-2 compose-backend-production-1
```

## ✅ Deployment Checklist

### Staging
- [ ] Kod commit edildi
- [ ] Backend build edildi
- [ ] Frontend build edildi
- [ ] Container'lar yeniden başlatıldı
- [ ] Log'lar kontrol edildi
- [ ] Test edildi

### Production
- [ ] Backup alındı
- [ ] Migration uygulandı (gerekirse)
- [ ] Kod sync edildi
- [ ] Dependencies güncellendi
- [ ] Build edildi
- [ ] Container'lar yeniden başlatıldı
- [ ] Cache temizlendi (gerekirse)
- [ ] Test edildi
- [ ] Log'lar izlendi
- [ ] Rollback planı hazır
