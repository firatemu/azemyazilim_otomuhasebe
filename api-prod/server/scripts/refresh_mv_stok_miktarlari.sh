#!/bin/bash

# Stok Miktarları Materialized View Refresh Script
# Bu script'i cron job olarak her 5 dakikada bir çalıştırın

PGPASSWORD="IKYYJ1R8fUZ3PItqxf6qel12VNbLYiOe"
PGHOST="localhost"
PGPORT="5432"
PGDATABASE="otomuhasebe_prod"
PGUSER="postgres"

echo "$(date '+%Y-%m-%d %H:%M:%S') - Refreshing mv_stok_miktarlari..."

psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -c "
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_stok_miktarlari;
"

if [ $? -eq 0 ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') - ✓ Refresh successful"
else
  echo "$(date '+%Y-%m-%d %H:%M:%S') - ✗ Refresh failed"
  exit 1
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') - Done"
