# Staging Build ve Deploy

Sunucuda RAM yetersiz olduğu için staging build sunucuda yapılmaz. İki seçenek:

1. **GitHub Actions (önerilen):** Build CI'da yapılır, image'lar GHCR'a push edilir, sunucu `docker pull` ile çeker. Bkz. `.github/workflows/staging-deploy.yml`
2. **Lokal build:** Lokal makinede build, .tar ile sunucuya SCP + `docker load`

**Hedef sunucu:** `root@31.210.210.185` (stnoto.com)

## Gereksinimler

- Lokal makinede Docker (4 GB+ RAM önerilir)
- Uzak sunucuda Docker ve proje kurulu olmalı
- SSH erişimi: `root@31.210.210.185` (şifre veya key)

## Adımlar

### 1. Lokal build

Proje kökünde:

```bash
./scripts/build-staging-local.sh
```

- Backend ve panel image'ları build edilir
- `dist-staging-images/` altına `otomuhasebe-backend-staging.tar` ve `otomuhasebe-user-panel-staging.tar` yazılır

### 2. Uzak sunucuya gönder ve yükle

Varsayılan hedef `root@31.210.210.185`. Parametre vermeden veya farklı sunucu ile:

```bash
./scripts/deploy-staging-to-server.sh
# veya
./scripts/deploy-staging-to-server.sh root@31.210.210.185
```

- .tar dosyaları sunucuya kopyalanır
- Sunucuda `docker load` ile image'lar yüklenir
- SSH şifre veya key gerekebilir

### 3. Sunucuda servisleri başlat

SSH ile sunucuya bağlanın:

```bash
ssh root@31.210.210.185
cd /var/www/otomuhasebe
```

Önce altyapıyı (postgres, redis, minio, caddy) başlatın, sonra staging:

```bash
docker compose -f docker/compose/docker-compose.base.yml up -d
# GitHub Actions kullanıyorsanız (GHCR image'ları):
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.ghcr.yml up -d
# Lokal .tar deploy kullanıyorsanız:
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.pull.yml up -d
```

`.env.staging` dosyası proje kökünde (`/var/www/otomuhasebe/.env.staging`) olmalı.

## Farklı domain (ör. stnoto.com)

Panel image içinde `NEXT_PUBLIC_API_BASE_URL` build zamanında sabitlenir. stnoto.com için `https://api.stnoto.com` kullanılır:
- **GitHub Actions:** Workflow zaten `--build-arg NEXT_PUBLIC_API_BASE_URL=https://api.stnoto.com` ile build eder
- **Lokal build:** `docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.stnoto.com ...` veya Dockerfile'daki ARG varsayılanını değiştirin

## Özet

| Adım | Nerede | Komut |
|------|--------|--------|
| Build (GitHub Actions) | CI | Actions → "Staging Deploy (stnoto.com)" manuel veya push to main/staging |
| Build (lokal) | Lokal (Docker kurulu) | `./scripts/build-staging-local.sh` |
| Deploy (lokal .tar) | Lokal | `./scripts/deploy-staging-to-server.sh` (hedef: root@31.210.210.185) |
| Çalıştır (GHCR) | Sunucu | `docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.ghcr.yml up -d` |
| Çalıştır (lokal .tar) | Sunucu | `docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.pull.yml up -d` |

**Not:** Build için Docker gerekir. WSL kullanıyorsanız Docker Desktop WSL entegrasyonunu açın veya build’i Docker kurulu başka bir makinede yapın.
