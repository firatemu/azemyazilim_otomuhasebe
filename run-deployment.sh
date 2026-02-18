#!/usr/bin/env bash
set -euo pipefail

# ==== Kullanıcı ayarları ortamdan da gelebilir ====
ROOT_DIR="${ROOT_DIR:-/var/www}"
API_HEALTH_PATH="${API_HEALTH_PATH:-/health}"
UI_HEALTH_PATH="${UI_HEALTH_PATH:-/}"
IMAGE_TAG_DEFAULT="${IMAGE_TAG_DEFAULT:-latest}"
MIGRATE_CMD="${MIGRATE_CMD:-npm run prisma:migrate-deploy}"

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then echo "docker compose";
  elif command -v docker-compose >/dev/null 2>&1; then echo "docker-compose";
  else echo "Docker Compose yok." >&2; exit 1; fi
}

usage() {
  cat <<USAGE
Kullanım:
  bash $0 up-staging
  bash $0 migrate-staging
  bash $0 up-prod
  bash $0 deploy-prod [--tag X.Y.Z]
  bash $0 smoke
USAGE
}

smoke() {
  PROD_ROOT="${PROD_ROOT:-otomuhasebe.com}"
  PROD_API="${PROD_API:-api.otomuhasebe.com}"
  PROD_ADMIN="${PROD_ADMIN:-admin.otomuhasebe.com}"
  STG_ROOT="${STG_ROOT:-staging.otomuhasebe.com}"
  STG_API="${STG_API:-staging-api.otomuhasebe.com}"
  STG_ADMIN="${STG_ADMIN:-admin-staging.otomuhasebe.com}"

  check() { local url="$1"; local code; code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || true); echo "$code - $url"; [[ "$code" =~ ^2|^3 ]]; }
  ok=1
  check "https://${PROD_API}${API_HEALTH_PATH}" || ok=0
  check "https://${PROD_ADMIN}${UI_HEALTH_PATH}" || ok=0
  check "https://${PROD_ROOT}${UI_HEALTH_PATH}" || ok=0
  check "https://${STG_API}${API_HEALTH_PATH}" || ok=0
  check "https://${STG_ADMIN}${UI_HEALTH_PATH}" || ok=0
  check "https://${STG_ROOT}${UI_HEALTH_PATH}" || ok=0
  [ "$ok" -eq 1 ] && echo "✓ Smoke OK" || (echo "✗ Smoke FAILED"; exit 1)
}

cmd="${1:-}"; shift || true
[ -n "$cmd" ] || { usage; exit 1; }

COMPOSE=$(compose_cmd)
BASE="$ROOT_DIR/docker/compose/docker-compose.base.yml"
STAGING="$ROOT_DIR/docker/compose/docker-compose.staging.yml"
PROD="$ROOT_DIR/docker/compose/docker-compose.prod.yml"

case "$cmd" in
  up-staging)
    $COMPOSE -f "$BASE" -f "$STAGING" up -d --build
    ;;
  migrate-staging)
    $COMPOSE -f "$BASE" -f "$STAGING" run --rm backend-staging $MIGRATE_CMD
    ;;
  up-prod)
    IMAGE_TAG="${IMAGE_TAG:-$IMAGE_TAG_DEFAULT}" $COMPOSE -f "$BASE" -f "$PROD" up -d
    ;;
  deploy-prod)
    while [ "${1:-}" ]; do
      case "$1" in
        --tag) shift; export IMAGE_TAG="${1:-$IMAGE_TAG_DEFAULT}";;
        *) echo "Bilinmeyen argüman: $1"; exit 1;;
      esac; shift || true
    done
    make -C "$ROOT_DIR" deploy-prod
    ;;
  smoke)
    smoke
    ;;
  *)
    usage; exit 1;;
esac

echo "✓ Tamam: $cmd"
