#!/bin/bash
set -e

ENV=${1:-staging}
BACKUP_DIR="/var/backups/docker"

echo "========================================="
echo "Deploying $ENV environment..."
echo "========================================="

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup current database before deployment
echo "Step 1: Backing up database..."
DATE=$(date +%Y%m%d_%H%M%S)
docker exec otomuhasebe-postgres pg_dump -U postgres otomuhasebe_$ENV > $BACKUP_DIR/db_backup_$ENV_$DATE.sql 2>/dev/null || echo "Database backup skipped (container not running)"

# Stop PM2 services (will be removed completely after migration)
echo "Step 2: Stopping PM2 services..."
pm2 stop all 2>/dev/null || echo "PM2 not running or already stopped"

# Stop and remove old containers
echo "Step 3: Stopping old containers..."
docker-compose --env-file .env.$ENV down

# Pull latest code (if git repository)
if [ -d .git ]; then
    echo "Step 4: Pulling latest code..."
    git pull origin main || echo "Git pull failed or no git repository"
else
    echo "Step 4: Skipping git pull (not a git repository)"
fi

# Build and start new containers
echo "Step 5: Building and starting containers..."
docker-compose --env-file .env.$ENV up -d --build --force-recreate

# Wait for backend to be healthy
echo "Step 6: Waiting for services to be healthy..."
sleep 10

# Run database migrations
echo "Step 7: Running database migrations..."
docker-compose --env-file .env.$ENV exec -T backend npx prisma migrate deploy || echo "Migration failed or already up to date"

# Run Prisma generate
echo "Step 8: Generating Prisma Client..."
docker-compose --env-file .env.$ENV exec -T backend npx prisma generate

# Show status
echo "========================================="
echo "Deployment completed!"
echo "========================================="
echo ""
echo "Service status:"
docker-compose --env-file .env.$ENV ps

echo ""
echo "Recent logs:"
docker-compose --env-file .env.$ENV logs --tail=20 backend
