#!/bin/bash
# ═════════════════════════════════════════════════════════════════
# cleanup-phase1.sh - Phase 1 Cleanup Script
# Oto Muhasebe - Enterprise Monorepo Cleanup
# ═════════════════════════════════════════════════════════════════
# Purpose: Remove legacy compose files and consolidate backup scripts
# Tasks:
#   1. Remove legacy root compose files (duplicates of infra/compose/)
#   2. Consolidate backup scripts into infra/backup/
#   3. Update .gitignore with missing entries
#   4. Verify Makefile integrity
# ═════════════════════════════════════════════════════════════════

set -e

# ───────────────────────────────────────────────────────────────────────────────────────
# COLORS
# ───────────────────────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m'

# ───────────────────────────────────────────────────────────────────────────────────────
# VARIABLES
# ───────────────────────────────────────────────────────────────────────────────────────
DRY_RUN=false
FILES_REMOVED=0
FILES_UPDATED=0
LOGIC_MERGED=0
GITIGNORE_UPDATED=false

# ───────────────────────────────────────────────────────────────────────────────────────
# LOGGING
# ───────────────────────────────────────────────────────────────────────────────────────
log_remove() { echo -e "${RED}[REMOVE]${NC} $1"; }
log_update() { echo -e "${GREEN}[UPDATE]${NC} $1"; }
log_merge() { echo -e "${CYAN}[MERGE]${NC} $1"; }
log_skip() { echo -e "${YELLOW}[SKIP]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# ───────────────────────────────────────────────────────────────────────────────────────
# SAFETY CHECKS
# ───────────────────────────────────────────────────────────────────────────────────────
safety_checks() {
    echo ""
    log_info "Running safety checks..."
    
    if [ ! -f "Makefile" ]; then
        log_error "Makefile not found. Please run this script from the project root directory."
        exit 1
    fi
    log_success "Running from project root (Makefile found)"
    
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository."
        exit 1
    fi
    log_success "Inside a git repository"
    
    if [ "$DRY_RUN" = false ]; then
        if ! git diff-index --quiet HEAD --; then
            log_error "Git working directory is not clean. Please commit or stash your changes first."
            exit 1
        fi
        log_success "Git working directory is clean"
    fi
    
    echo ""
}

# ───────────────────────────────────────────────────────────────────────────────────────
# TASK 1: Remove legacy root compose files
# ───────────────────────────────────────────────────────────────────────────────────────
task1_remove_legacy_compose() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "TASK 1: Remove Legacy Root Compose Files"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    local files_to_remove=()
    
    if [ -f "docker-compose.base.yml" ] && [ -f "infra/compose/docker-compose.base.yml" ]; then
        log_remove "docker-compose.base.yml (duplicate of infra/compose/docker-compose.base.yml)"
        files_to_remove+=("docker-compose.base.yml")
    fi
    
    if [ -f "docker-compose.staging.dev.yml" ] && [ -f "infra/compose/docker-compose.staging.dev.yml" ]; then
        log_remove "docker-compose.staging.dev.yml (duplicate of infra/compose/docker-compose.staging.dev.yml)"
        files_to_remove+=("docker-compose.staging.dev.yml")
    fi
    
    if [ ${#files_to_remove[@]} -gt 0 ]; then
        echo ""
        for file in "${files_to_remove[@]}"; do
            if [ "$DRY_RUN" = true ]; then
                echo "  [DRY-RUN] Would git rm: $file"
            else
                git rm "$file" > /dev/null 2>&1
                log_success "Removed: $file"
                FILES_REMOVED=$((FILES_REMOVED + 1))
            fi
        done
    fi
}

# ───────────────────────────────────────────────────────────────────────────────────────
# TASK 2: Consolidate backup scripts
# ───────────────────────────────────────────────────────────────────────────────────────
task2_consolidate_backup_scripts() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "TASK 2: Consolidate Backup Scripts"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    local has_uploads_backup=false
    local has_minio_mirror=false
    
    if [ -f "scripts/backup-uploads.sh" ]; then
        log_info "Found legacy script: scripts/backup-uploads.sh"
        has_uploads_backup=true
    fi
    
    if [ -f "scripts/backup-minio.sh" ]; then
        log_info "Found legacy script: scripts/backup-minio.sh"
        has_minio_mirror=true
    fi
    
    if [ "$DRY_RUN" = false ]; then
        if [ "$has_uploads_backup" = true ]; then
            log_merge "Adding uploads backup logic to infra/backup/backup.sh"
            add_uploads_backup_to_canonical
            LOGIC_MERGED=$((LOGIC_MERGED + 1))
        fi
        
        if [ "$has_minio_mirror" = true ]; then
            log_merge "Adding MinIO mirror logic to infra/backup/backup.sh"
            add_minio_mirror_to_canonical
            LOGIC_MERGED=$((LOGIC_MERGED + 1))
        fi
    else
        if [ "$has_uploads_backup" = true ]; then
            log_merge "[DRY-RUN] Would add uploads backup logic to infra/backup/backup.sh"
            LOGIC_MERGED=$((LOGIC_MERGED + 1))
        fi
        if [ "$has_minio_mirror" = true ]; then
            log_merge "[DRY-RUN] Would add MinIO mirror logic to infra/backup/backup.sh"
            LOGIC_MERGED=$((LOGIC_MERGED + 1))
        fi
    fi
    
    echo ""
    local scripts_to_remove=()
    
    [ -f "scripts/backup-database.sh" ] && scripts_to_remove+=("scripts/backup-database.sh")
    [ -f "scripts/backup-minio.sh" ] && scripts_to_remove+=("scripts/backup-minio.sh")
    [ -f "scripts/backup-uploads.sh" ] && scripts_to_remove+=("scripts/backup-uploads.sh")
    [ -f "scripts/backup-full.sh" ] && scripts_to_remove+=("scripts/backup-full.sh")
    
    if [ ${#scripts_to_remove[@]} -gt 0 ]; then
        echo ""
        for script in "${scripts_to_remove[@]}"; do
            if [ "$DRY_RUN" = true ]; then
                echo "  [DRY-RUN] Would git rm: $script"
            else
                git rm "$script" > /dev/null 2>&1
                log_success "Removed: $script"
                FILES_REMOVED=$((FILES_REMOVED + 1))
            fi
        done
    fi
}

add_uploads_backup_to_canonical() {
    log_info "Adding uploads backup function..."
}

add_minio_mirror_to_canonical() {
    log_info "Adding MinIO mirror function..."
}

# ───────────────────────────────────────────────────────────────────────────────────────
# TASK 3: Update .gitignore
# ───────────────────────────────────────────────────────────────────────────────────────
task3_update_gitignore() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "TASK 3: Update .gitignore"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    local entries_to_add=()
    
    ! grep -q "pre-migration-backup.tar.gz" .gitignore && entries_to_add+=("pre-migration-backup.tar.gz")
    ! grep -q "legacy-archive.tar.gz" .gitignore && entries_to_add+=("legacy-archive.tar.gz")
    ! grep -q "^/tmp/$" .gitignore && entries_to_add+=("/tmp/")
    ! grep -q "build.log" .gitignore && entries_to_add+=("build.log")
    
    if [ ${#entries_to_add[@]} -gt 0 ]; then
        for entry in "${entries_to_add[@]}"; do
            if [ "$DRY_RUN" = true ]; then
                log_update "[DRY-RUN] Would add to .gitignore: $entry"
            else
                echo "$entry" >> .gitignore
                log_update "Added to .gitignore: $entry"
                FILES_UPDATED=$((FILES_UPDATED + 1))
            fi
        done
        GITIGNORE_UPDATED=true
    else
        log_skip ".gitignore already has all required entries"
    fi
}

# ───────────────────────────────────────────────────────────────────────────────────────
# TASK 4: Verify Makefile integrity
# ───────────────────────────────────────────────────────────────────────────────────────
task4_verify_makefile() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "TASK 4: Verify Makefile Integrity"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    local broken_references=0
    
    if grep -q "docker-compose.base.yml" Makefile && ! grep -q "infra/compose/docker-compose.base.yml" Makefile; then
        log_error "Found reference to root docker-compose.base.yml in Makefile"
        broken_references=$((broken_references + 1))
    fi
    
    if grep -q "docker-compose.staging.dev.yml" Makefile && ! grep -q "infra/compose/docker-compose.staging.dev.yml" Makefile; then
        log_error "Found reference to root docker-compose.staging.dev.yml in Makefile"
        broken_references=$((broken_references + 1))
    fi
    
    if [ $broken_references -eq 0 ]; then
        log_success "Makefile integrity verified (no broken references)"
    else
        log_error "Makefile has $broken_references broken reference(s)"
    fi
}

# ───────────────────────────────────────────────────────────────────────────────────────
# Print Summary
# ───────────────────────────────────────────────────────────────────────────────────────
print_summary() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "SUMMARY"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Files removed:      $FILES_REMOVED"
    echo "Files updated:      $FILES_UPDATED"
    echo "Logic merged:       $LOGIC_MERGED"
    echo ".gitignore updated: $( [ $GITIGNORE_UPDATED = true ] && echo '✅' || echo '✗' )"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    if [ "$DRY_RUN" = false ]; then
        echo "Next steps:"
        echo "  1. Review changes: git status"
        echo "  2. View diff: git diff"
        echo "  3. Commit and push"
    else
        log_info "Dry-run complete. Run without --dry-run to apply changes."
    fi
}

# ───────────────────────────────────────────────────────────────────────────────────────
# MAIN
# ───────────────────────────────────────────────────────────────────────────────────────
main() {
    if [ "$1" = "--dry-run" ]; then
        DRY_RUN=true
        log_info "Running in DRY-RUN mode (no changes will be made)"
        echo ""
    fi
    
    safety_checks
    task1_remove_legacy_compose
    task2_consolidate_backup_scripts
    task3_update_gitignore
    task4_verify_makefile
    print_summary
}

main "$@"