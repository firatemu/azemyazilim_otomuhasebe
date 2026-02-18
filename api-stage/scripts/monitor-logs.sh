#!/bin/bash
# Log Monitoring ve Raporlama Scripti

# Root kontrolü - root değilse sudo kullan (NOPASSWD ile çalışır)
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         YEDEK PARÇA OTOMASYONU - LOG MONİTOR              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# PM2 Logları
echo "📊 PM2 Servis Durumu:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 status
echo ""

# Backend Hataları
echo "🔴 Backend Hataları (Son 10):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs yedekparca-backend --nostream --lines 50 | grep -i "error" | tail -10 || echo "Hata bulunamadı"
echo ""

# Frontend Hataları
echo "🔴 Frontend Hataları (Son 10):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs yedekparca-frontend --nostream --lines 50 | grep -i "error" | tail -10 || echo "Hata bulunamadı"
echo ""

# Nginx Erişim Logları
echo "🌐 Nginx Son Erişimler (Son 10):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -10 /var/log/nginx/stnoto-access.log 2>/dev/null || echo "Log dosyası bulunamadı"
echo ""

# Nginx Hata Logları
echo "🔴 Nginx Hataları (Son 10):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -10 /var/log/nginx/stnoto-error.log 2>/dev/null || echo "Hata bulunamadı"
echo ""

# Fail2ban Durumu
echo "🛡️  Fail2ban Ban Durumu:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
$SUDO fail2ban-client status | head -10
echo ""

# Disk Kullanımı
echo "💾 Disk Kullanımı:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
df -h / | tail -1
echo ""

# Bellek Kullanımı
echo "🧠 Bellek Kullanımı:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
free -h | grep -E "^Mem|^Swap"
echo ""

# Son Yedeklemeler
echo "💾 Son Veritabanı Yedekleri:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lth /var/backups/yedekparca/ | head -6
echo ""

# Yedekleme Logları
echo "📝 Son Yedekleme Logları:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -5 /var/log/yedekparca-backup.log 2>/dev/null || echo "Log bulunamadı"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   MONİTORİNG TAMAMLANDI                    ║"
echo "╚════════════════════════════════════════════════════════════╝"

