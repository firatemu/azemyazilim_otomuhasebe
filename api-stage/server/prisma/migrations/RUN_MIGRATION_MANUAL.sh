#!/bin/bash
#
# Turkish → English Migration - STAGE 1 Manual Execution Script
# Tarih: 06.03.2026
# Kullanım: bash RUN_MIGRATION_MANUAL.sh
#
# Bu script migration işlemini otomatik olarak gerçekleştirir
# Docker container erişiminde sorun yaşanılar için alternatif yöntem
#

set -e  # Hata olursa dur

echo "======================================================="
echo "📋 TÜRKÇE → İNGİLİZE MIGRATION - STAGE 1"
echo "======================================================="
echo ""

# ================================
# 1. AYARLAR
# ================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS_DIR="$PROJECT_DIR/prisma/migrations"
BACKUP_DIR="$PROJECT_DIR/backups"
MIGRATION_FILE="20260306_i18n_turkish_to_english_stage1.sql"
LOG_FILE="$BACKUP_DIR/migration_log_$(date +%Y%m%d_%H%M%S).txt"

echo "📁 Proje dizini: $PROJECT_DIR"
echo "📋 Migration dizini: $MIGRATIONS_DIR"
echo "💾 Backup dizini: $BACKUP_DIR"
echo ""

# ================================
# 2. BACKUP ALMA
# ================================

echo "======================================================="
echo "📦 DATABASE BACKUP ALINIYOR..."
echo "======================================================="
echo ""

mkdir -p "$BACKUP_DIR"

# PostgreSQL container'ını bul
echo "🔍 PostgreSQL container'ını tespit ediliyor..."
CONTAINER=$(docker ps -a | grep -E "postgres|otomuhasebe.*db" | awk '{print $1}' | head -1)

if [ -z "$CONTAINER" ]; then
    echo "❌ HATA: PostgreSQL container bulunamadı!"
    echo ""
    echo "💡 ÇÖZÜM:"
    echo "1. Aşağıdaki komut ile manuel olarak container bulun:"
    echo "   docker ps -a"
    echo ""
    echo "2. Container adını yukarıdaki listeden kopyalayın"
    echo "3. Bu scripti manuel olarak çalıştırın:"
    echo "   ./RUN_MIGRATION_MANUAL.sh <container-name>"
    exit 1
fi

echo "✅ Container bulundu: $CONTAINER"
echo ""

# Backup timestamp oluştur
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_before_migration_$TIMESTAMP.sql"

echo "📦 Backup başlatılıyor: $BACKUP_FILE"
echo ""

# Docker içinde pg_dump komutunu çalıştır
docker exec "$CONTAINER" pg_dump -U postgres postgres > "$BACKUP_FILE" 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Backup HATASI!"
    echo "Lütfen container adını ve PostgreSQL erişimini kontrol edin."
    exit 1
fi

# Backup boyutunu göster
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | awk '{print $5}')
echo "✅ Backup BAŞARILI: $BACKUP_FILE ($BACKUP_SIZE)"
echo ""

# Backup log dosyasına yaz
echo "[$(date)] Backup completed: $BACKUP_FILE ($BACKUP_SIZE)" >> "$LOG_FILE"

# ================================
# 3. MIGRATION DOSYASI KONTROLÜ
# ================================

echo "======================================================="
echo "🔍 Migration dosyasını kontrol ediliyor..."
echo "======================================================="
echo ""

if [ ! -f "$MIGRATIONS_DIR/$MIGRATION_FILE" ]; then
    echo "❌ HATA: Migration dosyası bulunamadı!"
    echo "Beklenen dosya: $MIGRATIONS_DIR/$MIGRATION_FILE"
    exit 1
fi

echo "✅ Migration dosyası bulundu"
echo ""

# Migration boyutunu göster
MIGRATION_SIZE=$(du -h "$MIGRATIONS_DIR/$MIGRATION_FILE" | awk '{print $5}')
echo "📏 Migration dosya boyutu: $MIGRATION_SIZE"
echo ""

# Migration log dosyasına yaz
echo "[$(date)] Migration file checked: $MIGRATION_FILE ($MIGRATION_SIZE)" >> "$LOG_FILE"

# ================================
# 4. MIGRATION'DAN ÖNCE PRISMA CLIENT YENİDEN OLUŞTURMA
# ================================

echo "======================================================="
echo "🔄 Migration'dan önce Prisma Client yeniden oluşturuluyor..."
echo "======================================================="
echo ""

cd "$PROJECT_DIR"

echo "🔨 Prisma Client yeniden oluşturuluyor..."
npx prisma generate > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Prisma Client oluşturma HATASI!"
    echo "Lütfen npm ve Node.js kurulumlarını kontrol edin."
    exit 1
fi

echo "✅ Prisma Client oluşturuldu"
echo ""

# Prisma log dosyasına yaz
echo "[$(date)] Prisma Client regenerated" >> "$LOG_FILE"

# ================================
# 5. MIGRATION ÇALIŞTIRMA (CREATE-ONLY)
# ================================

echo "======================================================="
echo "🚀 MIGRATION ÇALIŞTIRILIYOR (CREATE-ONLY)..."
echo "======================================================="
echo ""

echo "📋 Migration script'i kopyalıyor..."
npx prisma migrate deploy --create-only 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Migration script kopyalama HATASI!"
    echo "Lütfen Prisma schema'yı ve migration dosyasını kontrol edin."
    exit 1
fi

echo "✅ Migration script kopyalandı"
echo ""

# Migration log dosyasına yaz
echo "[$(date)] Migration script copied (create-only)" >> "$LOG_FILE"

# ================================
# 6. MIGRATION'U GERÇEKTEN DEPLOY
# ================================

echo "======================================================="
echo "🚀 MIGRATION UYGULANIYOR..."
echo "======================================================="
echo ""

echo "⚠️ Bu işlem veritabanında değişiklik yapacak..."
echo "⏱ Tahmini süre: 2-5 dakika"
echo ""
sleep 2

echo "🔄 Migration deploy ediliyor..."
npx prisma migrate deploy 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Migration deploy HATASI!"
    echo "Detaylar için log dosyasına bakın: $LOG_FILE"
    echo ""
    echo "💡 ROLLBACK SEÇENEKLERİ:"
    echo "1. Otomatik rollback:"
    echo "   docker exec $CONTAINER psql -U postgres -d postgres < $BACKUP_FILE"
    echo ""
    echo "2. Manuel rollback:"
    echo "   - pgAdmin veya DBeaver ile açın"
    echo "   - $BACKUP_FILE dosyasını çalıştırın"
    exit 1
fi

echo "✅ Migration BAŞARILI!"
echo ""

# Migration log dosyasına yaz
echo "[$(date)] Migration completed successfully" >> "$LOG_FILE"

# ================================
# 7. PRISMA CLIENT YENİDEN OLUŞTURMA
# ================================

echo "======================================================="
echo "🔄 Migration'dan sonra Prisma Client yeniden oluşturuluyor..."
echo "======================================================="
echo ""

echo "🔨 Prisma Client yeniden oluşturuluyor..."
npx prisma generate > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Prisma Client oluşturma HATASI!"
    exit 1
fi

echo "✅ Prisma Client oluşturuldu"
echo ""

# Prisma log dosyasına yaz
echo "[$(date)] Prisma Client regenerated after migration" >> "$LOG_FILE"

# ================================
# 8. MIGRATION SONUC RAPORU
# ================================

echo ""
echo "======================================================="
echo "📊 MIGRATION SONUC RAPORU"
echo "======================================================="
echo ""
echo "✅ Backup:"
echo "   Dosya: $BACKUP_FILE"
echo "   Boyut: $BACKUP_SIZE"
echo ""
echo "✅ Migration:"
echo "   Dosya: $MIGRATIONS_DIR/$MIGRATION_FILE"
echo "   Boyut: $MIGRATION_SIZE"
echo ""
echo "📋 Prisma Client:"
echo "   Yeniden oluşturuldu (migration sonrası)"
echo ""
echo "📝 Log dosyası:"
echo "   Dosya: $LOG_FILE"
echo ""
echo "======================================================="
echo "🎉 STAGE 1 MIGRATION BAŞARILI!"
echo "======================================================="
echo ""
echo "⏭ Sonraki adımlar:"
echo "   1. Backend kodlarını güncelle (stokKodu → code, vb.)"
echo "   2. Frontend'i güncelle (API tip tanımları)"
echo "   3. Backend ve Frontend'i test et"
echo ""
echo "⚠️ ÖNEMLİ:"
echo "   - Prisma Client'i kullanmakta sorun yaşanırsanız:"
echo "     rm -rf node_modules/.prisma"
echo "     npx prisma generate"
echo ""
echo "   - Migration'da hata alırsanız log dosyasını kontrol edin:"
echo "     cat $LOG_FILE"
echo ""
echo "💾 Backup her zaman güvendedir:"
echo "   $BACKUP_FILE"
echo ""
echo "======================================================="
echo ""

# Log dosyasına özet yaz
echo "[$(date)] ========== MIGRATION SUMMARY ==========" >> "$LOG_FILE"
echo "[$(date)] Status: SUCCESS" >> "$LOG_FILE"
echo "[$(date)] Backup: $BACKUP_FILE ($BACKUP_SIZE)" >> "$LOG_FILE"
echo "[$(date)] Migration: $MIGRATION_FILE ($MIGRATION_SIZE)" >> "$LOG_FILE"
echo "[$(date)] Prisma Client: Regenerated (twice)" >> "$LOG_FILE"
echo "[$(date)] ========================================" >> "$LOG_FILE"