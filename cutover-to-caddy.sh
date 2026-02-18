#!/usr/bin/env bash
set -euo pipefail

echo "============================================="
echo " NGINX → CADDY FULL CUTOVER (PRODUCTION)"
echo "============================================="

# ----------------------------------------------
# AYARLAR
# ----------------------------------------------
ROOT_DIR="${ROOT_DIR:-/var/www}"
APP_PORT="3000"

# PRODUCTION DOMAINLER
DOMAIN_PANEL="panel.otomuhasebe.com"
DOMAIN_ADMIN="admin.otomuhasebe.com"
DOMAIN_WWW="www.otomuhasebe.com"
DOMAIN_API="api.otomuhasebe.com"

# DOCKER SERVİS İSİMLERİ (compose SERVICE name)
SERVICE_PANEL="user-panel"
SERVICE_ADMIN="admin-panel"
SERVICE_LANDING="landing-page"
SERVICE_BACKEND="backend"

BASE="$ROOT_DIR/docker/compose/docker-compose.base.yml"
CADDYFILE="$ROOT_DIR/docker/caddy/Caddyfile"

# ----------------------------------------------
# GÜVENLİK KONTROLLERİ
# ----------------------------------------------
docker compose version >/dev/null 2>&1 || { echo "❌ docker compose yok"; exit 1; }
systemctl is-active --quiet docker || { echo "❌ docker çalışmıyor"; exit 1; }

echo "✅ Docker & Compose OK"

# ----------------------------------------------
# CADDYFILE YEDEKLE & PROD YAZ
# ----------------------------------------------
cp -a "$CADDYFILE" "$CADDYFILE.bak-$(date +%s)"

cat > "$CADDYFILE" <<EOF
# ==========================================
# PRODUCTION – CADDY ANA KAPI
# ==========================================
{
    email admin@otomuhasebe.com
}

$DOMAIN_PANEL {
    reverse_proxy $SERVICE_PANEL:$APP_PORT
}

$DOMAIN_ADMIN {
    reverse_proxy $SERVICE_ADMIN:80
}

$DOMAIN_WWW {
    reverse_proxy $SERVICE_LANDING:$APP_PORT
}

$DOMAIN_API {
    reverse_proxy $SERVICE_BACKEND:$APP_PORT
}
EOF

echo "✅ Caddyfile production domainlerle güncellendi"

# ----------------------------------------------
# NGINX'İ DEVREDEN ÇIKAR
# ----------------------------------------------
echo ""
echo "🛑 Nginx durduruluyor..."
sudo systemctl stop nginx
sudo systemctl disable nginx

# Portların boşaldığını kontrol et
sleep 2
ss -lntp | grep -E ':80 |:443 ' || echo "✅ 80/443 portları boş"

# ----------------------------------------------
# CADDY'Yİ GERÇEK PORTLARLA BAŞLAT
# ----------------------------------------------
echo ""
echo "🚀 Caddy 80/443 ile başlatılıyor..."

# Override dosyası oluştur (Ports 80/443 açmak için)
OVERRIDE="/tmp/caddy-prod-override.yml"
cat > "$OVERRIDE" <<EOF
version: "3.9"
services:
  caddy:
    ports:
      - "80:80"
      - "443:443"
EOF

# Base + Override ile başlat
docker compose -f "$BASE" -f "$OVERRIDE" up -d caddy

sleep 5
docker compose -f "$BASE" -f "$OVERRIDE" ps caddy
docker compose -f "$BASE" -f "$OVERRIDE" logs --tail=50 caddy

# ----------------------------------------------
# PROD SMOKE TEST
# ----------------------------------------------
echo ""
echo "🔎 PRODUCTION SMOKE TEST"

for url in \
  "https://${DOMAIN_PANEL}" \
  "https://${DOMAIN_ADMIN}" \
  "https://${DOMAIN_WWW}" \
  "https://${DOMAIN_API}/api/health"
do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "→ $url → HTTP $code"
done

echo ""
echo "✅ Eğer 200/301/302 görüyorsan CUTOVER BAŞARILI"

# ----------------------------------------------
# BİLGİ & ROLLBACK
# ----------------------------------------------
cat <<ROLLBACK

=============================================
 ✅ FULL CUTOVER TAMAMLANDI
=============================================

🔁 ROLLBACK (gerekirse):

sudo systemctl start nginx
sudo systemctl enable nginx
docker compose -f "$BASE" down caddy  # (Portları serbest bırakmak için)

➡️ Trafik anında eski haline döner.

=============================================
ROLLBACK
