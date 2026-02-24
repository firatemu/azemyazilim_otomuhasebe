#!/usr/bin/env bash
# Build edilmiş staging image'larını (.tar) uzak sunucuya kopyalar ve docker load eder.
# Önce: ./scripts/build-staging-local.sh   (Docker kurulu bir makinede)
# Kullanım: ./scripts/deploy-staging-to-server.sh [KULLANICI@]SUNUCU_IP_veya_HOST
# Varsayılan sunucu: root@31.210.210.185 (stnoto.com)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="${PROJECT_ROOT}/dist-staging-images"
REMOTE="${1:-root@31.210.210.185}"

if [[ ! -f "${OUT_DIR}/otomuhasebe-backend-staging.tar" ]] || [[ ! -f "${OUT_DIR}/otomuhasebe-user-panel-staging.tar" ]]; then
  echo "Hata: Önce lokal build yapın (Docker kurulu makinede): ./scripts/build-staging-local.sh"
  exit 1
fi

REMOTE_DIR="/var/www/otomuhasebe/dist-staging-images"
echo "=============================================="
echo "Staging image'ları sunucuya gönderiliyor: $REMOTE"
echo "=============================================="

echo ""
echo "[1/3] Uzak dizin oluşturuluyor..."
ssh "$REMOTE" "mkdir -p $REMOTE_DIR"

echo ""
echo "[2/3] .tar dosyaları kopyalanıyor..."
scp "${OUT_DIR}/otomuhasebe-backend-staging.tar" "${OUT_DIR}/otomuhasebe-user-panel-staging.tar" "${REMOTE}:${REMOTE_DIR}/"

echo ""
echo "[3/3] Sunucuda docker load..."
ssh "$REMOTE" "cd $REMOTE_DIR && docker load -i otomuhasebe-backend-staging.tar && docker load -i otomuhasebe-user-panel-staging.tar"

echo ""
echo "Yükleme tamamlandı."
echo ""
echo "Sunucuda uygulamayı başlatmak için (base + pull compose):"
echo "  ssh $REMOTE"
echo "  cd /var/www/otomuhasebe"
echo "  docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.pull.yml up -d"
echo ""
