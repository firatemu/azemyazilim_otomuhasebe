#!/bin/bash

# Next.js Dev Server Restart Script
# Bu script Next.js cache'ini temizler ve dev server'ı restart eder

echo "🔄 Next.js cache temizleniyor ve restart ediliyor..."

cd /var/www/panel-stage/client || exit 1

# .next cache'ini temizle
echo "🗑️  .next cache temizleniyor..."
rm -rf .next

# Node modules kontrolü
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules bulunamadı, npm install çalıştırılıyor..."
    npm install
fi

echo ""
echo "✅ Cache temizlendi!"
echo ""
echo "🚀 Next.js dev server'ı başlatmak için:"
echo "   npm run dev"
echo ""
echo "🧪 Route'ları test etmek için:"
echo "   curl http://localhost:3000/api/hizli/test"
echo "   curl http://localhost:3000/api/hizli/token-status"
echo "   curl http://localhost:3000/api/hizli/incoming"
echo ""
echo "💡 Eğer production build kullanıyorsanız:"
echo "   npm run build"
echo "   npm run start"

