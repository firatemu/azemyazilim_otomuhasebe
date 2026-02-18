# Next.js API Route 404 Hatası - Detaylı Çözüm

## Sorun
`/api/hizli/incoming` ve `/api/hizli/token-status` endpoint'lerine 404 hatası alınıyor.

## Yapılan Düzeltmeler

1. ✅ Route segment config eklendi (`dynamic = 'force-dynamic'`, `runtime = 'nodejs'`)
2. ✅ Route handler'lar Next.js 16 formatına uygun hale getirildi
3. ✅ Test endpoint'leri eklendi

## Kontrol Listesi

### 1. Route Dosyalarının Varlığını Kontrol Edin

```bash
cd /var/www/panel-stage/client
ls -la src/app/api/hizli/incoming/route.ts
ls -la src/app/api/hizli/token-status/route.ts
ls -la src/app/api/hizli/test/route.ts
```

Bu dosyalar mevcut olmalı.

### 2. Next.js Cache Temizleme (KRİTİK)

```bash
cd /var/www/panel-stage/client

# .next klasörünü tamamen silin
rm -rf .next

# node_modules/.cache varsa onu da silin
rm -rf node_modules/.cache
```

### 3. Development vs Production Kontrolü

**Eğer Development kullanıyorsanız:**
```bash
cd /var/www/panel-stage/client
rm -rf .next
npm run dev
```

**Eğer Production kullanıyorsanız:**
```bash
cd /var/www/panel-stage/client
rm -rf .next
npm run build
npm run start
```

### 4. Route'ları Test Edin

Terminal'de (aynı sunucuda):

```bash
# Test endpoint (en basit)
curl http://localhost:3000/api/hizli
curl http://localhost:3000/api/hizli/test

# Ana endpoint'ler
curl http://localhost:3000/api/hizli/token-status
curl http://localhost:3000/api/hizli/incoming
```

### 5. Next.js Dev Server Log'larını Kontrol Edin

Dev server başlatıldığında şu log'ları görmelisiniz:
```
✓ Ready in Xs
○ Compiling /api/hizli/test ...
✓ Compiled /api/hizli/test in Xs
```

Eğer route'lar compile edilmiyorsa, Next.js route'ları tanımıyor demektir.

## Olası Sorunlar ve Çözümleri

### Sorun 1: Route dosyaları compile edilmiyor

**Çözüm:**
- Dosya adının tam olarak `route.ts` olduğundan emin olun (büyük/küçük harf duyarlı)
- Route dosyalarının `src/app/api/hizli/[endpoint]/route.ts` formatında olduğundan emin olun

### Sorun 2: Production build kullanılıyor ve route'lar build'e dahil edilmemiş

**Çözüm:**
```bash
cd /var/www/panel-stage/client
rm -rf .next
npm run build
# Build çıktısında route'ların dahil edildiğini kontrol edin
npm run start
```

### Sorun 3: Next.js versiyonu uyumsuzluğu

**Kontrol:**
```bash
cd /var/www/panel-stage/client
npm list next
# Next.js 13+ olmalı (şu an 16.0.1)
```

### Sorun 4: TypeScript hatası route'ları engelliyor

**Kontrol:**
```bash
cd /var/www/panel-stage/client
npm run lint
# Hata varsa düzeltin
```

## Hızlı Test Senaryosu

1. **Test endpoint'i çalışıyor mu?**
   ```bash
   curl http://localhost:3000/api/hizli/test
   ```
   → `{"success":true,"message":"Hızlı API route çalışıyor!","timestamp":"..."}` dönmeli

2. **Ana hizli endpoint çalışıyor mu?**
   ```bash
   curl http://localhost:3000/api/hizli
   ```
   → Endpoint listesi dönmeli

3. **Token status çalışıyor mu?**
   ```bash
   curl http://localhost:3000/api/hizli/token-status
   ```
   → Backend'den response gelmeli (backend çalışıyorsa)

## Debug Adımları

Eğer hala 404 alıyorsanız:

1. **Next.js dev server log'larını kontrol edin:**
   - Route'lar compile ediliyor mu?
   - Herhangi bir hata var mı?

2. **Browser DevTools'u kontrol edin:**
   - Network tab'ında hangi URL'e istek gidiyor?
   - Response header'ları ne diyor?

3. **Sunucu tarafında kontrol:**
   ```bash
   # Next.js process'i çalışıyor mu?
   ps aux | grep next
   
   # Hangi port'ta dinliyor?
   netstat -tlnp | grep node
   ```

4. **Route dosyalarının içeriğini kontrol edin:**
   ```bash
   cat src/app/api/hizli/test/route.ts
   # Export GET fonksiyonu var mı?
   ```

## Son Çare

Eğer hiçbir şey işe yaramıyorsa:

1. **Next.js'i tamamen yeniden kurun:**
   ```bash
   cd /var/www/panel-stage/client
   rm -rf .next node_modules package-lock.json
   npm install
   npm run dev
   ```

2. **Route'ları basit bir test ile doğrulayın:**
   `src/app/api/hizli/test/route.ts` dosyasını kontrol edin - en basit route bu.

