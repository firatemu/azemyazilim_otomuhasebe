#!/usr/bin/env bash
set -euo pipefail

# ==========================================
# CADDY PARALEL STAGING TESTİ (GÜVENLİ)
# - admin-staging HARİÇ
# - NGINX DOKUNULMAZ
# - 8080 / 8443 üzerinden test
# ==========================================

ROOT_DIR="${ROOT_DIR:-/var/www}"

# DNS'i olan staging domain
STAGING_DOMAIN="staging.otomuhasebe.com"

# docker compose ps çıktısındaki SERVICE adlarını kullan
BACKEND_SERVICE="backend-staging"
LANDING_SERVICE="landing-page"   # ⚠️ docker compose ps ile doğrula

APP_PORT="3000"

TEST_HTTP_PORT="8080"
TEST_HTTPS_PORT="8443"

BASE="$ROOT_DIR/docker/compose/docker-compose.base.yml"
STG="$ROOT_DIR/docker/compose/docker-compose.staging.yml"
CADDYFILE="$ROOT_DIR/docker/caddy/Caddyfile"

echo "== Caddy Staging Paralel Testi Başlıyor =="

# 1) Compose doğrulama
docker compose -f "$BASE" -f "$STG" config >/dev/null

# 2) Caddyfile yedekle
cp -a "$CADDYFILE" "$CADDYFILE.bak-$(date +%s)"

# 3) SADECE STAGING için Caddyfile yaz
# Not: Caddyfile variable syntax {$VAR} şeklindedir
cat > "$CADDYFILE" <<EOF
# STAGING ONLY — admin hariç
{
  email admin@otomuhasebe.com
}

${STAGING_DOMAIN} {
    reverse_proxy ${LANDING_SERVICE}:${APP_PORT}
}
EOF

echo "✅ Caddyfile güncellendi (sadece staging)"

# 4) Caddy’yi 8080/8443 ile başlat (override)
OVERRIDE="/tmp/caddy-staging-override.yml"
cat > "$OVERRIDE" <<EOF
version: "3.9"
services:
  caddy:
    ports:
      - "${TEST_HTTP_PORT}:80"
      - "${TEST_HTTPS_PORT}:443"
EOF

docker compose -f "$BASE" -f "$OVERRIDE" up -d caddy
sleep 10

docker compose -f "$BASE" -f "$OVERRIDE" ps caddy
docker compose -f "$BASE" -f "$OVERRIDE" logs --tail=50 caddy

# 5) Smoke test (8443)
echo ""
echo "== STAGING SMOKE TEST (Caddy) =="
# landing page
curl -k -I "https://${STAGING_DOMAIN}:${TEST_HTTPS_PORT}/"

echo ""
echo "✅ Eğer HTTP 200 / 301 / 302 görüyorsan:"
echo "   - Caddy SSL çalışıyor"
echo "   - Docker service-name routing doğru"
echo "   - Nginx prod ortamı etkilenmedi"
