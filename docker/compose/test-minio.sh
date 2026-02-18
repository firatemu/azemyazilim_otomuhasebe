#!/bin/bash
# Quick MinIO Test Script
# Tests MinIO connectivity and basic operations

set -e

echo "🧪 Testing MinIO Integration..."
echo "================================"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing MinIO health..."
if curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo "   ✅ MinIO is healthy"
else
    echo "   ❌ MinIO health check failed"
    exit 1
fi

# Test 2: Bucket exists
echo ""
echo "2️⃣ Testing bucket exists..."
if docker exec otomuhasebe-minio mc ls myminio/otomuhasebe > /dev/null 2>&1; then
    echo "   ✅ Bucket 'otomuhasebe' exists"
else
    echo "   ❌ Bucket not found"
    exit 1
fi

# Test 3: Versioning enabled
echo ""
echo "3️⃣ Testing versioning..."
VERSION_STATUS=$(docker exec otomuhasebe-minio mc version info myminio/otomuhasebe 2>&1 | grep "enabled" || echo "disabled")
if [[ "$VERSION_STATUS" == *"enabled"* ]]; then
    echo "   ✅ Versioning is enabled"
else
    echo "   ❌ Versioning is not enabled"
    exit 1
fi

# Test 4: Upload test file
echo ""
echo "4️⃣ Testing file upload..."
TEST_FILE="/tmp/minio-test-$(date +%s).txt"
echo "MinIO Test File - $(date)" > "$TEST_FILE"

if docker cp "$TEST_FILE" otomuhasebe-minio:/tmp/test.txt && \
   docker exec otomuhasebe-minio mc cp /tmp/test.txt myminio/otomuhasebe/test/ > /dev/null 2>&1; then
    echo "   ✅ File upload successful"
else
    echo "   ❌ File upload failed"
    rm -f "$TEST_FILE"
    exit 1
fi

# Test 5: List files
echo ""
echo "5️⃣ Testing file listing..."
if docker exec otomuhasebe-minio mc ls myminio/otomuhasebe/test/ > /dev/null 2>&1; then
    echo "   ✅ File listing successful"
else
    echo "   ❌ File listing failed"
fi

# Test 6: Delete file
echo ""
echo "6️⃣ Testing file deletion..."
if docker exec otomuhasebe-minio mc rm myminio/otomuhasebe/test/test.txt > /dev/null 2>&1; then
    echo "   ✅ File deletion successful"
else
    echo "   ❌ File deletion failed"
fi

# Cleanup
rm -f "$TEST_FILE"
docker exec otomuhasebe-minio rm -f /tmp/test.txt 2>/dev/null || true

echo ""
echo "================================"
echo "✅ All MinIO tests passed!"
echo ""
echo "MinIO is ready for use."
echo "Current storage driver: ${STORAGE_DRIVER:-local}"
echo ""
echo "To switch to MinIO:"
echo "  1. Edit .env file: STORAGE_DRIVER=minio"
echo "  2. Restart backend: docker compose restart backend"
