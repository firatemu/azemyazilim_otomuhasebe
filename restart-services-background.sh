#!/bin/bash

# Arka planda çalışan güvenli restart scripti
# nohup ile çalıştırılır, SSH bağlantısı kopmaz
# Kullanım: nohup bash /var/www/restart-services-background.sh > /tmp/restart.log 2>&1 &

LOG_FILE="/tmp/restart-services-$(date +%Y%m%d-%H%M%S).log"

exec > >(tee -a "$LOG_FILE")
exec 2>&1

echo "=========================================="
echo "Servisleri Yeniden Başlatma (Arka Plan)"
echo "Tarih: $(date)"
echo "Log: $LOG_FILE"
echo "=========================================="
echo ""

# PM2 servislerini sadece restart et
echo "[1/4] Servisleri durduruyor..."
pm2 stop all 2>/dev/null || true
sleep 3

# Portları temizle
echo "[2/4] Portları temizliyor..."
for port in 3000 3005 3020; do
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        # PM2 süreçlerini öldürmemek için kontrol
        proc_name=$(ps -p $pid -o comm= 2>/dev/null || echo "")
        if [[ "$proc_name" != *"pm2"* ]]; then
            echo "  -> Port $port temizleniyor (PID: $pid)..."
            kill $pid 2>/dev/null || true
            sleep 1
            if kill -0 $pid 2>/dev/null; then
                kill -9 $pid 2>/dev/null || true
            fi
        fi
    fi
done
sleep 3

# Servisleri başlat
echo "[3/4] Servisleri başlatıyor..."

if [ -f "/var/www/panel-stage/ecosystem.config.js" ]; then
    echo "  -> panel-stage başlatılıyor..."
    cd /var/www/panel-stage
    pm2 delete panel-stage 2>/dev/null || true
    pm2 start ecosystem.config.js
    sleep 5
fi

if [ -f "/var/www/api-stage/server/ecosystem.config.js" ]; then
    echo "  -> api-stage başlatılıyor..."
    cd /var/www/api-stage/server
    pm2 delete api-stage 2>/dev/null || true
    pm2 start ecosystem.config.js
    sleep 5
fi

if [ -f "/var/www/admin-stage/ecosystem.config.js" ]; then
    echo "  -> admin-stage başlatılıyor..."
    cd /var/www/admin-stage
    pm2 delete admin-stage 2>/dev/null || true
    pm2 start ecosystem.config.js
    sleep 5
fi

pm2 save 2>/dev/null || true

echo "[4/4] Durum kontrolü..."
sleep 3

echo ""
echo "=========================================="
echo "PM2 Durumu:"
echo "=========================================="
pm2 list

echo ""
echo "=========================================="
echo "İşlem tamamlandı: $(date)"
echo "Log dosyası: $LOG_FILE"
echo "=========================================="

