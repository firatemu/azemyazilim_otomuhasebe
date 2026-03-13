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
BOLD_RED='\033[1;31m'
GREEN='\033[0;32m'
BOLD_GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ───────────────────────────────────────────────────────────────────────────────────────
# VARIABLES
# ───────────────────────────────────────────────────────────────────────────────────────
DRY_RUN=false
FILES_REMOVED=0
FILES_UPDATED=0
LOGIC_MERGED=0
GITIGNORE_UPDATED=false

# ───────────────────────────────────────────────────────────────────────────────────────
# USAGE
# ───────────────────────────────────────────────────────────────────────────────────────
usage() {
    echo "Usage: $0 [--dry-run]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Preview changes without executing"
    echo ""
    exit 0
}

# ───────────────────────────────────────────────────────────────────────────────────────
# LOGGING
# ───────────────────────────────────────────────────────────────────────────────────────
log_remove() {
    echo -e "${RED}[REMOVE]${NC} $1"
}

log_update() {
    echo -e "${GREEN}[UPDATE]${NC} $1"
}

log_merge() {
    echo -e "${CYAN}[MERGE]${NC} $1"
}

log_skip() {
    echo -e "${YELLOW}[SKIP]${NC} $1"
}

log_error() {
    echo -e "${BOLD_RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${BOLD_GREEN}[SUCCESS]${NC} $1"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# ───────────────────────────────────────────────────────────────────────────────────────
# SAFETY CHECKS
# ───────────────────────────────────────────────────────────────────────────────────────
safety_checks() {
    echo ""
    log_info "Running safety checks..."
    
    # Check if running from project root
    if [ ! -f "Makefile" ]; then
        log_error "Makefile not found. Please run this script from the project root directory."
        exit 1
    fi
    log_success "Running from project root (Makefile found)"
    
    # Check if inside a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository."
        exit 1
    fi
    log_success "Inside a git repository"
    
    # Check if git status is clean
    if [ "$DRY_RUN" = false ]; then
        if ! git diff-index --quiet HEAD --; then
            log_error "Git working directory is not clean. Please commit or stash your changes first."
            echo "Run: git status"
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
    
    # Check docker-compose.base.yml
    if [ -f "docker-compose.base.yml" ]; then
        # Check if canonical version exists
        if [ -f "infra/compose/docker-compose.base.yml" ]; then
            log_remove "docker-compose.base.yml (duplicate of infra/compose/docker-compose.base.yml)"
            files_to_remove+=("docker-compose.base.yml")
        else
            log_skip "docker-compose.base.yml (canonical version not found in infra/compose/)"
        fi
    else
        log_skip "docker-compose.base.yml (not found)"
    fi
    
    # Check docker-compose.staging.dev.yml
    if [ -f "docker-compose.staging.dev.yml" ]; then
        # Check if canonical version exists
        if [ -f "infra/compose/docker-compose.staging.dev.yml" ]; then
            log_remove "docker-compose.staging.dev.yml (duplicate of infra/compose/docker-compose.staging.dev.yml)"
            files_to_remove+=("docker-compose.staging.dev.yml")
        else
            log_skip "docker-compose.staging.dev.yml (canonical version not found in infra/compose/)"
        fi
    else
        log_skip "docker-compose.staging.dev.yml (not found)"
    fi
    
    # Remove files
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
    
    # Step 1: Read canonical backup script
    if [ ! -f "infra/backup/backup.sh" ]; then
        log_error "Canonical backup script not found: infra/backup/backup.sh"
        exit 1
    fi
    
    log_info "Canonical backup script found: infra/backup/backup.sh"
    
    # Step 2: Check legacy scripts
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
    
    # Step 3: Merge logic (only if dry-run=false)
    if [ "$DRY_RUN" = false ]; then
        if [ "$has_uploads_backup" = true ]; then
            log_merge "Adding uploads backup logic to infra/backup/backup.sh"
            # Add backup_uploads function
            add_uploads_backup_to_canonical
            LOGIC_MERGED=$((LOGIC_MERGED + 1))
        fi
        
        if [ "$has_minio_mirror" = true ]; then
            log_merge "Adding MinIO mirror logic to infra/backup/backup.sh"
            # Add mirror_minio function
            add_minio_mirror_to_canonical
            LOGIC_MERGED=$((LOGIC_MERGED + 1))
        fi
        
        # Add consolidation comment
        add_consolidation_comment
    else
        # Dry-run: show what would be merged
        if [ "$has_uploads_backup" = true ]; then
            log_merge "[DRY-RUN] Would add uploads backup logic to infra/backup/backup.sh"
            LOGIC_MERGED=$((LOGIC_MERGED + 1))
        fi
        if [ "$has_minio_mirror" = true ]; then
            log_merge "[DRY-RUN] Would add MinIO mirror logic to infra/backup/backup.sh"
            LOGIC_MERGED=$((LOGIC_MERGED + 1))
        fi
        log_merge "[DRY-RUN] Would add consolidation comment to infra/backup/backup.sh"
    fi
    
    # Step 4: Remove legacy backup scripts
    echo ""
    local scripts_to_remove=()
    
    if [ -f "scripts/backup-database.sh" ]; then
        log_remove "scripts/backup-database.sh (logic exists in infra/backup/backup.sh)"
        scripts_to_remove+=("scripts/backup-database.sh")
    fi
    
    if [ -f "scripts/backup-minio.sh" ]; then
        log_remove "scripts/backup-minio.sh (logic merged to infra/backup/backup.sh)"
        scripts_to_remove+=("scripts/backup-minio.sh")
    fi
    
    if [ -f "scripts/backup-uploads.sh" ]; then
        log_remove "scripts/backup-uploads.sh (logic merged to infra/backup/backup.sh)"
        scripts_to_remove+=("scripts/backup-uploads.sh")
    fi
    
    if [ -f "scripts/backup-full.sh" ]; then
        log_remove "scripts/backup-full.sh (unique value removed - see docs)"
        scripts_to_remove+=("scripts/backup-full.sh")
    fi
    
    # Remove files
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

# ───────────────────────────────────────────────────────────────────────────────────────
# Helper: Add uploads backup logic
# ───────────────────────────────────────────────────────────────────────────────────────
add_uploads_backup_to_canonical() {
    # Add backup_uploads function before main()
    local insert_line=$(grep -n "^# ── MAIN FUNCTION" infra/backup/backup.sh | cut -d: -f1)
    
    if [ -z "$insert_line" ]; then
        log_error "Could not find MAIN FUNCTION marker in infra/backup/backup.sh"
        return 1
    fi
    
    local uploads_function='
# ── BACKUP UPLOADS ────────────────────────────────────────────────────────────────
backup_uploads() {
    log STEP "Backing up uploads directory..."

    local uploads_dir="/app/server/uploads"
    local filename="uploads_$(date +%Y-%m-%d_%H-%M-%S).tar.gz"
    local filepath="/backups/$filename"

    if [ ! -d "$uploads_dir" ]; then
        log WARN "Uploads directory not found: $uploads_dir"
        return 0
    fi

    # Check if directory is empty
    local file_count=$(find "$uploads_dir" -type f 2>/dev/null | wc -l)
    if [ "$file_count" -eq 0 ]; then
        log WARN "Uploads directory is empty. Skipping backup."
        return 0
    fi

    # Create tar.gz archive
    log STEP "Creating uploads backup: $filename"
    if ! tar -czf "$filepath" -C /app server/uploads 2>&1; then
        log ERROR "Failed to create uploads backup!"
        return 1
    fi

    # Verify backup file
    if [ ! -s "$filepath" ]; then
        log ERROR "Uploads backup file is empty!"
        rm -f "$filepath"
        return 1
    fi

    local filesize=$(du -h "$filepath" | cut -f1)
    log INFO "Uploads backup created: $filename (Size: $filesize)"
}
'
    
    # Insert before MAIN FUNCTION
    sed -i "${insert_line}i\\$uploads_function" infra/backup/backup.sh
    
    # Add call to backup_uploads in main()
    local main_line=$(grep -n "^main() {" infra/backup/backup.sh | cut -d: -f1)
    local print_summary_line=$(grep -n "^    print_summary" infra/backup/backup.sh | cut -d: -f1)
    
    if [ -z "$print_summary_line" ]; then
        log_error "Could not find print_summary in main()"
        return 1
    fi
    
    # Insert call before print_summary
    sed -i "${print_summary_line}i\\    # Step 5.5: Backup uploads directory\\n    backup_uploads\\n" infra/backup/backup.sh
}

# ───────────────────────────────────────────────────────────────────────────────────────
# Helper: Add MinIO mirror logic
# ───────────────────────────────────────────────────────────────────────────────────────
add_minio_mirror_to_canonical() {
    # Add mirror_minio function before main()
    local insert_line=$(grep -n "^# ── MAIN FUNCTION" infra/backup/backup.sh | cut -d: -f1)
    
    if [ -z "$insert_line" ]; then
        log_error "Could not find MAIN FUNCTION marker in infra/backup/backup.sh"
        return 1
    fi
    
    local mirror_function='
# ── MIRROR MinIO BUCKET ────────────────────────────────────────────────────────────
mirror_minio_bucket() {
    if [ -z "$MINIO_ENDPOINT" ]; then
        log WARN "MinIO not configured. Skipping bucket mirror."
        return 0
    fi

    log STEP "Mirroring MinIO bucket to local backup..."

    local mirror_dir="/backups/minio_$(date +%Y-%m-%d_%H-%M-%S)"
    mkdir -p "$mirror_dir"

    # Use mc mirror to copy entire bucket
    if ! mc mirror "minio/$MINIO_BUCKET" "$mirror_dir/" > /dev/null 2>&1; then
        log WARN "MinIO mirror failed (non-fatal)."
        log WARN "Backup saved locally: $mirror_dir"
        return 2
    fi

    local dirsize=$(du -sh "$mirror_dir" 2>/dev/null | cut -f1)
    log INFO "MinIO bucket mirrored: $mirror_dir (Size: $dirsize)"
}
'
    
    # Insert before MAIN FUNCTION
    sed -i "${insert_line}i\\$mirror_function" infra/backup/backup.sh
    
    # Add call to mirror_minio in main()
    local upload_minio_line=$(grep -n "^    upload_to_minio" infra/backup/backup.sh | cut -d: -f1)
    
    if [ -z "$upload_minio_line" ]; then
        log_error "Could not find upload_to_minio in main()"
        return 1
    fi
    
    # Insert after upload_to_minio
    local next_line=$((upload_minio_line + 1))
    sed -i "${next_line}i\\    # Step 5.5: Mirror MinIO bucket\\n    mirror_minio_bucket\\n" infra/backup/backup.sh
}

# ───────────────────────────────────────────────────────────────────────────────────────
# Helper: Add consolidation comment
# ───────────────────────────────────────────────────────────────────────────────────────
add_consolidation_comment() {
    # Add comment at the top of the file after the shebang
    local comment='
# ═════════════════════════════════════════════════════════════════
# CONSOLIDATED FROM LEGACY SCRIPTS
# ═════════════════════════════════════════════════════════════════
# This script has been consolidated from the following legacy scripts:
#   - scripts/backup-database.sh (database backup logic)
#   - scripts/backup-minio.sh (MinIO bucket mirroring)
#   - scripts/backup-uploads.sh (uploads directory backup)
#   - scripts/backup-full.sh (full backup utility - removed, see docs)
#
# All legacy scripts were removed in Phase 1 cleanup.
# ═════════════════════════════════════════════════════════════════
'
    
    # Insert after first line (shebang)
    sed -i '1 a \\'"$comment"'' infra/backup/backup.sh
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
    
    # Check for pre-migration-backup.tar.gz
    if ! grep -q "pre-migration-backup.tar.gz" .gitignore; then
        entries_to_add+=("pre-migration-backup.tar.gz")
    fi
    
    # Check for legacy-archive.tar.gz
    if ! grep -q "legacy-archive.tar.gz" .gitignore; then
        entries_to_add+=("legacy-archive.tar.gz")
    fi
    
    # Check for /tmp/ (not /tmp/*)
    if ! grep -q "^/tmp/$" .gitignore; then
        entries_to_add+=("/tmp/")
    fi
    
    # Check for build.log
    if ! grep -q "build.log" .gitignore; then
        entries_to_add+=("build.log")
    fi
    
    # Add entries
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
    
    # Check for references to docker-compose.base.yml at root
    if grep -q "docker-compose.base.yml" Makefile && ! grep -q "infra/compose/docker-compose.base.yml" Makefile; then
        log_error "Found reference to root docker-compose.base.yml in Makefile"
        broken_references=$((broken_references + 1))
    fi
    
    # Check for references to docker-compose.staging.dev.yml at root
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
        echo "  3. Commit changes:"
        echo ""
        echo "     git add -A"
        echo '     git commit -m "chore: phase 1 cleanup — remove legacy files'
        echo ""
        echo '     - Remove legacy root compose files (duplicates of infra/compose/)'
        echo '     - Consolidate backup scripts into infra/backup/'
        echo '     - Update Makefile references'
        echo '     - Update .gitignore with missing entries'
        echo ""
        echo '     Resolves: duplicate compose files, backup script chaos"'
        echo ""
        echo "  4. Push to remote: git push origin main"
    else
        log_info "Dry-run complete. Run without --dry-run to apply changes."
    fi
}

# ───────────────────────────────────────────────────────────────────────────────────────
# MAIN
# ───────────────────────────────────────────────────────────────────────────────────────
main() {
    # Parse arguments
    if [ "$1" = "--dry-run" ]; then
        DRY_RUN=true
        log_info "Running in DRY-RUN mode (no changes will be made)"
        echo ""
    fi
    
    # Safety checks
    safety_checks
    
    # Execute tasks
    task1_remove_legacy_compose
    task2_consolidate_backup_scripts
    task3_update_gitignore
    task4_verify_makefile
    
    # Print summary
    print_summary
}

# Run main
main "$@"