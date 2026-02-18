#!/usr/bin/env bash
set -euo pipefail

PROD_ROOT="${PROD_ROOT:-otomuhasebe.com}"
PROD_API="${PROD_API:-api.otomuhasebe.com}"
PROD_ADMIN="${PROD_ADMIN:-admin.otomuhasebe.com}"

STG_ROOT="${STG_ROOT:-staging.otomuhasebe.com}"
STG_API="${STG_API:-staging-api.otomuhasebe.com}"
STG_ADMIN="${STG_ADMIN:-admin-staging.otomuhasebe.com}"

API_HEALTH="${API_HEALTH:-/health}"
UI_PATH="${UI_PATH:-/}"

check() {
  local url="\$1"
  local expect_regex="^2|^3"  # 2xx/3xx kabul
  code=\$(curl -s -o /dev/null -w "%{http_code}" "\$url")
  if [[ "\$code" =~ \$expect_regex ]]; then
    echo "OK  [\$(echo \${code} | cut -c1-)] \$url"
  else
    echo "FAIL[\$(echo \${code} | cut -c1-)] \$url" >&2
    exit 1
  fi
}

echo "== PROD =="
check "https://\${PROD_API}\${API_HEALTH}"
check "https://\${PROD_ADMIN}\${UI_PATH}"

echo "== STAGING =="
check "https://\${STG_API}\${API_HEALTH}"
check "https://\${STG_ADMIN}\${UI_PATH}"

echo "All good ✅"
