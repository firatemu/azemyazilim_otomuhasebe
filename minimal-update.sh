#!/usr/bin/env bash
# ============================================
# Minimal ve Güvenli Güncelleme
# - Mevcut dosyaları KORUR (ezmez), sadece gerekli eklemeleri yapar
# - Caddyfile güncellenir (domain routing + auto-SSL + security headers + www→apex)
# - .env.* içine PORT=3000 eklenir (yoksa)
# - Makefile'a yeni hedefler eklenir (var olanlar silinmez)
# - /var/www/run-deployment.sh oluşturulur (tek komut orchestrator)
# - Tüm yazma işlemlerinde Yedek alınır: .bak-YYYYmmdd_HHMMSS
# ============================================

set -euo pipefail

# 0) PARAMETRELER — DÜZENLE
ROOT_DIR="${ROOT_DIR:-/var/www}"

# Domainler
PROD_ROOT="${PROD_ROOT:-otomuhasebe.com}"
PROD_API="${PROD_API:-api.otomuhasebe.com}"
PROD_ADMIN="${PROD_ADMIN:-admin.otomuhasebe.com}"

STG_ROOT="${STG_ROOT:-staging.otomuhasebe.com}"
STG_API="${STG_API:-staging-api.otomuhasebe.com}"
STG_ADMIN="${STG_ADMIN:-admin-staging.otomuhasebe.com}"

# Caddy ACME email
CADDY_EMAIL="${CADDY_EMAIL:-admin@otomuhasebe.com}"

# Health yolları
API_HEALTH_PATH="${API_HEALTH_PATH:-/health}"
UI_HEALTH_PATH="${UI_HEALTH_PATH:-/}"

# Prod image çekimi (tek image – farklı ENV standardı)
IMAGE_REGISTRY="${IMAGE_REGISTRY:-ghcr.io/your-org}"
API_IMAGE_NAME="${API_IMAGE_NAME:-my-saas-api}"
ADMIN_IMAGE_NAME="${ADMIN_IMAGE_NAME:-my-saas-admin}"
LANDING_IMAGE_NAME="${LANDING_IMAGE_NAME:-my-saas-landing}"
IMAGE_TAG_DEFAULT="${IMAGE_TAG_DEFAULT:-latest}"

# DB yedek (opsiyonel)
PG_USER="${PG_USER:-user}"
PG_DB="${PG_DB:-prod_db}"
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5432}"

# Migration komutu (projene göre düzenle)
MIGRATE_CMD="${MIGRATE_CMD:-npm run prisma:migrate-deploy}"

# 1) Yardımcılar
ts() { date +%Y%m%d_%H%M%S; }
compose_cmd() {
  if docker compose version >/dev/null 2>&1; then echo "docker compose";
  elif command -v docker-compose >/dev/null 2>&1; then echo "docker-compose";
  else echo "Docker Compose yok." >&2; exit 1; fi
}
backup_file() { local f="$1"; [ -f "$f" ] || return 0; cp -a "$f" "$f.bak-$(ts)"; echo "  ↳ yedek: $f.bak-$(ts)"; }

# 2) Dizinleri oluştur
mkdir -p "$ROOT_DIR/docker/compose" "$ROOT_DIR/docker/caddy" "$ROOT_DIR/backups" "$ROOT_DIR/scripts"
echo "✓ Dizinler hazır."

# 3) .env dosyalarında PORT=3000 sağla (varsa dokunma, yoksa ekle)
ensure_env_port() {
  local envfile="$1"
  if [ -f "$envfile" ]; then
    if grep -q '^PORT=' "$envfile"; then
      echo "• PORT mevcut: $envfile (değiştirilmedi)"
    else
      backup_file "$envfile"
      echo "PORT=3000" >> "$envfile"
      echo "✓ PORT=3000 eklendi: $envfile"
    fi
  else
    echo "Uyarı: $envfile bulunamadı (atlandı)"
  fi
}
ensure_env_port "$ROOT_DIR/docker/compose/.env.staging"
ensure_env_port "$ROOT_DIR/docker/compose/.env.production"

# 4) Caddyfile güncelle (domain-based routing + security headers + www→apex)
CADDYFILE="$ROOT_DIR/docker/caddy/Caddyfile"
touch "$CADDYFILE"; backup_file "$CADDYFILE"
cat > "$CADDYFILE" <<EOF
{
  email ${CADDY_EMAIL}
}

# www → apex (PROD)
www.${PROD_ROOT} {
  redir https://${PROD_ROOT}{uri} permanent
}

(secure_headers) {
  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "SAMEORIGIN"
    Referrer-Policy "no-referrer-when-downgrade"
  }
}

# === PRODUCTION ===
${PROD_API} {
  import secure_headers
  reverse_proxy backend:3000
}
${PROD_ADMIN} {
  import secure_headers
  reverse_proxy admin-panel:3000
}
${PROD_ROOT} {
  import secure_headers
  reverse_proxy landing-page:3000
}

# === STAGING === (HSTS yok)
${STG_API} {
  reverse_proxy backend-staging:3000
}
${STG_ADMIN} {
  reverse_proxy admin-panel-staging:3000
}
${STG_ROOT} {
  reverse_proxy landing-page-staging:3000
}
EOF
echo "✓ Caddyfile güncellendi: $CADDYFILE"

# 5) Makefile'a yeni hedefleri ekle (var olanları silmeden)
MAKEFILE="$ROOT_DIR/Makefile"
touch "$MAKEFILE"; backup_file "$MAKEFILE"
append_target() {
  local name="$1"; shift
  if grep -q "^[[:space:]]*$name:" "$MAKEFILE"; then
    echo "• Makefile hedefi zaten var: $name (atlandı)"
  else
    printf "\n%s:\n\t%s\n" "$name" "$*" >> "$MAKEFILE"
    echo "✓ Makefile hedefi eklendi: $name"
  fi
}

COMPOSE=$(compose_cmd)
BASE="$ROOT_DIR/docker/compose/docker-compose.base.yml"
STAGING="$ROOT_DIR/docker/compose/docker-compose.staging.yml"
PROD="$ROOT_DIR/docker/compose/docker-compose.prod.yml"

append_target "up-staging"   "$COMPOSE -f $BASE -f $STAGING up -d --build"
append_target "migrate-staging" "$COMPOSE -f $BASE -f $STAGING run --rm backend-staging $MIGRATE_CMD"
append_target "logs-staging" "$COMPOSE -f $BASE -f $STAGING logs -f"
append_target "down-staging" "$COMPOSE -f $BASE -f $STAGING down"

append_target "pull-prod"    "IMAGE_TAG=\${IMAGE_TAG:-$IMAGE_TAG_DEFAULT} $COMPOSE -f $BASE -f $PROD pull"
append_target "migrate-prod" "IMAGE_TAG=\${IMAGE_TAG:-$IMAGE_TAG_DEFAULT} $COMPOSE -f $BASE -f $PROD run --rm backend $MIGRATE_CMD"
append_target "up-prod"      "IMAGE_TAG=\${IMAGE_TAG:-$IMAGE_TAG_DEFAULT} $COMPOSE -f $BASE -f $PROD up -d"
append_target "logs-prod"    "$COMPOSE -f $BASE -f $PROD logs -f"
append_target "down-prod"    "$COMPOSE -f $BASE -f $PROD down"
append_target "deploy-prod"  "IMAGE_TAG=\${IMAGE_TAG:-$IMAGE_TAG_DEFAULT} make -C $ROOT_DIR pull-prod && make -C $ROOT_DIR migrate-prod && make -C $ROOT_DIR up-prod"

append_target "backup-prod"  "mkdir -p $ROOT_DIR/backups && pg_dump -Fc -U $PG_USER -h $PG_HOST -p $PG_PORT $PG_DB > $ROOT_DIR/backups/prod_\$(date +%F_%H%M).dump"
append_target "restore-prod" '@if [ -z "$$DUMP" ]; then echo "DUMP dosyası: make restore-prod DUMP=backups/xxx.dump"; exit 1; fi; pg_restore -c -d '"$PG_DB"' $$DUMP'

# 6) Orchestrator script: /var/www/run-deployment.sh
RUN_FILE="/var/www/run-deployment.sh"
if [ -f "$RUN_FILE" ]; then backup_file "$RUN_FILE"; fi
tee "$RUN_FILE" >/dev/null <<'EOS'
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
EOS
chmod +x "$RUN_FILE"
echo "✓ Orchestrator oluşturuldu: $RUN_FILE"

# 7) Kısa kullanım notu
echo ""
echo "=== Minimal Güncellemeler Tamam ✅ ==="
echo "Caddyfile güncellendi: $CADDYFILE"
echo "Makefile hedefleri eklendi (var olanlar silinmedi): $MAKEFILE"
echo "ENV port kontrolü yapıldı (.env.staging/.env.production)."
echo "Orchestrator hazır: $RUN_FILE"
echo ""
echo "Örnek komutlar:"
echo "  bash $RUN_FILE up-staging"
echo "  bash $RUN_FILE migrate-staging"
echo "  IMAGE_TAG=1.0.0 bash $RUN_FILE up-prod"
echo "  bash $RUN_FILE deploy-prod --tag 1.0.0"
echo "  bash $RUN_FILE smoke"
