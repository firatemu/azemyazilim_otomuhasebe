# Cache Sorunu Kalıcı Çözümü

## Yapılan Değişiklikler

### 1. Vite Config (`vite.config.ts`)
- ✅ Her build'de farklı hash ile dosya adlandırma (cache busting)
- ✅ `emptyOutDir: true` - Her build'de build klasörü temizlenir
- ✅ `optimizeDeps.force: true` - Dependency cache'i zorla yenilenir
- ✅ Server ve preview modlarında `Cache-Control: no-store` headers
- ✅ Dev mode'da HMR aktif

### 2. HTML Meta Tags (`index.html`)
- ✅ `Cache-Control`, `Pragma`, `Expires` meta tags eklendi
- ✅ Service Worker'ları otomatik kaldırma script'i
- ✅ Cache API temizleme script'i
- ✅ LocalStorage version control

### 3. Cache Buster Utility (`src/utils/cacheBuster.ts`)
- ✅ Uygulama başlangıcında tüm cache'leri temizler
- ✅ Service Worker kaldırma
- ✅ Cache API temizleme
- ✅ LocalStorage version kontrolü

### 4. React Query Cache (`src/lib/queryClient.ts`)
- ✅ `staleTime: 0` - Veri her zaman eski kabul edilir
- ✅ `gcTime: 0` - Cache süresi yok
- ✅ `refetchOnWindowFocus: true` - Focus'ta yeniden fetch
- ✅ `refetchOnMount: true` - Mount'ta yeniden fetch

### 5. Package Scripts (`package.json`)
- ✅ `dev: vite --force` - Dev mode'da cache zorla yenileme
- ✅ `build: vite build --force` - Build'de cache zorla yenileme
- ✅ `build:clean` - Build öncesi cache temizleme

## Kullanım

### Development Mode
```bash
npm run dev
```
- Cache tamamen devre dışı
- Her sayfa yüklemesinde cache temizlenir

### Production Build
```bash
npm run build:clean
```
- Build öncesi cache temizlenir
- Her dosya için hash eklenir
- Cache'lenmez

### Manuel Cache Temizleme
Tarayıcıda:
1. **Chrome/Edge**: `Ctrl+Shift+Delete` → "Cached images and files" seçin
2. **Firefox**: `Ctrl+Shift+Delete` → "Cache" seçin
3. **Hard Refresh**: `Ctrl+Shift+R` (Windows) veya `Cmd+Shift+R` (Mac)

## Önemli Notlar

- ✅ **Developer Mode Aktif**: Cache tamamen devre dışı
- ✅ **Her Build'de Hash**: Dosyalar cache'lenmez
- ✅ **Service Worker Devre Dışı**: Otomatik kaldırılır
- ✅ **LocalStorage Kontrollü**: Eski cache'ler otomatik temizlenir

## Sorun Giderme

Eğer hala cache sorunu yaşıyorsanız:

1. **Tarayıcı Cache'ini temizleyin**:
   - DevTools açın (F12)
   - Network sekmesinde "Disable cache" işaretleyin
   - Sayfayı yenileyin

2. **Service Worker'ı kontrol edin**:
   - DevTools → Application → Service Workers
   - Tüm worker'ları "Unregister" edin

3. **LocalStorage temizleyin**:
   - DevTools → Application → Local Storage
   - `clear()` ile temizleyin

4. **Hard Reload**:
   - `Ctrl+Shift+R` veya `Cmd+Shift+R`

## Build Hatası Varsa

Build hatası varsa önce düzeltilmesi gerekir:
```bash
npm run build
```

Hataları kontrol edin ve düzeltin.

