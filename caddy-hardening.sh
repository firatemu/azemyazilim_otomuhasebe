#!/usr/bin/env bash
set -euo pipefail

# ==========================================================
# CADDY PROD FİNAL: Hardening + Rate-limit + Checklist + (Opsiyonel) Monitoring
# Bu script:
#  - Caddyfile'ı hardening + rate-limit ile günceller
#  - panel/admin/www/api domainlerini service-name ile yönlendirir
#  - Caddy'yi 80/443'te başlatır ve smoke test yapar
#  - Prod checklist doğrulamalarını çıkarır (PASS/ATTENTION)
#  - (Opsiyonel) Uptime Kuma monitoring kurar (port 3001)
#  - PostgreSQL role hardening için rehber notu basar
# Not: Nginx zaten kaldırıldı/disable durumda olduğu varsayılır.
# ==========================================================

# -------------------- KULLANICI AYARLARI -------------------
ROOT_DIR="${ROOT_DIR:-/var/www}"  # docker/compose bunun altında olmalı
APP_PORT="${APP_PORT:-3000}"

DOMAIN_PANEL="${DOMAIN_PANEL:-panel.otomuhasebe.com}"   # User Panel
DOMAIN_ADMIN="${DOMAIN_ADMIN:-admin.otomuhasebe.com}"   # Admin Panel
DOMAIN_WWW="${DOMAIN_WWW:-www.otomuhasebe.com}"         # Landing
DOMAIN_API="${DOMAIN_API:-api.otomuhasebe.com}"         # Backend API

# Docker compose SERVICE isimleri (compose'undaki "services:" altındaki isimler)
SERVICE_PANEL="${SERVICE_PANEL:-user-panel}"
SERVICE_ADMIN="${SERVICE_ADMIN:-admin-panel}"
SERVICE_LANDING="${SERVICE_LANDING:-landing-page}"
SERVICE_API="${SERVICE_API:-backend}"  # api için ayrı servis varsa

# Uptime Kuma (opsiyonel)
INSTALL_UPTIME_KUMA="${INSTALL_UPTIME_KUMA:-false}"
KUMA_PORT="${KUMA_PORT:-3001}"

# Yol kısaltmaları
BASE="$ROOT_DIR/docker/compose/docker-compose.base.yml"
STG="$ROOT_DIR/docker/compose/docker-compose.staging.yml"  # referans
CADDYFILE="$ROOT_DIR/docker/caddy/Caddyfile"
LOG="${LOG:-/var/www/cutover-hardening-report.txt}"

mkdir -p "$(dirname "$LOG")" || true
exec > >(tee "$LOG") 2>&1

# -------------------- Yardımcılar --------------------------
ok(){ echo "✅ $*"; }
warn(){ echo "⚠️  $*" >&2; }
fail(){ echo "❌ $*" >&2; exit 1; }
have(){ command -v "$1" >/dev/null 2>&1; }

compose_bin(){
  if docker compose version >/dev/null 2>&1; then echo "docker compose";
  elif have docker-compose; then echo "docker-compose";
  else echo ""; fi
}

# -------------------- Ön Kontroller ------------------------
echo "=== Ön Kontroller ==="
COMPOSE=$(compose_bin); [ -n "$COMPOSE" ] || fail "docker compose / docker-compose bulunamadı."
systemctl is-active --quiet docker || fail "Docker aktif değil."
[ -f "$BASE" ] || fail "Eksik: $BASE"
[ -f "$CADDYFILE" ] || fail "Eksik: $CADDYFILE (Caddyfile yok)."

$COMPOSE -f "$BASE" config >/dev/null || fail "Compose config hatalı."
ok "Docker & Compose OK, dosyalar mevcut."

# -------------------- Caddyfile YEDEK + FİNAL YAZ ---------
echo ""
echo "=== Caddyfile hardening + prod routing yazılıyor ==="
cp -a "$CADDYFILE" "$CADDYFILE.bak-$(date +%s)"
cat > "$CADDYFILE" <<'CADDY'
# ==========================================================
# CADDY PROD FINAL (Hardening + Rate-limit + Logs)
# ==========================================================

# Global options (opsiyonel e-posta ekleyebilirsin)
{
  email admin@otomuhasebe.com
  # acme_ca https://acme-v02.api.letsencrypt.org/directory
}

# ---- Ortak güvenlik ve performans ayarları (snippet) ----
(common_security) {
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "SAMEORIGIN"
    Referrer-Policy "strict-origin-when-cross-origin"
    Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:"
    # İhtiyacına göre CSP'yi sıkılaştır
  }
  encode gzip zstd
  # Access log format (JSON gibi structured log istiyorsan uncomment)
  # log {
  #   output file /var/log/caddy/access.log
  #   format json
  # }
}

# ---- Basit rate-limit snippet (IP başına) ----
# Not: Caddy'nin built-in basit limit örneği (golang matcher + requests)
# Daha gelişmiş ihtiyaçlar için rate-limiter eklentisi veya upstream limit önerilir.
(rate_limited_auth) {
  @authPaths {
    path /login*
    path /auth*
    path /api/login*
    path /api/auth*
  }
  # Client IP başına 1dk'da 60 istek (örnek)
  rate_limit @authPaths {
    key {remote_host}
    window 1m
    burst 20
    rate 60
  }
}

# ==========================================================
#    PROD ROUTING (Service-name → Docker içi :3000)
# ==========================================================

# User Panel
{DOMAIN_PANEL} {
  import common_security
  reverse_proxy {SERVICE_PANEL}:{APP_PORT}
}

# Admin Panel
{DOMAIN_ADMIN} {
  import common_security
  import rate_limited_auth
  # Admin panel container port 80 (Vite)
  reverse_proxy {SERVICE_ADMIN}:80
}

# Landing (www)
{DOMAIN_WWW} {
  import common_security
  reverse_proxy {SERVICE_LANDING}:{APP_PORT}
}

# API (opsiyonel ayrı domain)
{DOMAIN_API} {
  import common_security
  # API login/auth rate-limit uygula
  import rate_limited_auth
  reverse_proxy {SERVICE_API}:{APP_PORT}
}
CADDY

# Değişkenleri yerine koy
sed -i "s#{DOMAIN_PANEL}#${DOMAIN_PANEL}#g" "$CADDYFILE"
sed -i "s#{DOMAIN_ADMIN}#${DOMAIN_ADMIN}#g" "$CADDYFILE"
sed -i "s#{DOMAIN_WWW}#${DOMAIN_WWW}#g" "$CADDYFILE"
sed -i "s#{DOMAIN_API}#${DOMAIN_API}#g" "$CADDYFILE"

sed -i "s#{SERVICE_PANEL}#${SERVICE_PANEL}#g" "$CADDYFILE"
sed -i "s#{SERVICE_ADMIN}#${SERVICE_ADMIN}#g" "$CADDYFILE"
sed -i "s#{SERVICE_LANDING}#${SERVICE_LANDING}#g" "$CADDYFILE"
sed -i "s#{SERVICE_API}#${SERVICE_API}#g" "$CADDYFILE"
sed -i "s#{APP_PORT}#${APP_PORT}#g" "$CADDYFILE"

ok "Caddyfile güncellendi: $CADDYFILE"

# -------------------- Caddy'yi 80/443 ile ayağa kaldır -----
echo ""
echo "=== Caddy 80/443 ile başlatılıyor ==="
# Not: Base compose içinde caddy ports: "80:80", "443:443" açık olmalı.
# Önceden Caddy'nin 80:80/443:443 ile çalıştığından emin olmak için override kullanıyoruz
OVERRIDE="/tmp/caddy-prod-override.yml"
cat > "$OVERRIDE" <<EOF
version: "3.9"
services:
  caddy:
    ports:
      - "80:80"
      - "443:443"
EOF

$COMPOSE -f "$BASE" -f "$OVERRIDE" up -d caddy
sleep 5
$COMPOSE -f "$BASE" -f "$OVERRIDE" ps caddy || true
$COMPOSE -f "$BASE" -f "$OVERRIDE" logs --tail=80 caddy || true

# -------------------- Prod Checklist Otomatik Test --------
echo ""
echo "=== PROD CHECKLIST & SMOKE ==="

ALL_PASS=true

echo "1) 80/443'ü Caddy dinliyor mu?"
ss -lntp | grep -E ':80 |:443 ' || { warn "80/443 dinlenmiyor (Caddy container?)"; ALL_PASS=false; }

echo ""
echo "2) Docker servisleri up mı?"
$COMPOSE -f "$BASE" ps || { warn "Compose ps başarısız"; ALL_PASS=false; }

echo ""
echo "3) Domain Smoke (2xx/3xx beklenir)"
for url in \
  "https://${DOMAIN_PANEL}" \
  "https://${DOMAIN_ADMIN}" \
  "https://${DOMAIN_WWW}" \
  "https://${DOMAIN_API}/api/health"
do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)
  echo "→ $url → HTTP $code"
  [[ "$code" =~ ^2|^3 ]] || ALL_PASS=false
done

echo ""
echo "4) Caddy loglarında kritik hata var mı? (özet)"
$COMPOSE -f "$BASE" logs --tail=50 caddy | egrep -i "error|panic|tls|acme" || true

echo ""
echo "=== CHECKLIST SONUÇ ==="
if [ "$ALL_PASS" = true ]; then
  ok "PROD READY: Tüm kontroller geçti."
else
  warn "ATTENTION: Bazı kontroller başarısız. Caddy ve servis loglarını inceleyin."
fi

# -------------------- (Opsiyonel) Uptime Kuma Kur -----------
if [ "$INSTALL_UPTIME_KUMA" = "true" ]; then
  echo ""
  echo "=== Uptime Kuma kuruluyor (opsiyonel) ==="
  docker volume create uptime-kuma-data >/dev/null 2>&1 || true
  docker run -d --name uptime-kuma \
    -p ${KUMA_PORT}:3001 \
    -v uptime-kuma-data:/app/data \
    --restart unless-stopped \
    louislam/uptime-kuma:1
  ok "Uptime Kuma çalışıyor → http://SUNUCU_IP:${KUMA_PORT}"
  echo "Önerilen monitor hedefleri:"
  echo "- https://${DOMAIN_PANEL}"
  echo "- https://${DOMAIN_ADMIN}"
  echo "- https://${DOMAIN_WWW}"
  echo "- https://${DOMAIN_API}/api/health"
fi

# -------------------- Postgres Role Hardening Notu ---------
cat <<'PGHARD'

==========================================================
 PostgreSQL Role Hardening (öneri – prod öncesi 5dk)
==========================================================
- Şu an root (superuser) ile çalışmanız yeterli oldu.
- Prod için aşağıdaki yaklaşımı öneririz:

1) Uygulama rolü oluşturun (süperuser değil):
   CREATE ROLE app_user WITH LOGIN PASSWORD 'GÜÇLÜ_PAROLA';
   GRANT CONNECT ON DATABASE otomuhasebe_prod TO app_user;

2) Şema/tabela yetkilerini kademeli verin (örnek):
   \c otomuhasebe_prod
   CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION app_user;
   GRANT USAGE ON SCHEMA public TO app_user;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

3) .env.production içinde:
   DATABASE_URL=postgresql://app_user:...@postgres:5432/otomuhasebe_prod

Not: Prisma migrate işlemleri için ayrı bir yetkili rol kullanabilirsiniz (migration runner).
PGHARD

echo ""
echo "=== TAMAMLANDI ==="
echo "Rapor: $LOG"
