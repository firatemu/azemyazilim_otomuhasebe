# Hızlı Bilişim API Entegrasyonu - Kurulum Rehberi

## Adım 1: Environment Variables Ayarlama

`.env` dosyasını oluşturun ve aşağıdaki değerleri ekleyin:

```env
# Test ortamı için
HIZLI_BASE_URL=https://econnecttest.hizliteknoloji.com.tr
HIZLI_API_BASE=https://econnecttest.hizliteknoloji.com.tr/HizliApi/RestApi
HIZLI_SECRET_KEY=9785bcc3953673cfb92246398b25449ad25e
HIZLI_API_KEY=9785bcc39536
HIZLI_USERNAME=hizlitest
HIZLI_PASSWORD=Test.1234
```

## Adım 2: Credential Şifreleme (UtilEncrypt)

**ÖNEMLİ**: Bu adım sadece bir kez yapılmalıdır!

### Yöntem 1: API Endpoint ile (Önerilen)

Sunucu çalışırken, tarayıcıdan veya Postman'den:

```bash
# Test login endpoint'i otomatik olarak UtilEncrypt çağırır
curl -X POST http://localhost:3000/api/fatura/efatura/test-login
```

Loglarda şifrelenmiş değerleri göreceksiniz:
```
Encrypted credentials:
  username: S1q5jNIaexrHMtvzg+ZJWA==
  password: kBOdl86Q4PuynyZzfQKL6w==
```

### Yöntem 2: Direkt API Çağrısı

```bash
curl -X POST https://econnecttest.hizliteknoloji.com.tr/HizliApi/RestApi/UtilEncrypt \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "9785bcc3953673cfb92246398b25449ad25e",
    "username": "hizlitest",
    "password": "Test.1234"
  }'
```

Response:
```json
{
  "username": "S1q5jNIaexrHMtvzg+ZJWA==",
  "password": "kBOdl86Q4PuynyZzfQKL6w=="
}
```

## Adım 3: Şifrelenmiş Değerleri .env'e Ekleme

`.env` dosyasına şifrelenmiş değerleri ekleyin:

```env
HIZLI_ENCRYPTED_USERNAME=S1q5jNIaexrHMtvzg+ZJWA==
HIZLI_ENCRYPTED_PASSWORD=kBOdl86Q4PuynyZzfQKL6w==
```

**GÜVENLİK NOTU**: Production'da `HIZLI_USERNAME` ve `HIZLI_PASSWORD` değerlerini `.env` dosyasından kaldırın. Sadece şifrelenmiş değerleri kullanın.

## Adım 4: Veritabanı Migration

Token'ları saklamak için veritabanı tablosu oluşturun:

```bash
cd /var/www/api-stage/server
npx prisma migrate dev --name add_hizli_token
```

Eğer migration hatası alırsanız (URI error), manuel SQL çalıştırın:

```sql
CREATE TABLE IF NOT EXISTS hizli_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  encrypted_username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Adım 5: Sunucuyu Başlatma

```bash
cd /var/www/api-stage/server
npm run start:dev
```

## Adım 6: Test Etme

### Token Durumu Kontrolü
```bash
curl http://localhost:3000/api/fatura/efatura/token-status
```

Beklenen response:
```json
{
  "hasToken": true,
  "isValid": true,
  "expiresAt": "2024-12-11T10:30:00.000Z",
  "tokenLength": 500,
  "tokenPreview": "eyJhbGciOiJIUzI1Ni...xyz",
  "token": "full-token-here"
}
```

### Login Test
```bash
curl -X POST http://localhost:3000/api/fatura/efatura/test-login
```

Beklenen response:
```json
{
  "success": true,
  "message": "Login başarılı!",
  "beforeStatus": {
    "hasToken": false,
    "isValid": false
  },
  "afterStatus": {
    "hasToken": true,
    "isValid": true,
    "expiresAt": "2024-12-11T10:30:00.000Z"
  },
  "token": "full-token-here",
  "tokenStatus": {
    "hasToken": true,
    "isValid": true,
    "tokenLength": 500
  }
}
```

### Gelen Faturalar Test
```bash
curl "http://localhost:3000/api/fatura/efatura/inbox?startDate=2024-01-01&endDate=2024-12-31"
```

## Adım 7: Production Ortamına Geçiş

### 1. Production Credentials Alma
Hızlı Bilişim'den production ortamı için:
- `SECRET_KEY`
- `API_KEY`
- `USERNAME`
- `PASSWORD`

### 2. Production Credentials Şifreleme
```bash
curl -X POST https://econnect.hizliteknoloji.com.tr/HizliApi/RestApi/UtilEncrypt \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "YOUR_PRODUCTION_SECRET_KEY",
    "username": "YOUR_PRODUCTION_USERNAME",
    "password": "YOUR_PRODUCTION_PASSWORD"
  }'
```

### 3. Production .env Güncelleme
```env
HIZLI_BASE_URL=https://econnect.hizliteknoloji.com.tr
HIZLI_API_BASE=https://econnect.hizliteknoloji.com.tr/HizliApi/RestApi
HIZLI_SECRET_KEY=YOUR_PRODUCTION_SECRET_KEY
HIZLI_API_KEY=YOUR_PRODUCTION_API_KEY
HIZLI_ENCRYPTED_USERNAME=YOUR_ENCRYPTED_USERNAME
HIZLI_ENCRYPTED_PASSWORD=YOUR_ENCRYPTED_PASSWORD
```

**GÜVENLİK**: Production'da `HIZLI_USERNAME` ve `HIZLI_PASSWORD` değerlerini kaldırın!

## Sorun Giderme

### Token Alınamıyor
1. `.env` dosyasındaki değerleri kontrol edin
2. Şifrelenmiş credential'ların doğru olduğundan emin olun
3. API_KEY'in doğru olduğundan emin olun
4. Backend loglarını kontrol edin: `docker logs api-stage -f`

### Token Kaydedilmiyor
1. Veritabanı migration'ının çalıştığından emin olun
2. `hizli_tokens` tablosunun var olduğunu kontrol edin
3. Database connection string'in doğru olduğundan emin olun

### GetDocumentList 404 Hatası
1. Token'ın alındığından emin olun
2. Bearer token'ın header'da gönderildiğini kontrol edin
3. API endpoint'inin doğru olduğundan emin olun

### Debug Endpoints
```bash
# Token debug bilgileri
curl http://localhost:3000/api/fatura/efatura/debug-token

# Raw login response
curl http://localhost:3000/api/fatura/efatura/test-login-raw

# Token'ı temizle ve yeniden al
curl -X POST http://localhost:3000/api/fatura/efatura/refresh-token
```

## Kimlik Doğrulama Akışı Özeti

```
1. UtilEncrypt (Sadece bir kez)
   ├─ Input: secretKey, username, password
   └─ Output: encryptedUsername, encryptedPassword
        ↓
2. Login (Her 3 günde bir veya token süresi dolduğunda)
   ├─ Input: apiKey, encryptedUsername, encryptedPassword
   └─ Output: JWT Token (3 gün geçerli)
        ↓
3. API Çağrıları
   ├─ Header: Authorization: Bearer {token}
   └─ Otomatik token yenileme (401 hatası alındığında)
```

## Önemli Notlar

1. **Token Süresi**: 3 gün (dokümantasyonda belirtilmiş)
2. **Token Cache**: Hem memory'de hem database'de saklanır
3. **Otomatik Yenileme**: Token süresi dolduğunda otomatik yenilenir
4. **UtilEncrypt**: Sadece bir kez çalıştırılmalı
5. **Bearer Token**: Tüm API çağrılarında kullanılır
6. **Güvenlik**: Production'da plain text credential'ları saklamayın

## Dokümantasyon

- **Swagger**: https://econnecttest.hizliteknoloji.com.tr/swagger/ui/index
- **Entegrasyon Dokümanı**: https://econnecttest.hizliteknoloji.com.tr/IntegrationDocuments
- **Test Portal**: portaltest.hizliteknoloji.com.tr

## Destek

Sorun yaşarsanız:
1. Backend loglarını kontrol edin
2. Debug endpoint'lerini kullanın
3. Hızlı Bilişim destek ekibiyle iletişime geçin

