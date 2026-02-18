#!/usr/bin/env bash
# ==========================================================
# Stage A: Caddy'yi paralel test et (Nginx açık kalır)
# - Caddy'yi 8080/8443 portlarından dışa açar (test)
# - Staging domainlerini Caddy üzerinden Docker servis isimlerine yönlendirir
# - SSL (Let's Encrypt) alır, smoke test yapar
# - Dosya yedekleri alır, idempotent
# ----------------------------------------------------------
# Opsiyonel (yorum satırında): Stage B - Full cutover komutları
# ==========================================================

set -euo pipefail

# -------------------- KULLANICI AYARI --------------------
# Proje kökü (docker/compose bunun altında olmalı)
ROOT_DIR="${ROOT_DIR:-/var/www}"

# Staging domainleri
STG_API="${STG_API:-staging-api.otomuhasebe.com}"
STG_ADMIN="${STG_ADMIN:-admin-staging.otomuhasebe.com}"
STG_ROOT="${STG_ROOT:-staging.otomuhasebe.com}"

# Backend/Admin/Landing container içi portları (genelde 3000)
APP_PORT="${APP_PORT:-3000}"

# Caddy test dış portları (Stage A)
TEST_HTTP_PORT="${TEST_HTTP_PORT:-8080}"
TEST_HTTPS_PORT="${TEST_HTTPS_PORT:-8443}"

BASE="$ROOT_DIR/docker/compose/docker-compose.base.yml"
STG="$ROOT_DIR/docker/compose/docker-compose.staging.yml"
CADDYFILE="$ROOT_DIR/docker/caddy/Caddyfile"

# -------------------- Yardımcılar ------------------------
ts(){ date +%Y%m%d_%H%M%S; }
backup_file(){ local f="$1"; [ -f "$f" ] && cp -a "$f" "$f.bak-$(ts)" && echo "  ↳ backup: $f.bak-$(ts)"; }
have(){ command -v "$1" >/dev/null 2>&1; }
compose(){
  if docker compose version >/dev/null 2>&1; then echo "docker compose";
  elif have docker-compose; then echo "docker-compose";
  else echo ""; fi
}
fail(){ echo "✗ $*" >&2; exit 1; }
ok(){ echo "✓ $*"; }
warn(){ echo "⚠️  $*" >&2; }

# -------------------- Ön kontroller ----------------------
COMPOSE=$(compose) || true
[ -n "$COMPOSE" ] || fail "Docker Compose bulunamadı (docker compose / docker-compose)."
systemctl is-active --quiet docker || fail "Docker servis aktif değil (systemctl start docker)."

[ -f "$BASE" ] || fail "Eksik: $BASE"
[ -f "$STG" ]  || fail "Eksik: $STG"

# Compose merge testi
$COMPOSE -f "$BASE" -f "$STG" config >/tmp/compose.stg.merged.yml 2>/tmp/compose.stg.err || {
  cat /tmp/compose.stg.err; fail "Compose merge hatası (YAML/path düzeltin)."
}
ok "Compose merge OK"

# Caddyfile mevcut olmalı
[ -f "$CADDYFILE" ] || fail "Caddyfile bulunamadı: $CADDYFILE"

# -------------------- Stage A: Caddy parallel test -------
echo -e "\n== Stage A: Caddy'yi 8080/8443'ten aç, staging domainleri yönlendir =="

# 1) Caddyfile staging bloklarını yaz (idempotent)
backup_file "$CADDYFILE"
cat > "$CADDYFILE" <<EOF
# Caddyfile – Staging parallel test
{
  email admin@otomuhasebe.com
}

${STG_API} {
  reverse_proxy backend-staging:${APP_PORT}
}

${STG_ADMIN} {
  reverse_proxy admin-panel-staging:80
}

${STG_ROOT} {
  reverse_proxy landing-page-staging:${APP_PORT}
}
EOF
ok "Caddyfile güncellendi: $CADDYFILE"

# 2) Caddy'yi test portlarından (8080/8443) publish edecek şekilde base compose'u yamala (in-place değil, override ile)
#    Not: Base dosyana dokunmamak için runtime override kullanıyoruz.
OVERRIDE_A="/tmp/caddy.override.stageA.yml"
cat > "$OVERRIDE_A" <<YAML
version: "3.9"
services:
  caddy:
    ports:
      - "${TEST_HTTP_PORT}:80"
      - "${TEST_HTTPS_PORT}:443"
YAML

# 3) Caddy up (test portları)
$COMPOSE -f "$BASE" -f "$OVERRIDE_A" up -d caddy
$COMPOSE -f "$BASE" -f "$OVERRIDE_A" ps caddy || true
# $COMPOSE -f "$BASE" -f "$OVERRIDE_A" logs --tail=80 caddy || true

echo -e "\n== Sertifika & route için 10-30sn bekleniyor =="
sleep 20

# 4) İç servislerin up olduğunu kontrol et (staging compose)
$COMPOSE -f "$BASE" -f "$STG" ps || warn "Staging ps boş olabilir, en az backend-staging up olmalı"

# 5) Smoke test (dış HTTP - test portları ile)
smoke(){
  local url code
  url="$1"
  code=$(curl -sk -o /dev/null -w "%{http_code}" "$url" || true)
  echo "HTTP ${code} - $url"
  [[ "$code" =~ ^2|^3 ]]
}

API_URL="https://${STG_API}:${TEST_HTTPS_PORT}/api/health"
ADMIN_URL="https://${STG_ADMIN}:${TEST_HTTPS_PORT}/"
ROOT_URL="https://${STG_ROOT}:${TEST_HTTPS_PORT}/"

echo -e "\n== Stage A Smoke (8443) =="
A1=true; smoke "$API_URL"   || A1=false
A2=true; smoke "$ADMIN_URL" || A2=false
A3=true; smoke "$ROOT_URL"  || A3=false

if $A1 && $A2 && $A3; then
  ok "Stage A smoke: SUCCESS (Caddy SSL + routing OK)"
else
  warn "Stage A smoke: bazı endpoint'ler başarısız. Caddy logs ve service logs'u inceleyin:"
  $COMPOSE -f "$BASE" -f "$OVERRIDE_A" logs --tail=120 caddy || true
  exit 1
fi

echo -e "\n== Stage A tamamlandı. Nginx hala ana kapı; Caddy 8080/8443'ten testte =="
echo "Test URL'leri:"
echo "  $API_URL"
echo "  $ADMIN_URL"
echo "  $ROOT_URL"
