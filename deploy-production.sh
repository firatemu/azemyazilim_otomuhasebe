#!/bin/bash
# Production Deployment Script for Otomuhasebe
# This script handles the complete production deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_BASE="docker/compose/docker-compose.base.yml"
COMPOSE_PROD="docker/compose/docker-compose.prod.yml"
IMAGE_TAG="${IMAGE_TAG:-latest}"
BACKUP_DIR="/var/www/backups"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Otomuhasebe Production Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Pre-deployment checks
echo -e "${YELLOW}[1/6] Running pre-deployment checks...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check if compose files exist
if [ ! -f "$COMPOSE_BASE" ] || [ ! -f "$COMPOSE_PROD" ]; then
    echo -e "${RED}Error: Docker compose files not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-deployment checks passed${NC}"
echo ""

# Step 2: Create backup
echo -e "${YELLOW}[2/6] Creating database backup...${NC}"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/prod_$(date +%Y%m%d_%H%M%S).dump"

if docker exec otomuhasebe-postgres pg_dump -U postgres -Fc otomuhasebe_prod > "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ Backup skipped (database may not exist yet)${NC}"
fi
echo ""

# Step 3: Build local images
echo -e "${YELLOW}[3/6] Building local production images...${NC}"
docker compose -f $COMPOSE_BASE -f $COMPOSE_PROD build --parallel
echo -e "${GREEN}✓ Images built successfully${NC}"
echo ""

# Step 4: Run database migrations
echo -e "${YELLOW}[4/6] Running database migrations...${NC}"
docker compose -f $COMPOSE_BASE -f $COMPOSE_PROD run --rm backend npx prisma migrate deploy
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Step 5: Start services
echo -e "${YELLOW}[5/6] Starting/Updating production services...${NC}"
docker compose -f $COMPOSE_BASE -f $COMPOSE_PROD up -d
echo -e "${GREEN}✓ Services updated and running${NC}"
echo ""

# Step 6: Health check
echo -e "${YELLOW}[6/6] Waiting for services to become healthy...${NC}"
sleep 10

HEALTHY=true
for service in backend admin-panel landing-page; do
    STATUS=$(docker compose -f $COMPOSE_BASE -f $COMPOSE_PROD ps $service --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    if [ "$STATUS" = "healthy" ]; then
        echo -e "${GREEN}✓ $service is healthy${NC}"
    else
        echo -e "${RED}✗ $service status: $STATUS${NC}"
        HEALTHY=false
    fi
done

echo ""
if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Deployment completed with warnings${NC}"
    echo -e "${RED}Some services may not be healthy${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "Check logs with: docker compose -f $COMPOSE_BASE -f $COMPOSE_PROD logs -f"
    exit 1
fi
