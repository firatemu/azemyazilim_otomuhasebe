# Next.js API Route 404 Hatası Çözümü

## Sorun
Frontend'den `/api/hizli/incoming` ve `/api/hizli/token-status` endpoint'lerine çağrı yapılınca 404 hatası alınıyor.

## Çözüm Adımları

### 1. Next.js Dev Server'ı Restart Edin

```bash
cd /var/www/panel-stage/client
# Dev server'ı durdurun (Ctrl+C)
# Sonra yeniden başlatın
npm run dev
```

### 2. .next Cache'ini Temizleyin

```bash
cd /var/www/panel-stage/client
rm -rf .next
npm run dev
```

### 3. Route Dosyalarının Doğru Yerde Olduğunu Kontrol Edin

Route dosyaları şu konumlarda olmalı:
- `/var/www/panel-stage/client/src/app/api/hizli/incoming/route.ts`
- `/var/www/panel-stage/client/src/app/api/hizli/token-status/route.ts`

### 4. Next.js Build (Production)

Eğer production build kullanıyorsanız:

```bash
cd /var/www/panel-stage/client
npm run build
npm run start
```

### 5. Route'ların Çalıştığını Test Edin

Tarayıcıda veya curl ile:

```bash
# Token status
curl http://localhost:3000/api/hizli/token-status

# Incoming
curl http://localhost:3000/api/hizli/incoming
```

## Notlar

- Next.js App Router'da API route'lar `app/api/[route]/route.ts` formatında olmalı
- Route handler'lar `GET`, `POST`, vb. olarak export edilmelidir
- `request` parametresi opsiyoneldir (`request?: NextRequest`)
- Next.js dev server route değişikliklerini otomatik algılar, ama bazen restart gerekebilir

