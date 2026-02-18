# SaaS Multi-Tenant Kurulum Rehberi

## Önemli Notlar

Bu proje SaaS multi-tenant yapısına geçirilmiştir. Tüm API çağrılarında tenant ID gönderilmesi gerekmektedir.

## Yapılandırma

### 1. Tenant Header Formatı

Backend'in beklediği tenant ID header formatını `src/config/constants.ts` dosyasındaki `TENANT_HEADER_NAME` değişkeninden ayarlayabilirsiniz.

**Varsayılan:** `X-Tenant-Id`

**Değiştirmek için:**
```typescript
export const TENANT_HEADER_NAME = 'Tenant-Id'; // Backend'in beklediği format
```

### 2. Login Response Formatı

Backend login response'unda tenant bilgisi şu formattan birinde olmalıdır:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "email": "...",
    "tenantId": "tenant-123",  // Format 1
    "tenant": {                 // Format 2
      "id": "tenant-123",
      "name": "Company Name"
    }
  },
  "tenantId": "tenant-123"      // Format 3
}
```

Kod otomatik olarak bu formatları algılar ve tenant ID'yi çıkarır.

## Debug ve Test

### Development Modunda Debug

Development modunda (`npm run dev`) tenant ID ile ilgili debug bilgileri console'da görünecektir:

- Login response'unda tenant ID'nin nasıl extract edildiği
- Her API request'inde tenant ID header'ının gönderilip gönderilmediği
- Tenant ID bulunamadığında uyarılar

### Test Adımları

1. **Login Test:**
   - Login yapın
   - Browser console'da `[AUTH DEBUG]` loglarını kontrol edin
   - localStorage'da `tenantId` değerinin kaydedildiğini kontrol edin

2. **API Request Test:**
   - Herhangi bir API çağrısı yapın (ör: kullanıcı listesi)
   - Browser Network tab'ında request header'larını kontrol edin
   - `X-Tenant-Id` header'ının gönderildiğini doğrulayın

3. **Veri Ekleme Test:**
   - Yeni bir kayıt eklemeyi deneyin
   - Network tab'ında POST request'inde tenant ID header'ının olduğunu kontrol edin

## Sorun Giderme

### Tenant ID Bulunamıyor

Eğer console'da `[AUTH WARNING] Tenant ID not found` uyarısı görüyorsanız:

1. Backend login response formatını kontrol edin
2. `src/stores/authStore.ts` dosyasındaki tenant ID extraction mantığını güncelleyin
3. Backend developer ile iletişime geçin ve response formatını doğrulayın

### Tenant ID Header Gönderilmiyor

Eğer Network tab'ında tenant ID header'ı görünmüyorsa:

1. localStorage'da `tenantId` değerinin olduğunu kontrol edin
2. Browser console'da `[API WARNING]` mesajlarını kontrol edin
3. Login işlemini tekrar yapın

### Backend Farklı Header Formatı Bekliyor

Eğer backend farklı bir header formatı bekliyorsa:

1. `src/config/constants.ts` dosyasını açın
2. `TENANT_HEADER_NAME` değerini backend'in beklediği formata göre değiştirin
3. Uygulamayı yeniden build edin

## Örnek Backend Response Formatları

### Format 1: User objesi içinde tenantId
```json
{
  "user": {
    "tenantId": "tenant-123"
  }
}
```

### Format 2: User objesi içinde tenant objesi
```json
{
  "user": {
    "tenant": {
      "id": "tenant-123"
    }
  }
}
```

### Format 3: Root seviyede tenantId
```json
{
  "tenantId": "tenant-123"
}
```

Kod bu üç formatı da destekler.

