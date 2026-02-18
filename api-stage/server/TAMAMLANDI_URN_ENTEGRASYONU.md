# ✅ PK ve GB URN Değerleri Entegre Edildi

## 📋 Yapılan Değişiklikler

### 1. URN Constants Dosyası Oluşturuldu ✅
- ✅ `src/modules/hizli/utils/urn-constants.ts`
- ✅ GB ve PK URN değerleri tanımlandı
- ✅ Environment variable desteği eklendi

### 2. SOAP Client Güncellendi ✅
- ✅ `getIncomingDocuments` metoduna `destinationUrn` parametresi eklendi
- ✅ GB URN değeri otomatik olarak SOAP isteğine ekleniyor
- ✅ Logging eklendi

### 3. Service Güncellendi ✅
- ✅ `getIncomingEFatura` metodunda GB URN kullanılıyor
- ✅ URN değeri ConfigService'ten alınıyor

### 4. Controller Güncellendi ✅
- ✅ Yeni endpoint: `GET /hizli/urn-config`
- ✅ URN konfigürasyonunu kontrol etmek için

## 🔧 URN Değerleri

### GB (Giden Belge)
```
urn:mail:defaultgb@hizlibilisimteknolojileri.net
```
- **Kullanım**: Gelen e-faturaları almak için
- **SOAP Parametresi**: `destinationUrn` veya `destinationIdentifier`

### PK (Posta Kutusu)
```
urn:mail:defaultpk@hizlibilisimteknolojileri.net
```
- **Kullanım**: E-fatura gönderimleri için (ileride)
- **SOAP Parametresi**: `sourcePk`

## 📡 Yeni API Endpoint

### GET /api/hizli/urn-config

URN konfigürasyonunu kontrol eder:

```bash
curl http://localhost:3000/api/hizli/urn-config
```

Response:
```json
{
  "success": true,
  "gb": {
    "urn": "urn:mail:defaultgb@hizlibilisimteknolojileri.net",
    "description": "Gelen Belge (GB) - Gelen e-faturalar için kullanılır",
    "default": "urn:mail:defaultgb@hizlibilisimteknolojileri.net",
    "isDefault": true
  },
  "pk": {
    "urn": "urn:mail:defaultpk@hizlibilisimteknolojileri.net",
    "description": "Posta Kutusu (PK) - E-fatura gönderimleri için kullanılır",
    "default": "urn:mail:defaultpk@hizlibilisimteknolojileri.net",
    "isDefault": true
  },
  "environment": {
    "HIZLI_GB_URN": "not set",
    "HIZLI_PK_URN": "not set"
  }
}
```

## 🔧 Environment Variables (Opsiyonel)

`.env` dosyasına eklenebilir:

```env
HIZLI_GB_URN=urn:mail:defaultgb@hizlibilisimteknolojileri.net
HIZLI_PK_URN=urn:mail:defaultpk@hizlibilisimteknolojileri.net
```

**Not**: Environment variable'lar opsiyoneldir, default değerler zaten kullanılıyor.

## 📝 Kullanım Yerleri

### GetIncomingDocuments SOAP İsteği

```typescript
// Service içinde otomatik kullanılıyor
const documents = await this.soapClient.getIncomingDocuments(token, gbUrn);
```

SOAP Request:
```xml
<GetIncomingDocuments>
  <token>...</token>
  <destinationUrn>urn:mail:defaultgb@hizlibilisimteknolojileri.net</destinationUrn>
  <destinationIdentifier>urn:mail:defaultgb@hizlibilisimteknolojileri.net</destinationIdentifier>
</GetIncomingDocuments>
```

## ✅ Tamamlandı

- ✅ URN değerleri kod içinde tanımlandı
- ✅ SOAP client güncellendi
- ✅ Service güncellendi
- ✅ Controller'a URN config endpoint'i eklendi
- ✅ Dokümantasyon oluşturuldu

Tüm değişiklikler uygulandı ve lint hatası yok! 🎉

