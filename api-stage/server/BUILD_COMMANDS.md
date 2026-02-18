# 🔨 Backend Build Komutları

## Terminal Açamıyorsanız

Cursor'da terminal açamıyorsanız, **başka bir terminal penceresi** açın (örn. SSH ile sunucuya bağlanın) ve aşağıdaki komutları çalıştırın.

---

## 🚀 Yöntem 1: Otomatik Script (Önerilen)

SSH ile sunucuya bağlandıktan sonra:

```bash
# Script'i çalıştırılabilir yap
chmod +x /var/www/api-stage/server/build-and-restart.sh

# Script'i çalıştır
/var/www/api-stage/server/build-and-restart.sh
```

---

## 📋 Yöntem 2: Manuel Komutlar

SSH ile sunucuya bağlandıktan sonra şu komutları sırayla çalıştırın:

```bash
# 1. Backend klasörüne git
cd /var/www/api-stage/server

# 2. TypeScript build et
npm run build

# 3. PM2 restart et
pm2 restart api-stage

# 4. Logları kontrol et (opsiyonel)
pm2 logs api-stage --lines 30
```

---

## 🔍 Yöntem 3: Tek Satır Komut

```bash
cd /var/www/api-stage/server && npm run build && pm2 restart api-stage && pm2 logs api-stage --lines 20
```

---

## ✅ Build Sonrası Test

Build ve restart işlemi tamamlandıktan sonra, frontend'den veya curl ile test edin:

### Frontend Test:
1. Tarayıcıda açın: `https://staging.otomuhasebe.com/fatura/gelen-e-faturalar`
2. Sayfa yüklenmeli ve e-faturalar listelenmeli

### Backend API Test:
```bash
# Token Status
curl https://staging-api.otomuhasebe.com/api/fatura/efatura/token-status

# Inbox (Gelen E-Faturalar)
curl 'https://staging-api.otomuhasebe.com/api/fatura/efatura/inbox?dateType=CreatedDate&startDate=2023-01-01&endDate=2023-12-31'
```

---

## ❌ Hata Alırsanız

### Build Hatası:
```bash
cd /var/www/api-stage/server
npm run build
# Hataları kontrol edin
```

### PM2 Hatası:
```bash
# PM2 status kontrol
pm2 status

# PM2 listesi
pm2 list

# PM2 logs
pm2 logs api-stage --lines 50
```

### Endpoint 404 Alırsanız:
- Build başarılı oldu mu kontrol edin
- PM2 restart edildi mi kontrol edin
- Server loglarını kontrol edin: `pm2 logs api-stage`

---

## 📝 Yapılan Değişiklikler (Bu Build'de)

✅ **`hizli-client.service.ts`**:
- `getDocumentList` metodunda response format handling iyileştirildi
- Array, object ve farklı field isimlerini destekliyor
- Detaylı error logging eklendi

✅ **`fatura.controller.ts`**:
- `inbox` endpoint'inde detaylı error logging eklendi
- Response yapısı loglanıyor

---

## 🎯 Beklenen Sonuç

Build başarılı olursa:
- ✅ `/api/fatura/efatura/inbox` endpoint'i çalışacak
- ✅ Frontend'den gelen e-faturalar listelenebilecek
- ✅ 500 hatası düzelecek

---

## 📞 Yardım

Eğer hala sorun yaşıyorsanız:
1. Backend loglarını kontrol edin: `pm2 logs api-stage`
2. Frontend console'u kontrol edin (F12 → Console)
3. Network tab'inde API isteklerini kontrol edin

