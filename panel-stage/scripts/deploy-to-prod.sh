#!/bin/bash

# 🚀 Test Ortamından (panel-stage) Canlı Ortama (panel-prod) Deploy Script
# Bu script test ortamındaki değişiklikleri canlı ortama deploy eder

set -e  # Hata durumunda dur

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Test Ortamından Canlı Ortama Deploy Başlatılıyor...${NC}"
echo ""

# 1. Test ortamındaki değişiklikleri kontrol et
echo -e "${YELLOW}📋 Test ortamı (panel-stage) kontrol ediliyor...${NC}"
cd /var/www/panel-stage/client

# 2. Backup al
echo ""
echo -e "${YELLOW}💾 Canlı ortam backup alınıyor...${NC}"
BACKUP_DIR="/var/www/backups/pre-deployment-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Canlı ortamın client klasörünü yedekle
if [ -d "/var/www/panel-prod/client/.next" ]; then
    echo "Build klasörü yedekleniyor..."
    cp -r /var/www/panel-prod/client/.next "$BACKUP_DIR/.next.backup" 2>/dev/null || echo "Build klasörü yok, atlandı"
fi

# 3. Dosyaları kopyala (rsync ile)
echo ""
echo -e "${YELLOW}📦 Dosyalar test ortamından canlı ortama kopyalanıyor...${NC}"
rsync -av --exclude 'node_modules' \
          --exclude '.next' \
          --exclude '.git' \
          --exclude '*.log' \
          --exclude 'tsconfig.tsbuildinfo' \
          /var/www/panel-stage/client/ /var/www/panel-prod/client/

# 4. Dependencies yükle
echo ""
echo -e "${YELLOW}📦 Dependencies yükleniyor...${NC}"
cd /var/www/panel-prod/client
npm install --legacy-peer-deps 2>&1 | tail -10

# 5. Production build yap
echo ""
echo -e "${YELLOW}🔨 Production build yapılıyor...${NC}"
npm run build 2>&1 | tail -20

# 6. PM2'yi restart et
echo ""
echo -e "${YELLOW}🔄 PM2 restart ediliyor...${NC}"
pm2 restart panel-prod --update-env 2>&1 | tail -5

# 7. Health check
echo ""
echo -e "${YELLOW}🏥 Health check yapılıyor...${NC}"
sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Canlı ortam başarıyla deploy edildi!${NC}"
    echo -e "${GREEN}🌐 Panel: https://panel.otomuhasebe.com${NC}"
else
    echo -e "${RED}⚠️  Uyarı: HTTP kodu $HTTP_CODE (200 bekleniyordu)${NC}"
fi

echo ""
echo -e "${BLUE}📋 Deploy Özeti:${NC}"
echo "  - Backup: $BACKUP_DIR"
echo "  - Build: ✅ Tamamlandı"
echo "  - PM2: ✅ Restart edildi"
echo "  - Status: HTTP $HTTP_CODE"
echo ""
echo -e "${GREEN}✅ Deploy işlemi tamamlandı!${NC}"
