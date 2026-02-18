---
description: Database migration workflow for staging and production
---

# Database Migration Workflow

Bu workflow, Prisma migration'larını güvenli bir şekilde staging ve production'a uygulamak için kullanılır.

## 1. Schema Değişikliği Yap

`/var/www/api-stage/server/prisma/schema.prisma` dosyasını düzenle

**MCP Kullan**: `prisma-schema-mcp` ile mevcut şemayı analiz et

## 2. Migration Oluştur (Staging)

// turbo
```bash
cd /var/www/api-stage/server
```

```bash
npx prisma migrate dev --name migration_name
```

**Önemli**: Migration adı açıklayıcı olmalı (örn: `add_banka_hesap_table`)

## 3. Migration Dosyasını İncele

```bash
cat prisma/migrations/[timestamp]_migration_name/migration.sql
```

Kontrol et:
- [ ] Veri kaybı riski var mı?
- [ ] Index'ler doğru mu?
- [ ] Foreign key'ler doğru mu?
- [ ] Rollback mümkün mü?

## 4. Prisma Client Güncelle

// turbo
```bash
npx prisma generate
```

## 5. Backend'i Yeniden Başlat (Staging)

// turbo
```bash
docker restart compose-backend-staging-1
```

**MCP Kullan**: `docker-ops-mcp` ile container durumunu kontrol et

## 6. Staging'de Test Et

**MCP Kullan**: `api-docs-mcp` ile endpoint'leri test et

```bash
docker logs -f compose-backend-staging-1
```

Kontrol et:
- [ ] Backend başarıyla başladı mı?
- [ ] Migration hatasız uygulandı mı?
- [ ] API endpoint'leri çalışıyor mu?

## 7. Production'a Hazırlık

⚠️ **DİKKAT**: Production migration'ları geri alınamaz!

### Backup Al

```bash
cd /var/www
./backup-full.sh
```

### Migration Dosyasını Kopyala

```bash
cp -r /var/www/api-stage/server/prisma/migrations/[timestamp]_migration_name \
      /var/www/api-prod/server/prisma/migrations/
```

### Schema Dosyasını Güncelle

```bash
cp /var/www/api-stage/server/prisma/schema.prisma \
   /var/www/api-prod/server/prisma/schema.prisma
```

## 8. Production Migration Uygula

```bash
cd /var/www/api-prod/server
npx prisma migrate deploy
```

**NOT**: `migrate deploy` kullan, `migrate dev` DEĞİL!

## 9. Prisma Client Güncelle (Production)

```bash
cd /var/www/api-prod/server
npx prisma generate
```

## 10. Backend'i Yeniden Başlat (Production)

```bash
docker restart compose-backend-production-1
```

## 11. Production'da Doğrula

```bash
docker logs -f compose-backend-production-1
```

**MCP Kullan**: `log-analyzer-mcp` ile hataları kontrol et

Kontrol et:
- [ ] Backend başarıyla başladı mı?
- [ ] Migration hatasız uygulandı mı?
- [ ] API endpoint'leri çalışıyor mu?
- [ ] Mevcut veriler etkilendi mi?

## 12. Cache Temizle (Gerekirse)

**MCP Kullan**: `redis-cache-mcp`

```bash
docker exec -it compose-redis-1 redis-cli FLUSHDB
```

## 🚨 Sorun Çıkarsa (Rollback)

### Staging Rollback

```bash
cd /var/www/api-stage/server
npx prisma migrate resolve --rolled-back [migration_name]
```

### Production Rollback

⚠️ **Production'da rollback çok risklidir!**

1. Backup'tan geri yükle:
```bash
cd /var/www
./docker-restore.sh
```

2. Veya manuel SQL ile geri al (migration.sql'i tersine çevir)

## ✅ Checklist

### Staging
- [ ] Schema değişikliği yapıldı
- [ ] Migration oluşturuldu
- [ ] Migration dosyası incelendi
- [ ] Prisma client güncellendi
- [ ] Backend yeniden başlatıldı
- [ ] Test edildi

### Production
- [ ] Backup alındı
- [ ] Migration dosyası kopyalandı
- [ ] Schema dosyası güncellendi
- [ ] Migration uygulandı (`migrate deploy`)
- [ ] Prisma client güncellendi
- [ ] Backend yeniden başlatıldı
- [ ] Doğrulandı
- [ ] Cache temizlendi (gerekirse)
