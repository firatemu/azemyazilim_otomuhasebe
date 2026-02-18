#!/bin/bash
set -e

ENV=${1:-staging}
echo "========================================="
echo "Building Docker images for $ENV environment..."
echo "========================================="

# Check if .env.$ENV exists
if [ ! -f .env.$ENV ]; then
    echo "Error: .env.$ENV file not found!"
    exit 1
fi

# Load environment
export $(cat .env.$ENV | grep -v '^#' | xargs)

# Build images
echo "Building images..."
docker-compose -f docker-compose.yml --env-file .env.$ENV build --parallel

echo "========================================="
echo "Build completed successfully!"
echo "========================================="
