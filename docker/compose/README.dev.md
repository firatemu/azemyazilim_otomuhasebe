# Geliştirme (Developer mod + Hot reload)

**Tek komut – Caddy ve migrate servisi yok:**

```bash
cd docker/compose
docker compose -f docker-compose.dev.yml --env-file .env.staging up -d
```

- **Panel:** http://localhost:3010 (developer mod açık, kaynak volume ile bağlı, değişiklikler yansır)
- **Backend:** http://localhost:3020

`.env.staging` içinde `POSTGRES_PASSWORD`, `MINIO_*` vb. tanımlı olmalı. Yoksa `--env-file .env.staging` yerine `.env` kullanın veya değişkenleri ortama verin.

**Developer mod:** Panel container'da `NODE_ENV=development` ve `NEXT_PUBLIC_DEVELOPER_MODE=true` otomatik ayarlı.

**Eski yöntem (base + staging.dev):**  
`docker compose -f docker-compose.base.yml -f docker-compose.staging.dev.yml up -d` — migrate servisi kaldırıldı.
