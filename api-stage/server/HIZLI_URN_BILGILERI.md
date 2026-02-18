# Hızlı Teknoloji PK ve GB URN Değerleri

## 📋 URN Değerleri

### GB (Giden Belge) - Gelen E-Faturalar İçin
```
urn:mail:defaultgb@hizlibilisimteknolojileri.net
```

### PK (Posta Kutusu) - E-Fatura Gönderimleri İçin
```
urn:mail:defaultpk@hizlibilisimteknolojileri.net
```

## 🔧 Kullanım

### Environment Variables (Opsiyonel)

`.env` dosyasına eklenebilir (opsiyonel, default değerler zaten kullanılıyor):

```env
HIZLI_GB_URN=urn:mail:defaultgb@hizlibilisimteknolojileri.net
HIZLI_PK_URN=urn:mail:defaultpk@hizlibilisimteknolojileri.net
```

### Kod İçinde Kullanım

```typescript
import { getGBUrn, getPKUrn, HIZLI_URN } from './utils/urn-constants';

// GB URN (gelen e-faturalar için)
const gbUrn = getGBUrn(configService);
// veya direkt
const gbUrn = HIZLI_URN.GB;

// PK URN (e-fatura gönderimleri için)
const pkUrn = getPKUrn(configService);
// veya direkt
const pkUrn = HIZLI_URN.PK;
```

## 📡 API Endpoint

URN konfigürasyonunu kontrol etmek için:

```bash
GET /api/hizli/urn-config
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

## 🔍 Kullanım Yerleri

### GetIncomingDocuments SOAP İsteği
- `destinationUrn` parametresi olarak GB URN kullanılır
- Gelen e-faturaları almak için gerekli

### SendDocument SOAP İsteği (ileride)
- `sourceUrn` parametresi olarak GB URN kullanılır (gönderici)
- `destinationUrn` parametresi olarak alıcı firmanın GB URN'i kullanılır
- `sourcePk` parametresi olarak PK URN kullanılır

## 📝 Notlar

- Default değerler kod içinde tanımlı
- Environment variable ile override edilebilir
- Test ortamı için bu değerler yeterli
- Production'da firma-specific URN'ler kullanılabilir

