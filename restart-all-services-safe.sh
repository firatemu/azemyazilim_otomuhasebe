#!/bin/bash

# Güvenli servis yeniden başlatma scripti
# SSH bağlantısını koparmaz
# Kullanım: bash /var/www/restart-all-services-safe.sh

set -e

echo "=========================================="
echo "Güvenli Servis Yeniden Başlatma Scripti"
echo "Tarih: $(date)"
echo "=========================================="
echo ""

# PM2 servislerini durdur (kill kullanmadan)
echo "[1/7] PM2 servislerini durduruyor..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sleep 2

# Tüm portları temizle
echo "[2/7] Portları temizliyor..."
for port in 3000 3005 3020; do
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        echo "  -> Port $port temizleniyor (PID: $pid)..."
        kill -9 $pid 2>/dev/null || true
    fi
done
sleep 2

# Next.js ve Node süreçlerini temizle
echo "[3/7] Next.js ve Node süreçlerini temizliyor..."
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "vite preview" 2>/dev/null || true
pkill -9 -f "node.*main.js" 2>/dev/null || true
sleep 2

# PM2 durumunu kontrol et (daemon zaten çalışıyor olmalı)
echo "[4/7] PM2 durumunu kontrol ediyor..."
if ! pm2 ping > /dev/null 2>&1; then
    echo "  -> PM2 daemon başlatılıyor..."
    pm2 ping 2>/dev/null || pm2 daemon 2>/dev/null || true
    sleep 3
else
    echo "  -> PM2 zaten çalışıyor"
    sleep 1
fi

# Servisleri başlat
echo "[5/7] Servisleri başlatıyor..."

# Panel Stage (Next.js) - PORT 3000
if [ -f "/var/www/panel-stage/ecosystem.config.js" ]; then
    echo "  -> panel-stage başlatılıyor (PORT: 3000)..."
    cd /var/www/panel-stage
    pm2 start ecosystem.config.js
    sleep 5
else
    echo "  -> panel-stage ecosystem.config.js bulunamadı!"
fi

# API Stage - PORT 3020
if [ -f "/var/www/api-stage/server/ecosystem.config.js" ]; then
    echo "  -> api-stage başlatılıyor (PORT: 3020)..."
    cd /var/www/api-stage/server
    pm2 start ecosystem.config.js
    sleep 5
else
    echo "  -> api-stage ecosystem.config.js bulunamadı!"
fi

# Admin Stage - PORT 3005
if [ -f "/var/www/admin-stage/ecosystem.config.js" ]; then
    echo "  -> admin-stage başlatılıyor (PORT: 3005)..."
    cd /var/www/admin-stage
    pm2 start ecosystem.config.js
    sleep 5
else
    echo "  -> admin-stage ecosystem.config.js bulunamadı!"
fi

# PM2 save
echo "[6/7] PM2 durumunu kaydediyor..."
pm2 save 2>/dev/null || true

# Durum kontrolü
echo "[7/7] Servis durumlarını kontrol ediyor..."
sleep 5

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
echo "API Test:"
echo "=========================================="
echo "Testing panel-stage (http://localhost:3000)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000 2>/dev/null || echo "000")
if [ "$HTTP_CODE" != "000" ]; then
    echo "  -> HTTP Status: $HTTP_CODE"
else
    echo "  -> Bağlantı hatası veya timeout"
fi

echo ""
echo "Testing api-stage (http://localhost:3020)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3020 2>/dev/null || echo "000")
if [ "$HTTP_CODE" != "000" ]; then
    echo "  -> HTTP Status: $HTTP_CODE"
else
    echo "  -> Bağlantı hatası veya timeout"
fi

echo ""
echo "Testing admin-stage (http://localhost:3005)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3005 2>/dev/null || echo "000")
if [ "$HTTP_CODE" != "000" ]; then
    echo "  -> HTTP Status: $HTTP_CODE"
else
    echo "  -> Bağlantı hatası veya timeout"
fi

echo ""
echo "=========================================="
echo "İşlem tamamlandı!"
echo "=========================================="
echo ""
echo "Faydalı komutlar:"
echo "  pm2 logs panel-stage --lines 50"
echo "  pm2 logs api-stage --lines 50"
echo "  pm2 logs admin-stage --lines 50"
echo "  pm2 logs --lines 50"
echo "  pm2 status"
echo "  pm2 monit"
echo ""


