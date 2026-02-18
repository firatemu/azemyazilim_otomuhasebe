#!/bin/bash

# Next.js Developer Mode info
# Bu ortamda HMR (Hot Module Replacement) aktiftir. 
# Değişiklikleriniz anında yansır, 'npm run build' yapmanıza gerek yoktur.

echo "🚀 Developer Mode / HMR Aktif!"
echo "----------------------------"
echo "✅ Kod değişiklikleriniz kaydedildiği an (Ctrl+S) tarayıcıya yansır."
echo "✅ Manuel build (npm run build) yapmanıza gerek YOKTUR."
echo "✅ STAGING_DEV_MODE=true ile detaylı loglar ve Source Maps açıktır."
echo "----------------------------"

# Eğer konteynerleri komple restart etmek isterseniz:
# cd /var/www/docker/compose
# docker compose -f docker-compose.base.yml -f docker-compose.staging.dev.yml restart

