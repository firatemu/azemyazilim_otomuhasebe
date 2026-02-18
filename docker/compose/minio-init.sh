#!/bin/bash
# MinIO Initialization Script
# This script creates the bucket and enables versioning

set -e

echo "🚀 Initializing MinIO..."

# Wait for MinIO to be ready
until curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; do
  echo "⏳ Waiting for MinIO to be ready..."
  sleep 2
done

echo "✅ MinIO is ready"

# Install mc (MinIO Client) if not present
if ! command -v mc &> /dev/null; then
    echo "📦 Installing MinIO Client..."
    wget -q https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc
    chmod +x /usr/local/bin/mc
fi

# Configure alias
echo "🔧 Configuring MinIO alias..."
mc alias set local http://localhost:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"

# Create bucket if it doesn't exist
BUCKET_NAME="${MINIO_BUCKET:-otomuhasebe}"

if mc ls "local/${BUCKET_NAME}" > /dev/null 2>&1; then
    echo "✅ Bucket '${BUCKET_NAME}' already exists"
else
    echo "📦 Creating bucket '${BUCKET_NAME}'..."
    mc mb "local/${BUCKET_NAME}"
    echo "✅ Bucket created"
fi

# Enable versioning
echo "🔄 Enabling versioning..."
mc version enable "local/${BUCKET_NAME}"
echo "✅ Versioning enabled"

# Set lifecycle policy to prevent auto-deletion
echo "🔒 Configuring lifecycle policy (manual deletion only)..."
cat > /tmp/lifecycle.json <<EOF
{
  "Rules": []
}
EOF
mc ilm import "local/${BUCKET_NAME}" < /tmp/lifecycle.json
echo "✅ Lifecycle policy configured (no auto-deletion)"

# Verify configuration
echo "📊 Verifying configuration..."
mc version info "local/${BUCKET_NAME}"
mc ilm ls "local/${BUCKET_NAME}"

echo "✅ MinIO initialization complete!"
echo "📍 Bucket: ${BUCKET_NAME}"
echo "📍 Versioning: Enabled"
echo "📍 Auto-deletion: Disabled (manual only)"
