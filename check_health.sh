#!/bin/bash
# ==========================================================
# Docker Sağlık & Smoke Test (Staging) - Değişiklik yapmaz
# ==========================================================
set -euo pipefail

# ------------ AYARLAR ------------
ROOT_DIR="${ROOT_DIR:-/var/www}"
STG_API="${STG_API:-staging-api.otomuhasebe.com}"
STG_ADMIN="${STG_ADMIN:-admin-staging.otomuhasebe.com}"
STG_ROOT="${STG_ROOT:-staging.otomuhasebe.com}"
API_HEALTH_PATH="${API_HEALTH_PATH:-/api/health}"
UI_HEALTH_PATH="${UI_HEALTH_PATH:-/}"

# Postgres servis ve kimlik bilgileri
PG_SERVICE="${PG_SERVICE:-postgres}"
PG_USER="${PG_USER:-postgres}"
PG_DB="${PG_DB:-otomuhasebe_stage}"

# Yol kısaltmalar
BASE="$ROOT_DIR/docker/compose/docker-compose.base.yml"
STG="$ROOT_DIR/docker/compose/docker-compose.staging.yml"

LOG="${LOG:-/var/www/docker-health-report.txt}"
TMP="/tmp/docker-health-$$"
mkdir -p "$(dirname "$LOG")" "$TMP" || true
exec > >(tee "$LOG") 2>&1

# ------------ Yardımcılar ------------
ok(){ printf "\e[32m✓ %s\e[0m\n" "$*"; }
warn(){ printf "\e[33m⚠️  %s\e[0m\n" "$*" >&2; }
fail(){ printf "\e[31m✗ %s\e[0m\n" "$*" >&2; }
have(){ command -v "$1" >/dev/null 2>&1; }
compose_bin(){
  if docker compose version >/dev/null 2>&1; then echo "docker compose";
  elif have docker-compose; then echo "docker-compose";
  else echo ""; fi
}
http_code(){ curl -s -o /dev/null -k -w "%{http_code}" "$1" || true; }

# ------------ 1) Docker/Socket/Compose ------------
echo "=== Docker/Socket/Compose Kontrolleri ==="
systemctl is-active --quiet docker && ok "Docker service: active" || { fail "Docker service: inactive"; exit 1; }

if [ -S /run/docker.sock ] || [ -S /var/run/docker.sock ]; then
  ok "Docker socket mevcut"
else
  fail "Docker socket bulunamadı"
fi

COMPOSE=$(compose_bin)
if [ -n "$COMPOSE" ]; then
  $COMPOSE version || true
  ok "Compose bulundu"
else
  fail "Compose bulunamadı (docker compose / docker-compose)"
  exit 1
fi

# Aktif context uyarısı
if docker context ls >/dev/null 2>&1; then
  ACTIVE_CTX=$(docker context ls | awk '/\*/ {print $1}')
  [ "$ACTIVE_CTX" = "default" ] && ok "Docker context: default" || warn "Docker context aktif: $ACTIVE_CTX (default değil)"
fi

# ------------ 2) Compose dosyaları & merge ------------
echo "=== Compose Dosyaları ==="
[ -f "$BASE" ] && ok "Base: $BASE" || { fail "Eksik: $BASE"; exit 1; }
[ -f "$STG" ]  && ok "Staging: $STG" || { fail "Eksik: $STG"; exit 1; }

echo "--- Compose merge testi (staging) ---"
if $COMPOSE -f "$BASE" -f "$STG" config > "$TMP/compose.stg.merged.yml" 2>"$TMP/compose.err"; then
  ok "Compose merge OK → $TMP/compose.stg.merged.yml"
else
  fail "Compose merge hatası:"
  sed -n '1,120p' "$TMP/compose.err"
  exit 1
fi

# ------------ 3) Container ve network durumu ------------
echo "=== Container & Network Durumu ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || true
echo "--- Compose ps (staging) ---"
$COMPOSE -f "$BASE" -f "$STG" ps || true

echo "--- Network listesi ---"
docker network ls || true

# ------------ 4) PostgreSQL bağlantı testi ------------
echo "=== PostgreSQL Bağlantı Testi ==="
if $COMPOSE -f "$BASE" ps "$PG_SERVICE" | grep -q Up; then
  ok "Postgres container Up"
  if $COMPOSE -f "$BASE" exec -T "$PG_SERVICE" pg_isready -U "$PG_USER" -h localhost >/dev/null 2>&1; then
    ok "pg_isready OK (user=$PG_USER)"
  else
    warn "pg_isready başarısız (user=$PG_USER). Yine de psql deneyelim."
  fi
  if $COMPOSE -f "$BASE" exec -T "$PG_SERVICE" psql -U "$PG_USER" -d postgres -c "\conninfo" >/dev/null 2>&1; then
    ok "psql conninfo OK (user=$PG_USER, db=postgres)"
  else
    fail "psql bağlanamadı (user=$PG_USER, db=postgres). DATABASE_URL ve kullanıcıyı doğrulayın."
  fi
  if $COMPOSE -f "$BASE" exec -T "$PG_SERVICE" psql -U "$PG_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$PG_DB';" | grep -q 1; then
    ok "Hedef DB mevcut: $PG_DB"
  else
    warn "Hedef DB bulunamadı: $PG_DB (migrate/CREATE DATABASE adımı gerekli olabilir)"
  fi
else
  warn "Postgres Up değil (compose ps $PG_SERVICE)."
fi

# ------------ 5) İç HTTP testleri (container içinden) ------------
echo "=== İç HTTP Testleri (Container içinden) ==="

INTERNAL_PASS=true

# Backend-staging
if $COMPOSE -f "$BASE" -f "$STG" ps backend-staging | grep -q Up; then
  # Note: Container name might be compose-backend-staging-1 or otomuhasebe-backend-staging
  B_CONT=$($COMPOSE -f "$BASE" -f "$STG" ps -q backend-staging)
  if docker exec -T $B_CONT wget -qO- "http://127.0.0.1:3000${API_HEALTH_PATH}" >/dev/null 2>&1; then
    ok "backend-staging iç HTTP OK (${API_HEALTH_PATH})"
  else
    INTERNAL_PASS=false; fail "backend-staging iç HTTP FAIL (${API_HEALTH_PATH})"
    $COMPOSE -f "$BASE" -f "$STG" logs --tail=120 backend-staging || true
  fi
else
  INTERNAL_PASS=false; warn "backend-staging Up değil"
fi

# admin-panel-staging
if $COMPOSE -f "$BASE" -f "$STG" ps admin-panel-staging | grep -q Up; then
  A_CONT=$($COMPOSE -f "$BASE" -f "$STG" ps -q admin-panel-staging)
  if docker exec -T $A_CONT wget -qO- --retry-connrefused --tries=2 "http://127.0.0.1:3000${UI_HEALTH_PATH}" >/dev/null 2>&1; then
    ok "admin-panel-staging iç HTTP OK (${UI_HEALTH_PATH})"
  else
    INTERNAL_PASS=false; fail "admin-panel-staging iç HTTP FAIL (${UI_HEALTH_PATH})"
    $COMPOSE -f "$BASE" -f "$STG" logs --tail=120 admin-panel-staging || true
  fi
else
  warn "admin-panel-staging Up değil"
fi

# landing-page-staging
if $COMPOSE -f "$BASE" -f "$STG" ps landing-page-staging | grep -q Up; then
  L_CONT=$($COMPOSE -f "$BASE" -f "$STG" ps -q landing-page-staging)
  if docker exec -T $L_CONT wget -qO- "http://127.0.0.1:3000${UI_HEALTH_PATH}" >/dev/null 2>&1; then
    ok "landing-page-staging iç HTTP OK (${UI_HEALTH_PATH})"
  else
    INTERNAL_PASS=false; fail "landing-page-staging iç HTTP FAIL (${UI_HEALTH_PATH})"
    $COMPOSE -f "$BASE" -f "$STG" logs --tail=120 landing-page-staging || true
  fi
else
  warn "landing-page-staging Up değil"
fi

# ------------ 6) Caddy & Dış HTTP (DNS/SSL) ------------
echo "=== Caddy & Dış HTTP (DNS/SSL) ==="

if $COMPOSE -f "$BASE" ps caddy | grep -q Up; then
  ok "Caddy Up (80/443)"
  $COMPOSE -f "$BASE" logs --tail=50 caddy || true
else
  warn "Caddy Up değil"
fi

OUT_API=$(http_code "https://${STG_API}${API_HEALTH_PATH}")
OUT_ADMIN=$(http_code "https://${STG_ADMIN}${UI_HEALTH_PATH}")
OUT_ROOT=$(http_code "https://${STG_ROOT}${UI_HEALTH_PATH}")
echo "HTTP ${OUT_API} - https://${STG_API}${API_HEALTH_PATH}"
echo "HTTP ${OUT_ADMIN} - https://${STG_ADMIN}${UI_HEALTH_PATH}"
echo "HTTP ${OUT_ROOT} - https://${STG_ROOT}${UI_HEALTH_PATH}"

OUT_PASS=true
[[ "$OUT_API" =~ ^2|^3 ]] || OUT_PASS=false
[[ "$OUT_ADMIN" =~ ^2|^3 ]] || OUT_PASS=false
[[ "$OUT_ROOT" =~ ^2|^3 ]] || OUT_PASS=false

# ------------ 7) Özet PASS/FAIL ------------
echo "=== Özet ==="
ALL_PASS=true

if [ "$INTERNAL_PASS" = true ]; then ok "İç HTTP (container içi) testleri: OK"; else ALL_PASS=false; fail "İç HTTP testleri: FAIL"; fi
if $COMPOSE -f "$BASE" -f "$STG" ps | grep -q Up; then ok "Staging servisleri: en az biri Up"; else ALL_PASS=false; fail "Staging servisleri Up değil"; fi
if [ "$OUT_PASS" = true ]; then ok "Dış HTTP (Caddy+DNS) smoke: OK"; else warn "Dış HTTP smoke bazı alanlarda başarısız (Caddy logları/DNS/SSL kontrol edin)"; fi

echo "Log dosyası: $LOG"
[ "$ALL_PASS" = true ] && { echo ">>> GENEL DURUM: PASS"; exit 0; } || { echo ">>> GENEL DURUM: ATTENTION (bazı testler başarısız)"; exit 1; }
