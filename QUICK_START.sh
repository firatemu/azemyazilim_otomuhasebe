#!/bin/bash

# ============================================
# Hızlı Migration Başlangıç Scripti
# ============================================

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DATABASE MIGRATION - HIZLI BAŞLANGIÇ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Varsayılan ayarlar (docker-compose.base.yml'den)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-IKYYJ1R8fUZ3PItqxf6qel12VNbLYiOe}"
DB_NAME="${DB_NAME:-otomuhasebe_stage}"

echo -e "${YELLOW}Bağlantı Ayarları:${NC}"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Menü
echo -e "${YELLOW}Lütfen bir seçenek seçin:${NC}"
echo ""
echo "1) Tüm migration'ları sırayla çalıştır"
echo "2) Sadece TASK 1 çalıştır (TenantId düzeltmeleri)"
echo "3) Sadece TASK 5 çalıştır (Composite index'ler)"
echo "4) Sadece TASK 6 çalıştır (Multi-currency)"
echo "5) Sadece TASK 7 çalıştır (Çek/Senet ciro)"
echo "6) Sadece TASK 8 çalıştır (Float validation - rapor)"
echo "7) Sadece TASK 9 çalıştır (Marka normalizasyonu)"
echo "8) Sadece TASK 10 çalıştır (Kategori normalizasyonu)"
echo "9) Sadece TASK 11 çalıştır (Araç uyumluluk)"
echo "10) Sadece TASK 12 çalıştır (Birim mükerrerleri)"
echo "11) Sadece TASK 13 çalıştır (RLS hazırlığı)"
echo "12) Database bağlantısını test et"
echo "13) Çıkış"
echo ""
read -p "Seçiminiz (1-13): " choice

case $choice in
    1)
        echo -e "${GREEN}Tüm migration'lar çalıştırılıyor...${NC}"
        ./run_all_migrations.sh
        ;;
    2)
        echo -e "${GREEN}TASK 1 çalıştırılıyor...${NC}"
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_task_01_complete_fixed.sql
        ;;
    3)
        echo -e "${GREEN}TASK 5 çalıştırılıyor...${NC}"
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_task_05_composite_indexes_fixed.sql
        ;;
    4)
        echo -e "${GREEN}TASK 6 çalıştırılıyor...${NC}"
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_task_06_multi_currency_fixed.sql
        ;;
    5)
        echo -e "${GREEN}TASK 7 çalıştırılıyor...${NC}"
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_task_07_checkbill_endorsement_fixed.sql
        ;;
    6)
        echo -e "${GREEN}TASK 8 çalıştırılıyor...${NC}"
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_task_08_float_validation_fixed.sql
        ;;
    7)
        echo -e "${GREEN}TASK 9 çalıştırılıyor...${NC}"
        echo -e "${YELLOW}⚠ UYARI: Bu task manuel kontrol gerektirir!${NC}"
        echo "Mükerrerleri inceledikten sonra consolidate_duplicate_brands() fonksiyonunu çalıştırın."
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_task_09_brand_normalization_fixed.sql
        ;;
    8)
        echo -e "${GREEN}TASK 10 çalıştırılıyor...${NC}"
        echo -e "${YELLOW}⚠ UYARI: Bu task manuel kontrol gerektirir!${NC}"
        echo "Mükerrerleri inceledikten sonra consolidate_duplicate_categories() fonksiyonunu çalıştırın."
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_task_10_category_normalization_fixed.sql
        ;;
    9)
        echo -e "${GREEN}TASK 11 çalıştırılıyor...${NC}"
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_task_11_vehicle_compatibility_fixed.sql
        ;;
    10)
        echo -e "${GREEN}TASK 12 çalıştırılıyor...${NC}"
        echo -e "${YELLOW}⚠ UYARI: Bu task manuel kontrol gerektirir!${NC}"
        echo "Mükerrerleri inceledikten sonra consolidate_duplicate_units() fonksiyonunu çalıştırın."
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_task_12_unit_duplication_fixed.sql
        ;;
    11)
        echo -e "${GREEN}TASK 13 çalıştırılıyor...${NC}"
        echo -e "${YELLOW}⚠ NOT: RLS henüz aktif değil, sadece hazırlık yapılıyor${NC}"
        PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration_task_13_rls_preparation_fixed.sql
        ;;
    12)
        echo -e "${GREEN}Database bağlantısı test ediliyor...${NC}"
        if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" 2>&1; then
            echo -e "${GREEN}✓ Bağlantı başarılı!${NC}"
        else
            echo -e "${RED}✗ Bağlantı başarısız!${NC}"
            echo ""
            echo "Olası çözümler:"
            echo "1. PostgreSQL sunucusunu başlatın:"
            echo "   docker compose -f docker-compose.base.yml up -d postgres"
            echo ""
            echo "2. Host ve port ayarlarını kontrol edin"
            echo "3. Firewall ayarlarını kontrol edin"
            exit 1
        fi
        ;;
    13)
        echo -e "${GREEN}Çıkılıyor...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Geçersiz seçim!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}İşlem tamamlandı!${NC}"
echo -e "${GREEN}========================================${NC}"