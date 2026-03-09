#!/bin/bash

# RLS Migration Script - Service'leri prisma → prisma.extended'ye geçir
# Bu script otomatik olarak tüm service dosyalarını tarar ve günceller

set -e

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}═════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  RLS Service Migration Script${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

SERVICE_DIR="/home/azem/projects/otomuhasebe/api-stage/server/src/modules"

# Pattern'ler (regex escape edildi)
PATTERN="this\.prisma\.[a-zA-Z]+\.[a-zA-Z]+("
REPLACEMENT="this.prisma.extended."

# İstatistikler
TOTAL_FILES=0
UPDATED_FILES=0
TOTAL_REPLACEMENTS=0

echo -e "${YELLOW}📂 Service dizini tarıyor: $SERVICE_DIR${NC}"
echo ""

# Tüm service dosyalarını bul (recursive)
find "$SERVICE_DIR" -name "*.service.ts" -type f | while read -r service_file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    # Dosya adını göster
    filename=$(basename "$service_file")
    dir=$(dirname "$service_file" | xargs basename)
    
    # Bu dosyada pattern var mı kontrol et?
    if grep -q "this\.prisma\.[a-zA-Z]\+\." "$service_file"; then
        # Kaç değişiklik yapılacak?
        count=$(grep -o "this\.prisma\.[a-zA-Z]\+\." "$service_file" | wc -l)
        
        # Replace yap - her satırı işle
        sed -i 's/this\.prisma\./this.prisma.extended./g' "$service_file"
        
        UPDATED_FILES=$((UPDATED_FILES + 1))
        TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + count))
        
        echo -e "${GREEN}✓${NC} $dir/$filename - ${YELLOW}$count${NC} değişiklik"
    else
        echo -e "  $dir/$filename - ${YELLOW}değişiklik yok${NC}"
    fi
done

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Özet${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "  Toplam dosya tarandı:       ${YELLOW}$TOTAL_FILES${NC}"
echo -e "  Güncellenen dosya:        ${GREEN}$UPDATED_FILES${NC}"
echo -e "  Toplam değişiklik:         ${GREEN}$TOTAL_REPLACEMENTS${NC}"
echo ""

if [ $UPDATED_FILES -eq 0 ]; then
    echo -e "${RED}⚠️  Hiçbir dosya güncellenmedi!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Migration tamamlandı!${NC}"
    echo ""
    echo -e "${YELLOW}Sonraki adım:${NC}"
    echo "  1. Application rebuild:"
    echo "     cd /home/azem/projects/otomuhasebe/api-stage && docker build -f server/Dockerfile.staging.prod -t otomuhasebe-backend:latest ."
    echo ""
    echo "  2. Container restart:"
    echo "     cd /home/azem/projects/otomuhasebe && docker restart otomuhasebe-backend-staging"
    echo ""
    echo "  3. Test:"
    echo "     curl http://localhost:3020/api/rls/status"
fi