#!/bin/bash

# OtoMuhasebe - Reload Nginx with CORS Fixes
# This script tests and reloads Nginx configuration

set -e

echo "========================================"
echo "  NGINX CORS FIXES DEPLOYMENT"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1/2: Testing Nginx Configuration${NC}"
echo "----------------------------------------"

# Test Nginx configuration
if sudo nginx -t; then
  echo -e "${GREEN}✓${NC} Nginx configuration is valid"
else
  echo -e "${RED}✗${NC} Nginx configuration test FAILED"
  echo "Please check the configuration files:"
  echo "  - /etc/nginx/sites-enabled/03-api.otomuhasebe.com.conf"
  echo "  - /etc/nginx/sites-enabled/04-staging.otomuhasebe.com.conf"
  exit 1
fi

echo ""
echo -e "${BLUE}Step 2/2: Reloading Nginx${NC}"
echo "----------------------------------------"

# Reload Nginx
echo "Reloading Nginx service..."
if sudo systemctl reload nginx; then
  echo -e "${GREEN}✓${NC} Nginx reloaded successfully"
else
  echo -e "${RED}✗${NC} Failed to reload Nginx"
  echo "Trying restart instead..."
  if sudo systemctl restart nginx; then
    echo -e "${GREEN}✓${NC} Nginx restarted successfully"
  else
    echo -e "${RED}✗${NC} Failed to restart Nginx"
    echo "Please check logs:"
    echo "  sudo journalctl -u nginx -n 50"
    exit 1
  fi
fi

echo ""
echo "========================================"
echo "  DEPLOYMENT COMPLETE"
echo "========================================"
echo ""
echo -e "${GREEN}✓${NC} Nginx reloaded with CORS fixes"
echo ""
echo "Next steps:"
echo "  1. Test CORS from staging.otomuhasebe.com"
echo "  2. Test CORS from panel.otomuhasebe.com"
echo "  3. Check browser console for CORS errors"
echo "  4. Check Network tab for CORS headers"
echo ""
echo "To view Nginx logs:"
echo "  sudo tail -f /var/log/nginx/staging-error.log"
echo "  sudo tail -f /var/log/nginx/staging-access.log"
echo ""
