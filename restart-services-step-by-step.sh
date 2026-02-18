#!/bin/bash

# Adım adım servis yeniden başlatma scripti
# Her adımı ayrı çalıştırabilirsiniz
# Kullanım: bash /var/www/restart-services-step-by-step.sh [adım_numarası]

STEP=${1:-"all"}

case $STEP in
    1|stop)
        echo "=========================================="
        echo "ADIM 1: Servisleri Durdurma"
        echo "=========================================="
        pm2 stop all 2>/dev/null || true
        pm2 delete all 2>/dev/null || true
        echo "Servisler durduruldu."
        ;;

    2|ports)
        echo "=========================================="
        echo "ADIM 2: Portları Temizleme"
        echo "=========================================="
        for port in 3000 3005 3020; do
            pid=$(lsof -ti:$port 2>/dev/null || true)
            if [ ! -z "$pid" ]; then
                echo "Port $port temizleniyor (PID: $pid)..."
                kill -9 $pid 2>/dev/null || true
            else
                echo "Port $port zaten boş"
            fi
        done
        echo "Portlar temizlendi."
        ;;

    3|processes)
        echo "=========================================="
        echo "ADIM 3: Süreçleri Temizleme"
        echo "=========================================="
        pkill -9 -f "next dev" 2>/dev/null || true
        pkill -9 -f "next-server" 2>/dev/null || true
        pkill -9 -f "vite preview" 2>/dev/null || true
        pkill -9 -f "node.*main.js" 2>/dev/null || true
        echo "Süreçler temizlendi."
        ;;

    4|pm2)
        echo "=========================================="
        echo "ADIM 4: PM2 Kontrolü"
        echo "=========================================="
        if ! pm2 ping > /dev/null 2>&1; then
            echo "PM2 daemon başlatılıyor..."
            pm2 daemon 2>/dev/null || true
            sleep 2
        else
            echo "PM2 zaten çalışıyor"
        fi
        ;;

    5|start)
        echo "=========================================="
        echo "ADIM 5: Servisleri Başlatma"
        echo "=========================================="

        if [ -f "/var/www/panel-stage/ecosystem.config.js" ]; then
            echo "panel-stage başlatılıyor..."
            cd /var/www/panel-stage && pm2 start ecosystem.config.js
            sleep 3
        fi

        if [ -f "/var/www/api-stage/server/ecosystem.config.js" ]; then
            echo "api-stage başlatılıyor..."
            cd /var/www/api-stage/server && pm2 start ecosystem.config.js
            sleep 3
        fi

        if [ -f "/var/www/admin-stage/ecosystem.config.js" ]; then
            echo "admin-stage başlatılıyor..."
            cd /var/www/admin-stage && pm2 start ecosystem.config.js
            sleep 3
        fi

        pm2 save 2>/dev/null || true
        echo "Servisler başlatıldı."
        ;;

    6|status)
        echo "=========================================="
        echo "ADIM 6: Durum Kontrolü"
        echo "=========================================="
        echo ""
        echo "PM2 Durumu:"
        pm2 list
        echo ""
        echo "Port Kullanımı:"
        for port in 3000 3020 3005; do
            lsof -i:$port 2>/dev/null | grep LISTEN || echo "Port $port: Kullanılmıyor"
        done
        ;;

    all|*)
        echo "=========================================="
        echo "Tüm Adımları Çalıştırma"
        echo "=========================================="
        echo ""
        echo "Adım 1: Servisleri durdurma..."
        bash $0 1
        sleep 2

        echo ""
        echo "Adım 2: Portları temizleme..."
        bash $0 2
        sleep 2

        echo ""
        echo "Adım 3: Süreçleri temizleme..."
        bash $0 3
        sleep 2

        echo ""
        echo "Adım 4: PM2 kontrolü..."
        bash $0 4
        sleep 2

        echo ""
        echo "Adım 5: Servisleri başlatma..."
        bash $0 5
        sleep 5

        echo ""
        echo "Adım 6: Durum kontrolü..."
        bash $0 6
        ;;
esac

echo ""
echo "Kullanım:"
echo "  bash $0 1    - Servisleri durdur"
echo "  bash $0 2    - Portları temizle"
echo "  bash $0 3    - Süreçleri temizle"
echo "  bash $0 4    - PM2 kontrolü"
echo "  bash $0 5    - Servisleri başlat"
echo "  bash $0 6    - Durum kontrolü"
echo "  bash $0 all  - Tüm adımları çalıştır"


