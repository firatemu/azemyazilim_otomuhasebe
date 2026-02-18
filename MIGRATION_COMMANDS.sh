#!/bin/bash

# ===================================================================
# Fatura Modülü Optimizasyon - Migration Script
# ===================================================================

set -e  # Hata durumunda çık

echo "🚀 Fatura Modülü Optimizasyon Migration Başlıyor..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ===================================================================
# ADIM 1: Veritabanı Migration
# ===================================================================
echo -e "${BLUE}[ADIM 1/4]${NC} Veritabanı indeksleri oluşturuluyor..."

cd /var/www/api-prod/server

# Prisma migrate
echo "📝 Prisma migration çalıştırılıyor..."
npx prisma migrate deploy || {
  echo -e "${RED}❌ Migration başarısız!${NC}"
  echo "Manuel olarak çalıştırın:"
  echo "  cd /var/www/api-prod/server"
  echo "  npx prisma migrate dev --name optimize_fatura_indexes"
  exit 1
}

echo -e "${GREEN}✅ Migration tamamlandı${NC}"
echo ""

# ===================================================================
# ADIM 2: Prisma Client Generate
# ===================================================================
echo -e "${BLUE}[ADIM 2/4]${NC} Prisma client yeniden oluşturuluyor..."

npx prisma generate || {
  echo -e "${RED}❌ Prisma generate başarısız!${NC}"
  exit 1
}

echo -e "${GREEN}✅ Prisma client oluşturuldu${NC}"
echo ""

# ===================================================================
# ADIM 3: Backend Restart
# ===================================================================
echo -e "${BLUE}[ADIM 3/4]${NC} Backend restart ediliyor..."

# Docker kontrol et
if [ -f "/var/www/docker/compose/docker-compose.yml" ]; then
  echo "🐳 Docker kullanılıyor..."
  cd /var/www/docker/compose
  docker-compose restart api-prod || {
    echo -e "${RED}❌ Docker restart başarısız!${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ Backend restart edildi (Docker)${NC}"
else
  # PM2 kontrol et
  if command -v pm2 &> /dev/null; then
    echo "⚡ PM2 kullanılıyor..."
    pm2 restart api-prod || {
      echo -e "${RED}❌ PM2 restart başarısız!${NC}"
      exit 1
    }
    echo -e "${GREEN}✅ Backend restart edildi (PM2)${NC}"
  else
    echo -e "${YELLOW}⚠️  Backend manuel restart edilmeli${NC}"
    echo "Lütfen backend servisini manuel olarak restart edin"
  fi
fi

echo ""

# ===================================================================
# ADIM 4: Frontend Build
# ===================================================================
echo -e "${BLUE}[ADIM 4/4]${NC} Frontend build ediliyor..."

cd /var/www/panel-prod/client

echo "📦 Node modules kontrol ediliyor..."
if [ ! -d "node_modules" ]; then
  echo "📦 Node modules yükleniyor..."
  npm install || {
    echo -e "${RED}❌ npm install başarısız!${NC}"
    exit 1
  }
fi

echo "🔨 Frontend build ediliyor..."
npm run build || {
  echo -e "${RED}❌ Frontend build başarısız!${NC}"
  echo "Hata detayları için yukarıdaki logları kontrol edin"
  exit 1
}

echo -e "${GREEN}✅ Frontend build tamamlandı${NC}"
echo ""

# ===================================================================
# TAMAMLANDI
# ===================================================================
echo "=========================================="
echo -e "${GREEN}🎉 Tüm optimizasyonlar başarıyla tamamlandı!${NC}"
echo "=========================================="
echo ""
echo "📊 Yapılan Değişiklikler:"
echo "  ✅ Veritabanı indeksleri eklendi"
echo "  ✅ N+1 sorgu problemi çözüldü"
echo "  ✅ Debug kodları temizlendi"
echo "  ✅ React Query hook'ları eklendi"
echo "  ✅ Debounce hook'u eklendi"
echo "  ✅ Error boundary eklendi"
echo "  ✅ Loading skeleton'lar eklendi"
echo ""
echo "📈 Beklenen Performans Kazancı:"
echo "  • %60-70 daha az SQL sorgusu"
echo "  • %80 daha az API çağrısı"
echo "  • %50 daha hızlı sayfa yüklenmesi"
echo ""
echo "⚠️  Önemli Notlar:"
echo "  1. Application'ı test edin"
echo "  2. Fatura listesi sayfasını kontrol edin"
echo "  3. Arama fonksiyonunu test edin"
echo "  4. Error log'larını kontrol edin"
echo ""
echo "📝 Detaylı bilgi için:"
echo "  /var/www/FATURA_OPTIMIZATION_SUMMARY.md"
echo ""
echo "=========================================="
