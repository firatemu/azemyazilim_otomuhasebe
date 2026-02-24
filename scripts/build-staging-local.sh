#!/usr/bin/env bash
# Staging image'larını lokal makinede build eder ve .tar olarak dışa aktarır.
# Kullanım: ./scripts/build-staging-local.sh
# Çıktı: dist-staging-images/otomuhasebe-backend-staging.tar, otomuhasebe-user-panel-staging.tar

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="${PROJECT_ROOT}/dist-staging-images"
BACKEND_IMAGE="otomuhasebe-backend-staging:latest"
PANEL_IMAGE="otomuhasebe-user-panel-staging:latest"

cd "$PROJECT_ROOT"
mkdir -p "$OUT_DIR"

echo "=============================================="
echo "Staging build (lokal)"
echo "=============================================="

echo ""
echo "[1/4] Backend-staging build..."
docker build \
  -f api-stage/server/Dockerfile.staging.prod \
  -t "$BACKEND_IMAGE" \
  api-stage

echo ""
echo "[2/4] User-panel-staging build..."
docker build \
  -f panel-stage/client/Dockerfile.staging.prod \
  -t "$PANEL_IMAGE" \
  panel-stage/client

echo ""
echo "[3/4] Image'lar .tar olarak kaydediliyor..."
docker save "$BACKEND_IMAGE" -o "${OUT_DIR}/otomuhasebe-backend-staging.tar"
docker save "$PANEL_IMAGE" -o "${OUT_DIR}/otomuhasebe-user-panel-staging.tar"

echo ""
echo "[4/4] Özet"
echo "  Backend:  ${OUT_DIR}/otomuhasebe-backend-staging.tar  ($(du -h "${OUT_DIR}/otomuhasebe-backend-staging.tar" | cut -f1))"
echo "  Panel:    ${OUT_DIR}/otomuhasebe-user-panel-staging.tar  ($(du -h "${OUT_DIR}/otomuhasebe-user-panel-staging.tar" | cut -f1))"
echo ""
echo "Uzak sunucuya göndermek için:"
echo "  ./scripts/deploy-staging-to-server.sh [KULLANICI@]SUNUCU"
echo ""
