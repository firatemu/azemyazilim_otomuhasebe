#!/bin/bash
# SAFE STAGING BRING-UP (fail-fast)
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/var/www}"
LOG="${LOG:-/var/www/deployment.log}"
WAIT_HTTP_SECONDS="${WAIT_HTTP_SECONDS:-90}"
STG_API="${STG_API:-staging-api.otomuhasebe.com}"
STG_ADMIN="${STG_ADMIN:-admin-staging.otomuhasebe.com}"
STG_ROOT="${STG_ROOT:-staging.otomuhasebe.com}"
API_HEALTH_PATH="${API_HEALTH_PATH:-/health}"
UI_HEALTH_PATH="${UI_HEALTH_PATH:-/}"

log(){ echo -e "\n== $* =="; }
fail(){ echo "ERROR: $*" >&2; exit 1; }
compose_cmd(){ docker compose version >/dev/null 2>&1 && echo "docker compose" || echo "docker-compose"; }
as_root(){ [ "$(id -u)" -ne 0 ] && sudo "$@" || "$@"; }
wait_http_inside(){
  local name="$1" path="$2" limit="$3" elapsed=0
  while [ "$elapsed" -lt "$limit" ]; do
    if docker exec -i "$name" wget -qO- "http://localhost:3000${path}" >/dev/null 2>&1; then
      echo "OK: ${name} -> ${path}"; return 0
    fi
    sleep 3; elapsed=$((elapsed+3))
  done
  return 1
}

exec > >(tee -a "$LOG") 2>&1
echo -e "\n=== RUN @ $(date -Is) ==="

# 1) Prisma bulma
log "Prisma bulma"
API_CTX="$ROOT_DIR/api-stage"
FOUND=""
for p in "$ROOT_DIR/prisma" "$API_CTX/prisma" "$API_CTX/server/prisma"; do
  if [ -f "$p/schema.prisma" ]; then FOUND="$p"; break; fi
done
if [ -z "$FOUND" ]; then fail "Prisma schema.prisma bulunamadı"; fi
log "✓ Prisma: $FOUND"

# Hedef klasör: $API_CTX/prisma
PRISMA_DIR="$API_CTX/prisma"
if [ ! -d "$PRISMA_DIR" ]; then
  mkdir -p "$PRISMA_DIR"
  rsync -a --delete "$FOUND/" "$PRISMA_DIR/"
  log "✓ Prisma kopyalandı: $FOUND → $PRISMA_DIR"
fi

# 2) Docker reset
log "Docker reset"
as_root systemctl restart docker
sleep 3
as_root mkdir -p /var/run
[ -S /run/docker.sock ] && as_root ln -sf /run/docker.sock /var/run/docker.sock || true

# 3) Compose kontrol
COMPOSE=$(compose_cmd)
BASE="$ROOT_DIR/docker/compose/docker-compose.base.yml"
STG="$ROOT_DIR/docker/compose/docker-compose.staging.yml"
ENV_STG="$ROOT_DIR/docker/compose/.env.staging"
[ -f "$BASE" ] && [ -f "$STG" ] && [ -f "$ENV_STG" ] || fail "Compose dosyaları eksik"
$COMPOSE -f "$BASE" -f "$STG" config >/dev/null || fail "Compose merge hatası"

# 4) Nginx stop → Caddy up
log "Caddy up"
as_root systemctl stop nginx 2>/dev/null || true
$COMPOSE -f "$BASE" up -d caddy
sleep 5
$COMPOSE -f "$BASE" logs --tail=30 caddy || true

# 5) Staging create + backend
log "Backend-staging build + up"
$COMPOSE -f "$BASE" -f "$STG" up --no-start || true
$COMPOSE -f "$BASE" -f "$STG" build backend-staging
$COMPOSE -f "$BASE" -f "$STG" up -d backend-staging

# Backend CID al
BACKEND_CID=$(docker ps -qf "name=backend-staging" || sudo docker ps -qf "name=backend-staging" || true)
[ -n "$BACKEND_CID" ] || fail "Backend container oluşmadı"
log "Backend CID: $BACKEND_CID"

# Backend health bekle
log "Backend health bekleme (${WAIT_HTTP_SECONDS}s)"
wait_http_inside "backend-staging" "$API_HEALTH_PATH" "$WAIT_HTTP_SECONDS" || fail "Backend health başarısız"

# 6) Admin + Landing
log "Admin & Landing build + up"
$COMPOSE -f "$BASE" -f "$STG" up -d --build admin-panel-staging
$COMPOSE -f "$BASE" -f "$STG" up -d --build user-panel-staging
$COMPOSE -f "$BASE" -f "$STG" up -d --build landing-page-staging
$COMPOSE -f "$BASE" -f "$STG" ps

# 7) Smoke test
log "Smoke test"
check(){ local u="$1" code; code=$(curl -s -o /dev/null -w "%{http_code}" "$u" || true); echo "$code - $u"; [[ "$code" =~ ^2|^3 ]] && return 0 || return 1; }
ok=1
check "https://${STG_API}${API_HEALTH_PATH}" || ok=0
check "https://${STG_ADMIN}${UI_HEALTH_PATH}" || ok=0
check "https://${STG_ROOT}${UI_HEALTH_PATH}" || ok=0

if [ "$ok" -eq 1 ]; then echo -e "\n=== TAMAMLANDI ✅ ==="
else log "Smoke FAILED"; exit 1; fi
