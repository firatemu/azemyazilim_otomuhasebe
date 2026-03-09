#!/bin/bash

# ============================================
# PostgreSQL Kullanıcısı ile Migration Çalıştırma
# ============================================

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}DATABASE MIGRATION (Postgres Kullanıcısı)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Database adı
DB_NAME="${DB_NAME:-otomuhasebe_stage}"

echo -e "${YELLOW}Database: $DB_NAME${NC}"
echo -e "${YELLOW}Kullanıcı: postgres${NC}"
echo ""

# Backup al
echo -e "${YELLOW}Backup alınıyor...${NC}"
BACKUP_FILE="migration_backup_$(date +%Y%m%d_%H%M%S).sql"
sudo -u postgres pg_dump $DB_NAME > $BACKUP_FILE 2>&1
if [ -s "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓ Backup oluşturuldu: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
else
    echo -e "${RED}✗ Backup başarısız!${NC}"
    exit 1
fi
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
echo "12) Çıkış"
echo ""
read -p "Seçiminiz (1-12): " choice

case $choice in
    1)
        echo -e "${GREEN}Tüm migration'lar çalıştırılıyor...${NC}"
        for task in 01 05 06 07 08 09 10 11 12 13; do
            echo ""
            echo -e "${BLUE}=== TASK $task ===${NC}"
            case $task in
                01)
                    FILE="migration_task_01_complete_fixed.sql"
                    NAME="TenantId Düzeltmeleri"
                    ;;
                05)
                    FILE="migration_task_05_composite_indexes_fixed.sql"
                    NAME="Composite Index'ler"
                    ;;
                06)
                    FILE="migration_task_06_multi_currency_fixed.sql"
                    NAME="Multi-Currency"
                    ;;
                07)
                    FILE="migration_task_07_checkbill_endorsement_fixed.sql"
                    NAME="Çek/Senet Ciro"
                    ;;
                08)
                    FILE="migration_task_08_float_validation_fixed.sql"
                    NAME="Float Validation"
                    ;;
                09)
                    FILE="migration_task_09_brand_normalization_fixed.sql"
                    NAME="Marka Normalizasyonu"
                    ;;
                10)
                    FILE="migration_task_10_category_normalization_fixed.sql"
                    NAME="Kategori Normalizasyonu"
                    ;;
                11)
                    FILE="migration_task_11_vehicle_compatibility_fixed.sql"
                    NAME="Araç Uyumluluk"
                    ;;
                12)
                    FILE="migration_task_12_unit_duplication_fixed.sql"
                    NAME="Birim Mükerrerleri"
                    ;;
                13)
                    FILE="migration_task_13_rls_preparation_fixed.sql"
                    NAME="RLS Hazırlığı"
                    ;;
            esac
            
            echo -e "${YELLOW}Çalıştırılıyor: $NAME${NC}"
            if sudo -u postgres psql -d $DB_NAME -f $FILE 2>&1 | tee /tmp/TASK_${task}.log; then
                echo -e "${GREEN}✓ TASK $task ($NAME) tamamlandı${NC}"
            else
                echo -e "${RED}✗ TASK $task ($NAME) başarısız!${NC}"
                echo "Log: /tmp/TASK_${task}.log"
                exit 1
            fi
        done
        ;;
    2)
        echo -e "${GREEN}TASK 1 çalıştırılıyor...${NC}"
        sudo -u postgres psql -d $DB_NAME -f migration_task_01_complete_fixed.sql 2>&1 | tee /tmp/TASK_01.log
        ;;
    3)
        echo -e "${GREEN}TASK 5 çalıştırılıyor...${NC}"
        sudo -u postgres psql -d $DB_NAME -f migration_task_05_composite_indexes_fixed.sql 2>&1 | tee /tmp/TASK_05.log
        ;;
    4)
        echo -e "${GREEN}TASK 6 çalıştırılıyor...${NC}"
        sudo -u postgres psql -d $DB_NAME -f migration_task_06_multi_currency_fixed.sql 2>&1 | tee /tmp/TASK_06.log
        ;;
    5)
        echo -e "${GREEN}TASK 7 çalıştırılıyor...${NC}"
        sudo -u postgres psql -d $DB_NAME -f migration_task_07_checkbill_endorsement_fixed.sql 2>&1 | tee /tmp/TASK_07.log
        ;;
    6)
        echo -e "${GREEN}TASK 8 çalıştırılıyor...${NC}"
        sudo -u postgres psql -d $DB_NAME -f migration_task_08_float_validation_fixed.sql 2>&1 | tee /tmp/TASK_08.log
        ;;
    7)
        echo -e "${GREEN}TASK 9 çalıştırılıyor...${NC}"
        echo -e "${YELLOW}⚠ UYARI: Bu task manuel kontrol gerektirir!${NC}"
        sudo -u postgres psql -d $DB_NAME -f migration_task_09_brand_normalization_fixed.sql 2>&1 | tee /tmp/TASK_09.log
        ;;
    8)
        echo -e "${GREEN}TASK 10 çalıştırılıyor...${NC}"
        echo -e "${YELLOW}⚠ UYARI: Bu task manuel kontrol gerektirir!${NC}"
        sudo -u postgres psql -d $DB_NAME -f migration_task_10_category_normalization_fixed.sql 2>&1 | tee /tmp/TASK_10.log
        ;;
    9)
        echo -e "${GREEN}TASK 11 çalıştırılıyor...${NC}"
        sudo -u postgres psql -d $DB_NAME -f migration_task_11_vehicle_compatibility_fixed.sql 2>&1 | tee /tmp/TASK_11.log
        ;;
    10)
        echo -e "${GREEN}TASK 12 çalıştırılıyor...${NC}"
        echo -e "${YELLOW}⚠ UYARI: Bu task manuel kontrol gerektirir!${NC}"
        sudo -u postgres psql -d $DB_NAME -f migration_task_12_unit_duplication_fixed.sql 2>&1 | tee /tmp/TASK_12.log
        ;;
    11)
        echo -e "${GREEN}TASK 13 çalıştırılıyor...${NC}"
        echo -e "${YELLOW}⚠ NOT: RLS henüz aktif değil, sadece hazırlık yapılıyor${NC}"
        sudo -u postgres psql -d $DB_NAME -f migration_task_13_rls_preparation_fixed.sql 2>&1 | tee /tmp/TASK_13.log
        ;;
    12)
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
echo ""
echo "Backup: $BACKUP_FILE"
echo "Loglar: /tmp/TASK_*.log"