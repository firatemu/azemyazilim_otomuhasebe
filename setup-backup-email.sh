#!/usr/bin/env bash
set -euo pipefail

echo "==============================================="
echo " OTOMUHASEBE | Günlük Yedekleme + E-posta (CURL)"
echo "==============================================="
echo "⚠️  APT/DPKG sorunu nedeniyle 'curl' ile mail gönderilecek."
echo "ℹ️  Bu script /usr/local/bin altına backup scriptlerini kurar."

# ==========================
# 0) KULLANICI AYARLARI
# ==========================
ROOT_DIR="${ROOT_DIR:-/var/www}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/otomuhasebe}"
CRON_SCHEDULE="${CRON_SCHEDULE:-0 3 * * *}"

# E-posta
SMTP_USER="${SMTP_USER:-otomuhasebe.app@gmail.com}"
MAIL_FROM="${MAIL_FROM:-info@otomuhasebe.com}"
MAIL_TO="${MAIL_TO:-frtygtcn@gmail.com}"
SMTP_HOST="${SMTP_HOST:-smtp.gmail.com}"

# ==========================
# 1) ÖN KONTROLLER
# ==========================
echo "→ Ön kontroller..."
sudo mkdir -p "$BACKUP_DIR" "/var/log/otomuhasebe-backup"
sudo chown -R root:root "$BACKUP_DIR" "/var/log/otomuhasebe-backup"
sudo chmod 700 "$BACKUP_DIR"

if ! command -v curl >/dev/null 2>&1; then
  echo "❌ 'curl' bulunamadı. Lütfen curl kurun,"
  exit 1
fi

[ -f "$ROOT_DIR/docker/compose/docker-compose.base.yml" ] || { echo "❌ Compose base dosyası yok"; exit 1; }

# ==========================
# 2) GMAIL ŞİFRE KAYDI
# ==========================
SECRET_FILE="/etc/otomuhasebe-mail.secret"
if [ ! -f "$SECRET_FILE" ]; then
  echo ""
  echo "Gmail App Password gerekiyor (curl ile gönderim için)."
  echo -n "Lütfen ${SMTP_USER} için App Password girin (görünmez): "
  read -r -s APP_PASS
  echo

  echo "$APP_PASS" | sudo tee "$SECRET_FILE" >/dev/null
  sudo chmod 600 "$SECRET_FILE"
  sudo chown root:root "$SECRET_FILE"
  echo "✅ Şifre kaydedildi: $SECRET_FILE (chmod 600)"
  unset APP_PASS
else
  echo "ℹ️ Şifre dosyası mevcut: $SECRET_FILE – atlanıyor."
fi

# ==========================
# 3) BACKUP SCRIPT OLUŞTUR
# ==========================
BACKUP_SCRIPT="/usr/local/bin/otomuhasebe_backup_all.sh"
echo "→ Backup script: $BACKUP_SCRIPT"

# Using cat <<'EOS' | sudo tee ... prevents expansion and avoids nested quote hell
cat <<'EOS' | sudo tee "$BACKUP_SCRIPT" >/dev/null
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/var/www}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/otomuhasebe}"
LOG_DIR="${LOG_DIR:-/var/log/otomuhasebe-backup}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

BASE="${BASE:-$ROOT_DIR/docker/compose/docker-compose.base.yml}"
PG_SERVICE="${PG_SERVICE:-postgres}"
PG_USER="${PG_USER:-postgres}"
PG_DB="${PG_DB:-otomuhasebe_prod}"
REDIS_SERVICE="${REDIS_SERVICE:-redis}"

CADDYFILE="${CADDYFILE:-$ROOT_DIR/docker/caddy/Caddyfile}"
COMPOSE_DIR="${COMPOSE_DIR:-$ROOT_DIR/docker/compose}"
ENV_STG="${ENV_STG:-$COMPOSE_DIR/.env.staging}"
ENV_PRD="${ENV_PRD:-$COMPOSE_DIR/.env.production}"
UPLOADS_DIR="${UPLOADS_DIR:-$ROOT_DIR/uploads}"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$BACKUP_DIR/$STAMP"
mkdir -p "$OUT_DIR" "$LOG_DIR"

log_file="$LOG_DIR/backup_$STAMP.log"
exec > >(tee -a "$log_file") 2>&1

echo "=== BACKUP START @ $(date -Is) ==="

# 1) Postgres
echo "[1/4] PostgreSQL dump: $PG_DB"
if docker compose -f "$BASE" ps -q "$PG_SERVICE" >/dev/null 2>&1; then
  docker compose -f "$BASE" exec -T "$PG_SERVICE" pg_dump -U "$PG_USER" -d "$PG_DB" -Fc > "$OUT_DIR/postgres_${PG_DB}_${STAMP}.dump"
else
  echo "⚠️ Postgres servisi ($PG_SERVICE) çalışmıyor, dump alınamadı!"
fi

# 2) Redis
echo "[2/4] Redis snapshot"
if docker compose -f "$BASE" ps -q "$REDIS_SERVICE" >/dev/null 2>&1; then
  REDIS_TMP="$OUT_DIR/redis_${STAMP}"
  mkdir -p "$REDIS_TMP" || true
  docker compose -f "$BASE" cp "$REDIS_SERVICE":/data "$REDIS_TMP" >/dev/null 2>&1 || true
  tar -C "$OUT_DIR" -czf "$OUT_DIR/redis_${STAMP}.tar.gz" "redis_${STAMP}/" 2>/dev/null || true
  rm -rf "$REDIS_TMP" || true
else
  echo "⚠️ Redis servisi çalışmıyor, snapshot alınamadı."
fi

# 3) Config
echo "[3/4] Config & .env"
CFG_TMP="$OUT_DIR/config_${STAMP}"
mkdir -p "$CFG_TMP"
cp -a "$CADDYFILE" "$CFG_TMP/" 2>/dev/null || true
cp -a "$COMPOSE_DIR"/*.yml "$CFG_TMP/" 2>/dev/null || true
cp -a "$ENV_STG" "$CFG_TMP/" 2>/dev/null || true
cp -a "$ENV_PRD" "$CFG_TMP/" 2>/dev/null || true
tar -C "$OUT_DIR" -czf "$OUT_DIR/config_${STAMP}.tar.gz" "config_${STAMP}/"
rm -rf "$CFG_TMP"

# 4) Uploads
echo "[4/4] Uploads"
if [ -d "$UPLOADS_DIR" ]; then
  tar -C "$UPLOADS_DIR" -czf "$OUT_DIR/uploads_${STAMP}.tar.gz" .
else
  echo "Uploads not found: $UPLOADS_DIR"
fi

# Checksum
( cd "$OUT_DIR" && sha256sum * > SHA256SUMS.txt )

# Rotasyon
echo "→ Rotasyon: >$RETENTION_DAYS gün"
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +"$RETENTION_DAYS" -print -exec rm -rf {} \; || true

echo "=== BACKUP DONE @ $(date -Is) ==="
echo "OUT_DIR=$OUT_DIR"
EOS
sudo chmod +x "$BACKUP_SCRIPT"


# ==========================
# 4) WRAPPER (CURL İLE MAIL)
# ==========================
WRAPPER_SCRIPT="/usr/local/bin/otomuhasebe_backup_and_report.sh"
echo "→ Wrapper script: $WRAPPER_SCRIPT"

# Note: We use tee again
cat <<'EOS' | sudo tee "$WRAPPER_SCRIPT" >/dev/null
#!/usr/bin/env bash
set -euo pipefail

SMTP_USER="otomuhasebe.app@gmail.com"
MAIL_FROM="info@otomuhasebe.com"
MAIL_TO="frtygtcn@gmail.com"
SECRET_FILE="/etc/otomuhasebe-mail.secret"
LOG_DIR="/var/log/otomuhasebe-backup"

STAMP="$(date +%Y%m%d_%H%M%S)"

# Backup çalıştır
if /usr/local/bin/otomuhasebe_backup_all.sh; then
  STATUS="SUCCESS"
else
  STATUS="FAIL"
fi

# Logu bul
LAST_LOG="$(ls -1t $LOG_DIR/backup_*.log | head -n1 || true)"
OUT_DIR=""
if [ -f "$LAST_LOG" ]; then
  OUT_DIR_LINE="$(grep -E '^OUT_DIR=' "$LAST_LOG" | tail -n1 || true)"
  OUT_DIR="${OUT_DIR_LINE#OUT_DIR=}"
fi

# Post-Backup Checks
PG_FILE="$(ls $OUT_DIR/postgres_* 2>/dev/null | head -n1 || true)"
REDIS_FILE="$(ls $OUT_DIR/redis_* 2>/dev/null | head -n1 || true)"
CFG_FILE="$(ls $OUT_DIR/config_* 2>/dev/null | head -n1 || true)"
UPLOADS_FILE="$(ls $OUT_DIR/uploads_* 2>/dev/null | head -n1 || true)"

[ -s "$PG_FILE" ]      && AC_PG="✅ VAR ($(du -h "$PG_FILE" | cut -f1))"      || AC_PG="❌ YOK"
[ -s "$REDIS_FILE" ]   && AC_REDIS="✅ VAR ($(du -h "$REDIS_FILE" | cut -f1))"   || AC_REDIS="⚠️ YOK"
[ -s "$CFG_FILE" ]     && AC_CFG="✅ VAR ($(du -h "$CFG_FILE" | cut -f1))"     || AC_CFG="❌ YOK"
[ -s "$UPLOADS_FILE" ] && AC_UP="✅ VAR ($(du -h "$UPLOADS_FILE" | cut -f1))" || AC_UP="⚠️ YOK"

SUBJECT="[OTOMUHASEBE] Backup Raporu: ${STATUS} - ${STAMP}"
EMAIL_BODY_FILE="/tmp/backup_email_${STAMP}.txt"

cat > "$EMAIL_BODY_FILE" <<EOF
From: $MAIL_FROM
To: $MAIL_TO
Subject: $SUBJECT

OTOMUHASEBE GÜNLÜK YEDEKLEME RAPORU
===================================
Tarih: $(date -Is)
Durum: $STATUS
Klasör: $OUT_DIR

Yedeklenen Parçalar:
--------------------
1) Veritabanı (Postgres): $AC_PG
2) Önbellek (Redis):      $AC_REDIS
3) Konfigürasyon:         $AC_CFG
4) Kullanıcı Dosyaları:   $AC_UP

Son 50 Satır Log:
-----------------
$(tail -n 50 "$LAST_LOG" 2>/dev/null || echo "Log okunamadı")
EOF

if [ -f "$SECRET_FILE" ]; then
  MAIL_PASS="$(cat "$SECRET_FILE")"
  echo "→ E-posta gönderiliyor ($MAIL_TO)..."
  curl --url "smtps://smtp.gmail.com:465" \
    --ssl-reqd \
    --mail-from "$MAIL_FROM" \
    --mail-rcpt "$MAIL_TO" \
    --user "$SMTP_USER:$MAIL_PASS" \
    --upload-file "$EMAIL_BODY_FILE" || echo "❌ E-posta gönderilemedi"
else
  echo "❌ Secret file yok."
fi

rm -f "$EMAIL_BODY_FILE"
EOS
sudo chmod +x "$WRAPPER_SCRIPT"

# ==========================
# 5) CRON TANIMI
# ==========================
CRON_FILE="/etc/cron.d/otomuhasebe-backup"
echo "→ Cron setup: $CRON_FILE"

cat <<EOF | sudo tee "$CRON_FILE" >/dev/null
# Otomuhasebe Günlük Backup (CURL)
# Env vars
MAIL_FROM=$MAIL_FROM
MAIL_TO=$MAIL_TO
ROOT_DIR=$ROOT_DIR
BACKUP_DIR=$BACKUP_DIR

$CRON_SCHEDULE root /usr/local/bin/otomuhasebe_backup_and_report.sh >> /var/log/otomuhasebe-backup/cron.log 2>&1
EOF
sudo chmod 644 "$CRON_FILE"
sudo service cron reload || true

echo ""
echo "✅ Kurulum tamamlandı. Cron: $CRON_FILE"
echo "→ Test et: sudo /usr/local/bin/otomuhasebe_backup_and_report.sh"
