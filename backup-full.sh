#!/bin/bash

###############################################################################
# Tam Yedekleme Scripti
# Proje kodları ve PostgreSQL veritabanının eksiksiz yedeğini alır
###############################################################################

set -e  # Hata durumunda script'i durdur

# Renkler (loglama için)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Yedekleme dizinleri
BACKUP_ROOT="/var/backups"
BACKUP_DB_DIR="${BACKUP_ROOT}/database"
BACKUP_CODE_DIR="${BACKUP_ROOT}/code"
BACKUP_LOG_DIR="${BACKUP_ROOT}/logs"

# Tarih damgası
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
BACKUP_DATE=$(date +"%Y-%m-%d")

# Log dosyası
LOG_FILE="${BACKUP_LOG_DIR}/backup-${TIMESTAMP}.log"

# Fonksiyon: Log mesajı yazdır
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")

    case $level in
        INFO)
            echo -e "${GREEN}[INFO]${NC} ${message}" | tee -a "$LOG_FILE"
            ;;
        WARN)
            echo -e "${YELLOW}[WARN]${NC} ${message}" | tee -a "$LOG_FILE"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} ${message}" | tee -a "$LOG_FILE"
            ;;
        *)
            echo "[${timestamp}] ${message}" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Fonksiyon: Hata kontrolü
check_error() {
    if [ $? -ne 0 ]; then
        log ERROR "$1"
        exit 1
    fi
}

# Fonksiyon: Disk alanı kontrolü
check_disk_space() {
    local required_space_gb=5  # Minimum 5 GB gerekli
    local available_space_gb=$(df -BG "$BACKUP_ROOT" | tail -1 | awk '{print $4}' | sed 's/G//')

    if [ "$available_space_gb" -lt "$required_space_gb" ]; then
        log WARN "Yetersiz disk alanı! Mevcut: ${available_space_gb}GB, Gerekli: ${required_space_gb}GB"
        log WARN "Yedekleme devam ediyor, ancak dikkatli olun..."
    else
        log INFO "Disk alanı yeterli: ${available_space_gb}GB mevcut"
    fi
}

# Fonksiyon: Veritabanı bağlantı bilgilerini al
get_database_url() {
    # Önce environment variable'dan dene
    if [ -n "$DATABASE_URL" ]; then
        log INFO "DATABASE_URL environment variable'dan alındı"
        echo "$DATABASE_URL"
        return 0
    fi

    # .env dosyasından oku (sudo ile okumayı dene)
    local env_files=(
        "/var/www/api-stage/server/.env"
        "/var/www/api-prod/server/.env"
        "/var/www/api-stage/.env"
        "/var/www/api-prod/.env"
    )

    for env_file in "${env_files[@]}"; do
            if [ -f "$env_file" ]; then
                log INFO ".env dosyası bulundu: $env_file"
                # Sudo ile oku veya doğrudan oku
                local db_url=""
                if [ -r "$env_file" ]; then
                    # DATABASE_URL satırını bul, = işaretinden sonrasını al
                    # Çok satırlı değerleri handle et
                    db_url=$(grep -E "^DATABASE_URL=" "$env_file" 2>/dev/null | head -1 | sed 's/^DATABASE_URL=//' | sed 's/^["'\'']//' | sed 's/["'\'']$//' | tr -d '\n' | tr -d '\r')
                else
                    # Sudo ile okumayı dene
                    db_url=$(sudo grep -E "^DATABASE_URL=" "$env_file" 2>/dev/null | head -1 | sed 's/^DATABASE_URL=//' | sed 's/^["'\'']//' | sed 's/["'\'']$//' | tr -d '\n' | tr -d '\r')
                fi

                # Boş satırları ve gereksiz karakterleri temizle
                db_url=$(echo "$db_url" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//' | grep -v "^$")

                if [ -n "$db_url" ] && [ "$db_url" != "" ] && [ "$db_url" != "DATABASE_URL" ] && [[ "$db_url" == postgresql://* ]]; then
                    log INFO "DATABASE_URL .env dosyasından alındı"
                    echo "$db_url"
                    return 0
                fi
            fi
    done

    log WARN "DATABASE_URL bulunamadı! Veritabanı yedekleme atlanacak."
    log WARN "DATABASE_URL environment variable olarak ayarlayın veya .env dosyasını kontrol edin."
    return 1
}

# Fonksiyon: PostgreSQL dump al
backup_database() {
    log INFO "=== Veritabanı Yedekleme Başlıyor ==="

    local db_url=$(get_database_url)
    if [ -z "$db_url" ]; then
        log ERROR "Veritabanı bağlantı bilgisi alınamadı!"
        return 1
    fi

    # DATABASE_URL formatından bilgileri parse et
    # Format: postgresql://user:password@host:port/database?params
    # URL decode için özel karakterleri handle et
    local db_url_clean=$(echo "$db_url" | sed 's/%40/@/g; s/%3A/:/g; s/%2F/\//g; s/%3F/?/g; s/%26/\&/g')

    # Database name (son / ile ? veya sonuna kadar)
    local db_name=$(echo "$db_url_clean" | sed -n 's|.*/\([^?]*\).*|\1|p' | sed 's|\([^?]*\).*|\1|')

    # Host (:// ile @ arasındaki kısımdan sonra, : veya / öncesi)
    local db_host=$(echo "$db_url_clean" | sed -n 's|.*@\([^:/]*\).*|\1|p')
    if [ -z "$db_host" ] || [ "$db_host" = "$db_url_clean" ]; then
        db_host="localhost"
    fi

    # Port (host'tan sonraki : ile / arası)
    local db_port=$(echo "$db_url_clean" | sed -n "s|.*@[^:]*:\([0-9]*\)/.*|\1|p")
    if [ -z "$db_port" ] || [ "$db_port" = "$db_url_clean" ]; then
        db_port="5432"
    fi

    # User (:// ile : arası, @ varsa @ öncesi)
    local db_user=$(echo "$db_url_clean" | sed -n 's|.*://\([^:@]*\).*|\1|p')

    # Password (: ile @ arası)
    local db_pass=$(echo "$db_url_clean" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')

    # Eğer parse başarısız olduysa, basit format dene
    if [ -z "$db_name" ] || [ "$db_name" = "$db_url_clean" ]; then
        log WARN "URL parse edilemedi, alternatif yöntem deneniyor..."
        # Basit format: postgresql://user:pass@host:port/db
        db_name=$(echo "$db_url_clean" | awk -F'/' '{print $NF}' | awk -F'?' '{print $1}')
        db_host=$(echo "$db_url_clean" | awk -F'@' '{print $2}' | awk -F':' '{print $1}' | awk -F'/' '{print $1}')
        db_port=$(echo "$db_url_clean" | awk -F'@' '{print $2}' | awk -F':' '{print $2}' | awk -F'/' '{print $1}')
        db_user=$(echo "$db_url_clean" | awk -F'://' '{print $2}' | awk -F':' '{print $1}')
        db_pass=$(echo "$db_url_clean" | awk -F'://' '{print $2}' | awk -F':' '{print $2}' | awk -F'@' '{print $1}')
    fi

    if [ -z "$db_name" ]; then
        log ERROR "Veritabanı adı parse edilemedi!"
        return 1
    fi

    log INFO "Veritabanı: $db_name"
    log INFO "Host: ${db_host:-localhost}"
    log INFO "Port: ${db_port:-5432}"

    # Dump dosyası adı
    local dump_file="${BACKUP_DB_DIR}/database-backup-${TIMESTAMP}.sql"

    # PGPASSWORD environment variable ile şifreyi geç
    if [ -n "$db_pass" ]; then
        export PGPASSWORD="$db_pass"
    fi

    # pg_dump çalıştır
    log INFO "pg_dump çalıştırılıyor..."

    if [ -n "$db_host" ] && [ "$db_host" != "localhost" ] && [ "$db_host" != "127.0.0.1" ]; then
        pg_dump -h "$db_host" -p "${db_port:-5432}" -U "$db_user" -d "$db_name" \
            --no-owner --no-acl --clean --if-exists \
            -f "$dump_file" 2>&1 | tee -a "$LOG_FILE"
    else
        pg_dump -h localhost -p "${db_port:-5432}" -U "$db_user" -d "$db_name" \
            --no-owner --no-acl --clean --if-exists \
            -f "$dump_file" 2>&1 | tee -a "$LOG_FILE"
    fi

    check_error "pg_dump başarısız oldu!"

    # Dosya boyutunu kontrol et
    local file_size=$(du -h "$dump_file" | cut -f1)
    log INFO "Veritabanı yedeği oluşturuldu: $dump_file (Boyut: $file_size)"

    # Sıkıştır
    log INFO "Veritabanı yedeği sıkıştırılıyor..."
    gzip -f "$dump_file"
    local compressed_file="${dump_file}.gz"
    local compressed_size=$(du -h "$compressed_file" | cut -f1)
    log INFO "Sıkıştırılmış dosya: $compressed_file (Boyut: $compressed_size)"

    log INFO "=== Veritabanı Yedekleme Tamamlandı ==="
    echo "$compressed_file"
}

# Fonksiyon: Kod yedeği al
backup_code() {
    log INFO "=== Kod Yedekleme Başlıyor ==="

    local temp_dir=$(mktemp -d)
    local backup_name="code-backup-${TIMESTAMP}"
    local backup_path="${temp_dir}/${backup_name}"

    mkdir -p "$backup_path"

    # Yedeklenecek dizinler
    local source_dirs=(
        "/var/www/api-stage"
        "/var/www/api-prod"
        "/var/www/panel-stage"
        "/var/www/panel-prod"
        "/var/www/admin-stage"
        "/var/www/admin-otomuhasebe"
        "/var/www/otomuhasebe-landing"
        "/var/www/otomuhasebe-landing-prod"
    )

    # Hariç tutulacak dizinler/desenler
    local exclude_patterns=(
        "node_modules"
        ".next"
        "dist"
        "build"
        ".cache"
        "coverage"
        ".nyc_output"
        "*.log"
        "*.tmp"
        ".DS_Store"
        "Thumbs.db"
    )

    # Exclude parametreleri oluştur
    local exclude_args=""
    for pattern in "${exclude_patterns[@]}"; do
        exclude_args="$exclude_args --exclude=$pattern"
    done

    # Her dizini kopyala
    for dir in "${source_dirs[@]}"; do
        if [ -d "$dir" ]; then
            log INFO "Yedekleniyor: $dir"
            local dir_name=$(basename "$dir")

            # rsync kullanarak kopyala (daha hızlı ve esnek)
            if command -v rsync &> /dev/null; then
                rsync -a --progress \
                    --exclude='node_modules' \
                    --exclude='.next' \
                    --exclude='dist' \
                    --exclude='build' \
                    --exclude='.cache' \
                    --exclude='coverage' \
                    --exclude='*.log' \
                    --exclude='*.tmp' \
                    --exclude='.DS_Store' \
                    "$dir" "$backup_path/" 2>&1 | tee -a "$LOG_FILE" | grep -E "^(sending|sent|total)" || true
            else
                # rsync yoksa tar kullan
                tar $exclude_args -cf - "$dir" 2>/dev/null | tar -xf - -C "$backup_path/" 2>&1 | tee -a "$LOG_FILE" || true
            fi
        else
            log WARN "Dizin bulunamadı: $dir (atlanıyor)"
        fi
    done

    # Tar.gz oluştur
    log INFO "Kod yedeği sıkıştırılıyor..."
    local archive_file="${BACKUP_CODE_DIR}/${backup_name}.tar.gz"

    cd "$temp_dir"
    tar -czf "$archive_file" "$backup_name" 2>&1 | tee -a "$LOG_FILE"
    check_error "Tar sıkıştırma başarısız oldu!"

    # Geçici dizini temizle
    rm -rf "$temp_dir"

    # Dosya boyutunu kontrol et
    local file_size=$(du -h "$archive_file" | cut -f1)
    log INFO "Kod yedeği oluşturuldu: $archive_file (Boyut: $file_size)"

    log INFO "=== Kod Yedekleme Tamamlandı ==="
    echo "$archive_file"
}

# Fonksiyon: S3'e Yükle
upload_to_s3() {
    local file_path=$1
    local file_name=$(basename "$file_path")
    
    log INFO "=== Off-site Yedekleme (S3) Başlıyor ==="
    
    # S3 Bucket kontrolü (Env variable)
    if [ -z "$S3_BUCKET" ]; then
        log WARN "S3_BUCKET tanımlı değil. Off-site yedekleme atlanıyor."
        return 0
    fi

    # AWS CLI kontrolü
    if command -v aws &> /dev/null; then
        log INFO "AWS CLI bulundu. S3'e yükleniyor..."
        
        # S3 Path: s3://bucket/year/month/file
        local s3_path="s3://${S3_BUCKET}/backups/${BACKUP_DATE:0:4}/${BACKUP_DATE:5:2}/${file_name}"
        
        aws s3 cp "$file_path" "$s3_path" --no-progress 2>&1 | tee -a "$LOG_FILE"
        
        if [ $? -eq 0 ]; then
            log INFO "Yedek başarıyla S3'e yüklendi: $s3_path"
        else
            log ERROR "S3 yükleme başarısız oldu!"
            return 1
        fi
        
    # Rclone kontrolü
    elif command -v rclone &> /dev/null; then
        log INFO "Rclone bulundu. Remote'a yükleniyor..."
        
        # Rclone Remote: remote:bucket/path
        # S3_REMOTE_NAME var mı kontrol et, yoksa 's3' varsay
        local remote_name="${S3_REMOTE_NAME:-s3}"
        local s3_path="${remote_name}:${S3_BUCKET}/backups/${BACKUP_DATE:0:4}/${BACKUP_DATE:5:2}/"
        
        rclone copy "$file_path" "$s3_path" 2>&1 | tee -a "$LOG_FILE"
        
        if [ $? -eq 0 ]; then
             log INFO "Yedek başarıyla remote'a yüklendi: ${s3_path}${file_name}"
        else
             log ERROR "Rclone yükleme başarısız oldu!"
             return 1
        fi
    else
        log WARN "AWS CLI veya Rclone bulunamadı! Off-site yedekleme yapılamıyor."
        log WARN "Lütfen 'apt install awscli' veya rclone kurun."
        return 1
    fi
}

# Fonksiyon: Yedekleme özeti
print_summary() {
    log INFO "=== Yedekleme Özeti ==="
    log INFO "Tarih: $BACKUP_DATE"
    log INFO "Zaman: $(date +"%H:%M:%S")"
    log INFO "Log dosyası: $LOG_FILE"
    log INFO ""
    log INFO "Veritabanı yedekleri:"
    ls -lh "${BACKUP_DB_DIR}/database-backup-${TIMESTAMP}"* 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}' || log WARN "Veritabanı yedeği bulunamadı"
    log INFO ""
    log INFO "Kod yedekleri:"
    ls -lh "${BACKUP_CODE_DIR}/code-backup-${TIMESTAMP}"* 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}' || log WARN "Kod yedeği bulunamadı"
    log INFO ""
    log INFO "=== Yedekleme Tamamlandı ==="
}

# Ana fonksiyon
main() {
    log INFO "=========================================="
    log INFO "Tam Yedekleme İşlemi Başlatılıyor"
    log INFO "Tarih: $(date)"
    log INFO "=========================================="

    # Parametre kontrolü
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "Kullanım: $0 [DATABASE_URL]"
        echo ""
        echo "Örnek:"
        echo "  $0"
        echo "  $0 'postgresql://user:pass@host:5432/dbname'"
        echo ""
        echo "Not: DATABASE_URL parametre olarak verilmezse, .env dosyasından okunmaya çalışılır."
        exit 0
    fi

    # DATABASE_URL parametre olarak verilmişse kullan
    if [ -n "$1" ]; then
        export DATABASE_URL="$1"
        log INFO "DATABASE_URL parametre olarak alındı"
    fi

    # Dizinleri oluştur
    mkdir -p "$BACKUP_DB_DIR" "$BACKUP_CODE_DIR" "$BACKUP_LOG_DIR"
    check_error "Yedekleme dizinleri oluşturulamadı!"

    # Disk alanı kontrolü
    check_disk_space

    # Veritabanı yedeği
    if command -v pg_dump &> /dev/null; then
        db_backup_file=$(backup_database)
        if [ -f "$db_backup_file" ]; then
            upload_to_s3 "$db_backup_file"
        else 
             log WARN "Veritabanı yedek dosyası bulunamadı, upload atlanıyor."
        fi
    else
        log WARN "pg_dump bulunamadı! Veritabanı yedekleme atlanıyor."
    fi

    # Kod yedeği
    code_backup_file=$(backup_code)
    if [ -f "$code_backup_file" ]; then
        upload_to_s3 "$code_backup_file"
    else
        log ERROR "Kod yedekleme başarısız oldu!"
    fi

    # Özet
    print_summary

    log INFO "Yedekleme işlemi tamamlandı!"
}

# Script'i çalıştır
main "$@"

