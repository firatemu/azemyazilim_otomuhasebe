#!/bin/bash

# Sadece servisleri restart eden güvenli script
# PM2 daemon'a dokunmaz, SSH bağlantısını koparmaz
# Kullanım: bash /var/www/restart-services-only.sh

echo "=========================================="
echo "Servisleri Yeniden Başlatma (Güvenli)"
echo "Tarih: $(date)"
echo "=========================================="
echo ""

# PM2 servislerini sadece restart et (kill/delete yok)
echo "[1/4] Servisleri durduruyor..."
pm2 stop all 2>/dev/null || true
sleep 2

# Portları temizle (sadece belirli portlar)
echo "[2/4] Portları temizliyor..."
for port in 3000 3005 3020; do
    # Sadece o portu dinleyen süreçleri bul ve öldür
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        # PM2 süreçlerini öldürmemek için kontrol et
        if ! ps -p $pid -o comm= | grep -q "pm2"; then
            echo "  -> Port $port temizleniyor (PID: $pid)..."
            kill $pid 2>/dev/null || true
            sleep 1
            # Hala çalışıyorsa force kill
            if kill -0 $pid 2>/dev/null; then
                kill -9 $pid 2>/dev/null || true
            fi
        else
            echo "  -> Port $port PM2 tarafından kullanılıyor, atlanıyor..."
        fi
    fi
done
sleep 2

# Servisleri başlat
echo "[3/4] Servisleri başlatıyor..."

# Panel Stage (Next.js) - PORT 3000
if [ -f "/var/www/panel-stage/ecosystem.config.js" ]; then
    echo "  -> panel-stage başlatılıyor (PORT: 3000)..."
    cd /var/www/panel-stage
    pm2 delete panel-stage 2>/dev/null || true
    pm2 start ecosystem.config.js
    sleep 5
else
    echo "  -> panel-stage ecosystem.config.js bulunamadı!"
fi

# API Stage - PORT 3020
if [ -f "/var/www/api-stage/server/ecosystem.config.js" ]; then
    echo "  -> api-stage başlatılıyor (PORT: 3020)..."
    cd /var/www/api-stage/server
    pm2 delete api-stage 2>/dev/null || true
    pm2 start ecosystem.config.js
    sleep 5
else
    echo "  -> api-stage ecosystem.config.js bulunamadı!"
fi

# Admin Stage - PORT 3005
if [ -f "/var/www/admin-stage/ecosystem.config.js" ]; then
    echo "  -> admin-stage başlatılıyor (PORT: 3005)..."
    cd /var/www/admin-stage
    pm2 delete admin-stage 2>/dev/null || true
    pm2 start ecosystem.config.js
    sleep 5
else
    echo "  -> admin-stage ecosystem.config.js bulunamadı!"
fi

# PM2 save
echo "[4/4] PM2 durumunu kaydediyor..."
pm2 save 2>/dev/null || true

# Durum kontrolü
echo ""
echo "=========================================="
echo "PM2 Servis Durumu:"
echo "=========================================="
pm2 list || echo "PM2 listesi alınamadı"

echo ""
echo "=========================================="
echo "Port Kullanımı:"
echo "=========================================="
for port in 3000 3020 3005; do
    service=""
    case $port in
        3000) service="panel-stage" ;;
        3020) service="api-stage" ;;
        3005) service="admin-stage" ;;
    esac
    echo "Port $port ($service):"
    lsof -i:$port 2>/dev/null | grep LISTEN || echo "  -> Kullanılmıyor veya dinlemiyor"
    echo ""
done

echo "=========================================="
echo "İşlem tamamlandı!"
echo "=========================================="
echo ""
echo "Faydalı komutlar:"
echo "  pm2 logs panel-stage --lines 50"
echo "  pm2 logs api-stage --lines 50"
echo "  pm2 logs admin-stage --lines 50"
echo "  pm2 status"
echo ""

