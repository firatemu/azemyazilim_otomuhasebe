# Staging Ortamı Yeni Sunucuya Kurulum Rehberi

Bu rehber, OtoMuhasebe staging ortamını **stnoto.com** domain'inde yeni bir Ubuntu 22 sunucuda yayına almak için gerekli tüm adımları içerir.

**Hedef sunucu:** 31.210.43.185 (stnoto.com)

**Not:** Sunucuda RAM yetersiz olduğu için build işlemi **GitHub Actions** üzerinde yapılır. Sunucu sadece hazır image'ları çeker (`docker pull`) ve çalıştırır; sunucuda `next build` veya `nest build` yapılmaz.

---

## 0. GitHub Actions ile Deploy (Özet)

Build GitHub'da yapılır, sunucu sadece pull + up yapar:

1. **GitHub Secrets** ekleyin: `STAGING_SERVER_SSH_KEY` (root@31.210.43.185 için SSH private key), (opsiyonel) `GHCR_PAT` (private GHCR package için).
2. **Sunucu hazırlığı** (aşağıdaki §1–§8): Docker, clone, network, .env.staging, base compose, DB restore.
3. **DNS:** stnoto.com, api.stnoto.com, www.stnoto.com → 31.210.43.185
4. **İlk deploy:** GitHub Actions → "Staging Deploy (stnoto.com)" workflow'unu manuel çalıştırın (`workflow_dispatch`).
5. **Sonraki deploylar:** `main` veya `staging` branch'e push veya workflow'u manuel tetikleyin.

---

## 1. Sunucu Gereksinimleri

- **İşletim Sistemi:** Ubuntu 24.04 LTS
- **Minimum:** 2 CPU, 4 GB RAM, 20 GB disk
- **Önerilen:** 4 CPU, 8 GB RAM, 40 GB disk
- **Portlar:** 80, 443, 22 (SSH) açık olmalı

---

## 2. Kurulacak Programlar ve Servisler

### 2.1 Temel Paketler

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git tar gzip ca-certificates gnupg lsb-release
```

### 2.2 Docker Engine

```bash
# Docker GPG key ve repo
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Kurulum
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Kullanıcıyı docker grubuna ekle
sudo usermod -aG docker $USER
# Çıkış yapıp tekrar giriş yapın veya: newgrp docker
```

### 2.3 Doğrulama

```bash
docker --version
docker compose version
```

---

## 3. DNS Ayarları

Domain sağlayıcınızda aşağıdaki A kayıtlarını oluşturun (sunucu IP'nizi yazın):

| Kayıt | Tip | Değer | TTL |
|-------|-----|-------|-----|
| stnoto.com | A | 31.210.43.185 | 300 |
| api.stnoto.com | A | 31.210.43.185 | 300 |
| www.stnoto.com | A | 31.210.43.185 | 300 |

DNS yayılımı 5–30 dakika sürebilir. Kontrol: `dig stnoto.com +short`

---

## 4. Proje Kurulumu

### 4.1 Proje Dizini

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
```

### 4.2 GitHub'dan Clone

```bash
cd /var/www
git clone https://github.com/firatemu/otomuhasebe.git otomuhasebe
cd /var/www/otomuhasebe
```

---

## 5. Backup Dosyalarını Yükleme

Backup arşivini mevcut sunucudan yeni sunucuya aktarın:

**Mevcut sunucuda (backup alındıktan sonra):**
```bash
# Taşınabilir arşiv oluştur
cd /home/azem/projects/otomuhasebe
tar -czf staging_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C backups staging_full_*

# SCP ile yeni sunucuya gönder
scp backups/staging_backup_*.tar.gz root@31.210.43.185:/var/www/otomuhasebe/backups/
```

**Yeni sunucuda:**
```bash
cd /var/www/otomuhasebe
mkdir -p backups
# Backup dosyası scp ile geldiyse:
tar -xzf backups/staging_backup_*.tar.gz -C backups/
# veya doğrudan staging_full_* klasörünü backups/ içine kopyalayın
```

---

## 6. Veri Geri Yükleme

### 6.1 Altyapı Servislerini Başlat

```bash
cd /var/www/otomuhasebe
# Docker network (staging.ghcr compose external network kullanır)
docker network create compose_app_net 2>/dev/null || true
docker compose -f docker/compose/docker-compose.base.yml up -d postgres redis minio caddy
# Birkaç saniye bekleyin
sleep 10
```

### 6.2 PostgreSQL Restore

```bash
# Backup dosyasını bulun (staging_full_* içindeki otomuhasebe_stage_*.sql)
DB_BACKUP=$(ls backups/staging_full_*/otomuhasebe_stage_*.sql 2>/dev/null | head -1)
if [[ -n "$DB_BACKUP" ]]; then
  docker exec -i otomuhasebe-postgres psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS otomuhasebe_stage;"
  docker exec -i otomuhasebe-postgres psql -U postgres -d postgres -c "CREATE DATABASE otomuhasebe_stage;"
  docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage < "$DB_BACKUP"
  echo "PostgreSQL restore tamamlandı."
else
  echo "Uyarı: DB backup bulunamadı. Migration ile şema oluşturulacak."
fi
```

### 6.3 MinIO Restore

```bash
# MinIO bucket'ına veri yükle (backup'ta minio/otomuhasebe/ varsa)
MINIO_BACKUP=$(find backups -path "*/minio/otomuhasebe" -type d 2>/dev/null | head -1)
if [[ -n "$MINIO_BACKUP" && -d "$MINIO_BACKUP" ]]; then
  docker run --rm \
    -v "$(pwd)/$MINIO_BACKUP:/data:ro" \
    --network container:otomuhasebe-minio \
    --entrypoint /bin/sh \
    minio/mc:latest \
    -c "mc alias set backup http://localhost:9000 minioadmin minioadmin123 --api S3v4 && mc mb backup/otomuhasebe 2>/dev/null || true && mc mirror --overwrite /data/ backup/otomuhasebe/"
  echo "MinIO restore tamamlandı."
else
  echo "MinIO backup boş veya yok. Bucket uygulama ilk çalıştığında oluşturulacak."
fi
```

### 6.4 Uploads Klasörü Restore

```bash
UPLOADS_ARCHIVE=$(ls backups/staging_full_*/uploads_*.tar.gz 2>/dev/null | head -1)
if [[ -n "$UPLOADS_ARCHIVE" ]]; then
  tar -xzf "$UPLOADS_ARCHIVE" -C .
  echo "Uploads restore tamamlandı."
fi
```

---

## 7. Environment Yapılandırması

### 7.1 .env.staging Oluşturma

Backup içindeki `.env.staging` dosyasını kullanın veya `.env.staging.example` üzerinden oluşturun:

```bash
cp backups/staging_full_*/.env.staging .env.staging
# veya
cp .env.staging.example .env.staging
nano .env.staging  # Değerleri düzenleyin
```

### 7.2 Yeni Domain İçin Güncellemeler

`.env.staging` içinde şu satırları güncelleyin:

```env
CORS_ORIGINS=https://stnoto.com,https://www.stnoto.com,https://api.stnoto.com
NEXT_PUBLIC_API_BASE_URL=https://api.stnoto.com
VITE_API_BASE_URL=https://api.stnoto.com
```

**Güvenlik (önerilir):** Yeni sunucuda şifreleri değiştirin:
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` (docker-compose.base.yml ile uyumlu tutun)

### 7.3 Compose İçin .env.staging

```bash
# docker/compose/ staging servisleri proje kökündeki .env.staging kullanır
# env_file ../../.env.staging olarak ayarlı değilse, symlink oluşturun:
ln -sf "$(pwd)/.env.staging" docker/compose/.env.staging 2>/dev/null || cp .env.staging docker/compose/.env.staging
```

---

## 8. Caddyfile Güncellemesi

`docker/caddy/Caddyfile` dosyasına stnoto.com domain'leri eklenmiş olmalı. Kontrol edin:

```bash
grep -A5 "stnoto.com" docker/caddy/Caddyfile
```

Eksikse `docker/caddy/Caddyfile` içine aşağıdaki blokları ekleyin (mevcut staging bloklarından sonra):

```
# stnoto.com Staging
stnoto.com, www.stnoto.com {
  import common_security
  handle /api/* {
    reverse_proxy backend-staging:3000
  }
  handle {
    reverse_proxy user-panel-staging:3000
  }
}

api.stnoto.com {
  import common_security
  @root path /
  redir @root /api/health temporary
  reverse_proxy backend-staging:3000
}
```

---

## 9. Servisleri Başlatma

### 9.1 Staging (GitHub Actions ile – Önerilen)

Build sunucuda yapılmaz; image'lar GitHub Actions ile GHCR'a push edilir. Sunucuda sadece pull + up:

```bash
cd /var/www/otomuhasebe
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.ghcr.yml pull
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.ghcr.yml up -d
```

**İlk deploy:** GitHub Actions'ta "Staging Deploy (stnoto.com)" workflow'unu manuel çalıştırın; workflow otomatik olarak pull + up yapar.

**Lokal .tar ile (alternatif):** Lokal build + `./scripts/deploy-staging-to-server.sh root@31.210.43.185` kullanıyorsanız:
```bash
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.pull.yml up -d
```

### 9.2 Migration (İlk Kurulumda)

```bash
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.ghcr.yml run --rm backend-staging npx prisma migrate deploy
```

### 9.3 Servis Kontrolü

```bash
docker ps
curl -s http://localhost:3020/api/health
curl -s http://localhost:3010 | head -20
```

---

## 10. SSL ve Caddy

Caddy otomatik olarak Let's Encrypt ile SSL sertifikası alır. İlk istek geldiğinde sertifika oluşturulur.

- Port 80 ve 443 açık olmalı
- Domain DNS'i sunucuya yönlenmiş olmalı

```bash
docker logs otomuhasebe-caddy 2>&1 | tail -30
```

---

## 11. Doğrulama

1. **Panel:** https://stnoto.com veya https://www.stnoto.com
2. **API:** https://api.stnoto.com/api/health
3. **Giriş:** Mevcut staging kullanıcı bilgileriyle test edin

---

## 12. Sorun Giderme

### PostgreSQL bağlantı hatası
- Container çalışıyor mu: `docker ps | grep postgres`
- `.env.staging` içinde `DATABASE_URL` doğru mu (host: otomuhasebe-postgres)

### CORS hatası
- `CORS_ORIGINS` içinde yeni domain'ler var mı

### 502 Bad Gateway
- Backend ve panel container'ları çalışıyor mu
- `docker compose logs backend-staging`
- `docker compose logs user-panel-staging`

### MinIO erişim hatası
- `MINIO_ENDPOINT=otomuhasebe-minio` (container adı)
- Bucket adı: `otomuhasebe`

---

## 13. Yararlı Komutlar

```bash
# Loglar
make logs-staging

# Durdurma
make down-staging

# Yeniden başlatma
make down-staging && make up-staging
```
