#!/bin/bash

# ═════════════════════════════════════════════════════════════════
# rename-docker-to-compose.sh
# Rename infra/docker/ to infra/compose/ and update all references
# ═════════════════════════════════════════════════════════════════

set -e

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD_GREEN='\033[1;32m'
NC='\033[0m' # No Color

# Dry run flag
DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
    DRY_RUN=true
    echo -e "${CYAN}[INFO]${NC} Running in DRY-RUN mode (no changes will be made)"
    echo ""
fi

# ═════════════════════════════════════════════════════════════════
# SAFETY CHECKS
# ═════════════════════════════════════════════════════════════════

# Check if running from project root
if [ ! -f "Makefile" ]; then
    echo -e "${RED}[ERROR]${NC} Makefile not found. Please run this script from the project root directory."
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Running from project root (Makefile found)"

# Check if infra/docker/ exists
if [ ! -d "infra/docker" ]; then
    echo -e "${RED}[ERROR]${NC} infra/docker/ directory not found."
    exit 1
fi
echo -e "${GREEN}[OK]${NC} infra/docker/ directory exists"

# Check if infra/compose/ already exists
if [ -d "infra/compose" ]; then
    echo -e "${RED}[ERROR]${NC} infra/compose/ directory already exists. Aborting to prevent data loss."
    exit 1
fi
echo -e "${GREEN}[OK]${NC} infra/compose/ does not exist yet (safe to proceed)"

echo ""

# ═════════════════════════════════════════════════════════════════
# RENAME DIRECTORY
# ═════════════════════════════════════════════════════════════════

if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}[RENAME]${NC} infra/docker → infra/compose"
else
    git mv infra/docker infra/compose
    echo -e "${CYAN}[RENAME]${NC} infra/docker → infra/compose (done)"
fi

echo ""

# ═════════════════════════════════════════════════════════════════
# UPDATE FILE REFERENCES
# ═════════════════════════════════════════════════════════════════

TOTAL_FILES=0
TOTAL_REPLACEMENTS=0

# Function to replace in file
update_file() {
    local file=$1
    local count_before=0
    local count_after=0
    
    # Count occurrences before
    count_before=$(grep -c "infra/docker" "$file" 2>/dev/null | tr -d '[:space:]' || echo 0)
    
    if [ "$count_before" -eq 0 ]; then
        echo -e "${YELLOW}[SKIP]${NC} $file (no occurrences)"
        return
    fi
    
    if [ "$DRY_RUN" = true ]; then
        # Show what would be replaced
        echo -e "${GREEN}[UPDATE]${NC} $file:"
        grep -n "infra/docker" "$file" | head -5
        if [ "$count_before" -gt 5 ]; then
            echo "  ... and $((count_before - 5)) more occurrences"
        fi
        TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + count_before))
    else
        # Perform replacement
        sed -i 's|infra/docker/|infra/compose/|g' "$file"
        sed -i 's|infra/docker |infra/compose |g' "$file"
        
        # Count occurrences after (should be 0)
        count_after=$(grep -c "infra/docker" "$file" 2>/dev/null || echo 0)
        replaced=$((count_before - count_after))
        
        echo -e "${GREEN}[UPDATE]${NC} $file (replaced $replaced occurrences)"
        TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + replaced))
    fi
    
    TOTAL_FILES=$((TOTAL_FILES + 1))
}

# Files to update
FILES=(
    "Makefile"
    "docker-compose.yml"
    "README.md"
    "docker-compose.base.yml"
    "docker-compose.staging.dev.yml"
)

# Update root files
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        update_file "$file"
    fi
done

# Update all *.yml, *.yaml files in root
shopt -s nullglob
for file in *.yml *.yaml; do
    [ -f "$file" ] && update_file "$file"
done

# Update all *.sh files in scripts/
for file in scripts/*.sh; do
    [ -f "$file" ] && update_file "$file"
done

# Update all *.sh files in infra/
for file in infra/*.sh; do
    [ -f "$file" ] && update_file "$file"
done

# Update all *.md files in docs/
for file in docs/*.md; do
    [ -f "$file" ] && update_file "$file"
done
shopt -u nullglob

echo ""

# ═════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════

echo "═════════════════════════════════════════════════════════════════"
echo "Summary:"
echo "═════════════════════════════════════════════════════════════════"
echo "Directory renamed:   infra/docker → infra/compose"
echo "Files updated:      $TOTAL_FILES"
echo "Occurrences replaced: $TOTAL_REPLACEMENTS"
echo "═════════════════════════════════════════════════════════════════"

if [ "$DRY_RUN" = false ]; then
    echo ""
    echo -e "${BOLD_GREEN}[SUCCESS]${NC} Refactoring complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Review changes: git status"
    echo "  2. View diff: git diff"
    echo "  3. Commit changes:"
    echo ""
    echo "     git add -A"
    echo '     git commit -m "refactor: rename infra/docker to infra/compose'
    echo ""
    echo '     - Rename infra/docker/ → infra/compose/ for clarity'
    echo '     - docker/ was ambiguous (Dockerfiles vs Compose files)'
    echo '     - compose/ explicitly indicates Docker Compose configurations'
    echo '     - Update all path references in Makefile, README, scripts"'
    echo ""
    echo "  4. Push to remote: git push origin main"
else
    echo ""
    echo -e "${CYAN}[INFO]${NC} Dry-run complete. Run without --dry-run to apply changes."
fi