# Backend Endpoint Test

## Test Steps

1. **Backend'in çalıştığını kontrol edin:**
   ```bash
   curl https://staging-api.otomuhasebe.com/api/hizli/token-status
   ```

2. **Eğer 404 alıyorsanız, backend restart edin:**
   ```bash
   cd /var/www/api-stage/server
   npm run build
   pm2 restart api-stage
   # veya
   pm2 restart all
   ```

3. **Route'ların kayıtlı olup olmadığını kontrol edin:**
   - Backend log'larına bakın
   - PM2 log'larına bakın: `pm2 logs api-stage`

## Mevcut Endpoints

- `GET /api/hizli/incoming` - Gelen e-faturalar
- `GET /api/hizli/token-status` - Token durumu
- `POST /api/hizli/login` - Login işlemi
- `GET /api/hizli/urn-config` - URN yapılandırması

## Debug

404 hatası alınıyorsa:
1. Backend çalışıyor mu? (`pm2 list`)
2. Backend port'u doğru mu? (3020)
3. Route kayıtlı mı? (Controller import edilmiş mi?)
4. Build edilmiş mi? (`dist` klasöründe `hizli.controller.js` var mı?)

