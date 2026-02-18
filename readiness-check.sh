#!/usr/bin/env bash
set -euo pipefail

echo "=============================================="
echo " CADDY → PROD READINESS CHECK (SAFE MODE)"
echo "=============================================="

echo ""
echo "🧱 1) Docker durumu"
systemctl is-active --quiet docker && echo "✅ Docker aktif" || echo "❌ Docker aktif değil"

echo ""
echo "🌐 2) 80 / 443 portlarını kim tutuyor?"
ss -lntp | grep -E ':80 |:443 ' || echo "❌ 80/443 dinlenmiyor"

echo ""
echo "🔍 3) Çalışan reverse proxy process’leri"
ps aux | egrep 'nginx|caddy' | grep -v grep || echo "❌ nginx/caddy process yok"

echo ""
echo "🐳 4) Docker içindeki Caddy container durumu"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -i caddy || echo "❌ Caddy container çalışmıyor"

echo ""
echo "📦 5) Docker servislerinin ayakta olduğunun doğrulanması"
docker ps --format "table {{.Names}}\t{{.Status}}" | egrep 'backend|admin|user|landing' || echo "⚠️ bazı servisler görünmüyor"

echo ""
echo "🔐 6) PROD domain SSL + routing testleri (Nginx ÜZERİNDEN)"
for url in \
  https://panel.otomuhasebe.com \
  https://admin.otomuhasebe.com \
  https://www.otomuhasebe.com
do
  code=$(curl -s -o /dev/null -w "%{http_code}" $url)
  echo "→ $url → HTTP $code"
done

echo ""
echo "🧪 7) Caddy test portları VARSA (8080/8443) kontrol"
for url in \
  https://staging.otomuhasebe.com:8443 \
  https://staging-api.otomuhasebe.com:8443 \
  https://admin-staging.otomuhasebe.com:8443
do
  code=$(curl -k -s -o /dev/null -w "%{http_code}" $url)
  echo "→ $url → HTTP $code (Caddy test)"
done

echo ""
echo "📄 8) Caddyfile içeriği (info amaçlı)"
sed -n '1,200p' /var/www/docker/caddy/Caddyfile 2>/dev/null || echo "❌ Caddyfile okunamadı"

echo ""
echo "=============================================="
echo "✅ CHECK TAMAMLANDI"
echo ""
echo "📌 YORUM:"
echo "• Eğer domain’ler 200/301/302 dönüyorsa → PROD trafik sağlıklı"
echo "• Caddy container up + SSL alabiliyorsa → GO"
echo "• Sonraki adım: Nginx’i pasif etmek"
echo "=============================================="
