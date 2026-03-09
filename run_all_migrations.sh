#!/bin/bash

# ============================================
# Master Migration Execution Script
# ============================================
# This script runs all migration tasks in the correct order
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database connection settings
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-otomuhasebe}"

echo "========================================"
echo "DATABASE MIGRATION MASTER SCRIPT"
echo "========================================"
echo "Host: $DB_HOST:$DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "========================================"
echo ""

# Function to run SQL file
run_migration() {
    local task_name=$1
    local sql_file=$2
    
    echo -e "${YELLOW}Running: $task_name${NC}"
    echo "File: $sql_file"
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$sql_file" 2>&1 | tee "/tmp/${task_name}.log"; then
        echo -e "${GREEN}✓ $task_name completed successfully${NC}"
    else
        echo -e "${RED}✗ $task_name failed!${NC}"
        echo "Check /tmp/${task_name}.log for details"
        exit 1
    fi
    echo ""
}

# Function to check if table exists
table_exists() {
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='$1')"
}

# Function to check if column exists
column_exists() {
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name='$1' AND column_name='$2')"
}

# ============================================
# Pre-flight Checks
# ============================================
echo "Running pre-flight checks..."
echo ""

# Check database connection
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}✗ Cannot connect to database!${NC}"
    echo "Please check your database connection settings."
    exit 1
fi
echo -e "${GREEN}✓ Database connection successful${NC}"
echo ""

# Check if tenants table exists (multi-tenancy prerequisite)
if [ "$(table_exists "tenants")" != "t" ]; then
    echo -e "${RED}✗ Tenants table not found! Multi-tenancy is not set up.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Multi-tenancy table found${NC}"
echo ""

# ============================================
# Create Backup Before Migration
# ============================================
echo "Creating database backup..."
BACKUP_FILE="migration_backup_$(date +%Y%m%d_%H%M%S).sql"
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE" 2>&1; then
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
    echo ""
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi

# ============================================
# Execute Migrations in Order
# ============================================

echo "========================================"
echo "STARTING MIGRATIONS"
echo "========================================"
echo ""

# TASK 1: Fix Nullable/Missing tenantId Columns
if [ -f "migration_task_01_complete_fixed.sql" ]; then
    run_migration "TASK_01_TenantId_Fix" "migration_task_01_complete_fixed.sql"
else
    echo -e "${YELLOW}⚠ Skipping TASK 1: File not found${NC}"
fi

# TASK 5: Add Composite Indexes
if [ -f "migration_task_05_composite_indexes_fixed.sql" ]; then
    run_migration "TASK_05_Composite_Indexes" "migration_task_05_composite_indexes_fixed.sql"
else
    echo -e "${YELLOW}⚠ Skipping TASK 5: File not found${NC}"
fi

# TASK 6: Add Multi-Currency Support
if [ -f "migration_task_06_multi_currency_fixed.sql" ]; then
    run_migration "TASK_06_Multi_Currency" "migration_task_06_multi_currency_fixed.sql"
else
    echo -e "${YELLOW}⚠ Skipping TASK 6: File not found${NC}"
fi

# TASK 7: Fix CheckBill Endorsement
if [ -f "migration_task_07_checkbill_endorsement_fixed.sql" ]; then
    run_migration "TASK_07_CheckBill_Endorsement" "migration_task_07_checkbill_endorsement_fixed.sql"
else
    echo -e "${YELLOW}⚠ Skipping TASK 7: File not found${NC}"
fi

# TASK 8: Float Validation
if [ -f "migration_task_08_float_validation_fixed.sql" ]; then
    run_migration "TASK_08_Float_Validation" "migration_task_08_float_validation_fixed.sql"
else
    echo -e "${YELLOW}⚠ Skipping TASK 8: File not found${NC}"
fi

# TASK 9: Brand Normalization
if [ -f "migration_task_09_brand_normalization_fixed.sql" ]; then
    run_migration "TASK_09_Brand_Normalization" "migration_task_09_brand_normalization_fixed.sql"
else
    echo -e "${YELLOW}⚠ Skipping TASK 9: File not found${NC}"
fi

# TASK 10: Category Normalization
if [ -f "migration_task_10_category_normalization_fixed.sql" ]; then
    run_migration "TASK_10_Category_Normalization" "migration_task_10_category_normalization_fixed.sql"
else
    echo -e "${YELLOW}⚠ Skipping TASK 10: File not found${NC}"
fi

# TASK 11: Vehicle Compatibility
if [ -f "migration_task_11_vehicle_compatibility_fixed.sql" ]; then
    run_migration "TASK_11_Vehicle_Compatibility" "migration_task_11_vehicle_compatibility_fixed.sql"
else
    echo -e "${YELLOW}⚠ Skipping TASK 11: File not found${NC}"
fi

# TASK 12: Unit Duplication
if [ -f "migration_task_12_unit_duplication_fixed.sql" ]; then
    run_migration "TASK_12_Unit_Duplication" "migration_task_12_unit_duplication_fixed.sql"
else
    echo -e "${YELLOW}⚠ Skipping TASK 12: File not found${NC}"
fi

# TASK 13: RLS Preparation
if [ -f "migration_task_13_rls_preparation_fixed.sql" ]; then
    run_migration "TASK_13_RLS_Preparation" "migration_task_13_rls_preparation_fixed.sql"
else
    echo -e "${YELLOW}⚠ Skipping TASK 13: File not found${NC}"
fi

# ============================================
# Post-Migration Verification
# ============================================
echo "========================================"
echo "POST-MIGRATION VERIFICATION"
echo "========================================"
echo ""

# Count tables with tenant_id
TENANT_TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(DISTINCT table_name) FROM information_schema.columns WHERE column_name IN ('tenant_id', 'tenantId') AND table_schema='public'")
echo -e "${GREEN}✓ Tables with tenant isolation: $TENANT_TABLES${NC}"

# Count indexes created
INDEX_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE '%_idx' AND schemaname='public'")
echo -e "${GREEN}✓ Total indexes created: $INDEX_COUNT${NC}"

# Check for tables without tenant_id (should be 0)
NO_TENANT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "
SELECT COUNT(*) FROM (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name NOT IN ('tenants', 'users', 'roles', 'permissions', 'audit_logs', 'license_keys', 'tenant_settings', '_prisma_migrations', 'migration_lock')
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT IN (SELECT table_name FROM information_schema.columns WHERE column_name IN ('tenant_id', 'tenantId'))
) t
")
if [ "$NO_TENANT" -eq 0 ]; then
    echo -e "${GREEN}✓ All tables have tenant isolation${NC}"
else
    echo -e "${YELLOW}⚠ Warning: $NO_TENANT tables without tenant isolation${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}ALL MIGRATIONS COMPLETED SUCCESSFULLY!${NC}"
echo "========================================"
echo ""
echo "Backup file: $BACKUP_FILE"
echo "Log files: /tmp/TASK_*.log"
echo ""
echo "Next steps:"
echo "1. Review the logs for any warnings"
echo "2. Test the application thoroughly"
echo "3. Monitor database performance"
echo "4. Consider enabling RLS after testing (TASK 13 notes)"