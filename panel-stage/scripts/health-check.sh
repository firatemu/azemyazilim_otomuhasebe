#!/bin/bash
# Sistem Sağlık Kontrolü ve Otomatik Düzeltme

# Root kontrolü - root değilse sudo kullan (NOPASSWD ile çalışır)
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

LOG_FILE="/var/log/yedekparca-health.log"
ERROR_COUNT=0

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

check_service() {
    SERVICE=$1
    if $SUDO systemctl is-active --quiet "$SERVICE"; then
        log_message "✅ $SERVICE çalışıyor"
        return 0
    else
        log_message "❌ $SERVICE çalışmıyor! Yeniden başlatılıyor..."
        $SUDO systemctl restart "$SERVICE"
        ((ERROR_COUNT++))
        return 1
    fi
}

check_pm2_app() {
    APP=$1
    STATUS=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$APP\") | .pm2_env.status" 2>/dev/null)
    if [ "$STATUS" = "online" ]; then
        log_message "✅ PM2: $APP çalışıyor"
        return 0
    else
        log_message "❌ PM2: $APP çalışmıyor! Yeniden başlatılıyor..."
        pm2 restart "$APP" >/dev/null 2>&1
        ((ERROR_COUNT++))
        return 1
    fi
}

log_message "=== Sağlık Kontrolü Başlatılıyor ==="

# Nginx kontrolü
check_service "nginx"

# PostgreSQL kontrolü
check_service "postgresql"

# Fail2ban kontrolü
check_service "fail2ban"

# PM2 uygulamaları kontrolü
check_pm2_app "yedekparca-backend"
check_pm2_app "yedekparca-frontend"

# Disk kontrolü
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    log_message "⚠️  UYARI: Disk kullanımı %$DISK_USAGE - Temizlik gerekli!"
    ((ERROR_COUNT++))
else
    log_message "✅ Disk kullanımı: %$DISK_USAGE"
fi

# Bellek kontrolü
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEM_USAGE" -gt 90 ]; then
    log_message "⚠️  UYARI: Bellek kullanımı %$MEM_USAGE"
    ((ERROR_COUNT++))
else
    log_message "✅ Bellek kullanımı: %$MEM_USAGE"
fi

# Özet
log_message "=== Kontrol Tamamlandı - $ERROR_COUNT hata tespit edildi ==="
log_message "---"

exit $ERROR_COUNT

