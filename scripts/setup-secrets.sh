#!/usr/bin/env bash
# ============================================================
# Otomuhasebe — Docker Secrets Kurulum Scripti
# Production sunucuda tek seferlik çalıştırılır.
#
# Kullanım:
#   chmod +x scripts/setup-secrets.sh
#   ./scripts/setup-secrets.sh
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_DIR="$(dirname "$SCRIPT_DIR")/secrets"

echo "🔐 Docker Secrets kurulumu başlıyor..."
echo "   Secrets klasörü: $SECRETS_DIR"

# Klasör yoksa oluştur
mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

# Daha önce oluşturulmuş secrets varsa sorguya gerek yok
create_secret() {
  local name="$1"
  local file="$SECRETS_DIR/${name}.txt"

  if [ -f "$file" ]; then
    echo "   ⚠️  $name zaten mevcut → atlanıyor"
    return
  fi

  openssl rand -hex 32 > "$file"
  chmod 400 "$file"
  echo "   ✅ $name oluşturuldu"
}

create_secret "postgres_password"
create_secret "redis_password"
create_secret "jwt_access_secret"
create_secret "jwt_refresh_secret"
create_secret "audit_hmac_secret"
create_secret "minio_root_password"

# .gitignore kontrolü
GITIGNORE="$(dirname "$SCRIPT_DIR")/.gitignore"
if ! grep -q "secrets/" "$GITIGNORE" 2>/dev/null; then
  echo "secrets/" >> "$GITIGNORE"
  echo "   ✅ secrets/ .gitignore'a eklendi"
fi

echo ""
echo "✅ Kurulum tamamlandı!"
echo ""
echo "Sonraki adım — production ortamını başlat:"
echo "  docker compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d"
echo ""
echo "⚠️  UYARI: secrets/ klasörünü asla git'e commit etme!"
