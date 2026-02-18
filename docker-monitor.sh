#!/bin/bash

ENV=${1:-staging}

echo "========================================="
echo "Docker Container Status ($ENV)"
echo "========================================="

# Show container status
docker-compose --env-file .env.$ENV ps

echo ""
echo "========================================="
echo "Container Health Checks"
echo "========================================="

# Check health status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=otomuhasebe"

echo ""
echo "========================================="
echo "Press Ctrl+C to stop logs"
echo "========================================="
echo ""

# Follow logs from all services
docker-compose --env-file .env.$ENV logs -f --tail=50
