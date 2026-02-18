#!/bin/bash
echo "🚨 STARTING NUCLEAR WIPE FOR STAGING..."
cd /var/www/docker/compose

# 1. Stop containers
echo "Stopping containers..."
docker compose -f docker-compose.staging.yml down

# 2. Remove all containers
echo "Removing all containers..."
docker rm -f $(docker ps -a -q) 2>/dev/null || true

# 3. Remove all images
echo "Removing all images..."
docker rmi -f $(docker images -q) 2>/dev/null || true

# 4. Prune system
echo "Pruning system (images, networks, build cache)..."
docker system prune -a --volumes -f

echo "✅ Nuclear Wipe Complete."
