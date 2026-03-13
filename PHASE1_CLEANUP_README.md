# Phase 1 Cleanup Script - Documentation

**Script:** `cleanup-phase1.sh`  
**Purpose:** Remove legacy compose files and consolidate backup scripts  
**Date:** 13 Mart 2026

---

## 📋 Overview

This script performs Phase 1 cleanup of the Oto Muhasebe enterprise monorepo:

1. **Remove Legacy Root Compose Files** - Duplicates of `infra/compose/`
2. **Consolidate Backup Scripts** - Merge unique logic into canonical `infra/backup/backup.sh`
3. **Update .gitignore** - Add missing entries
4. **Verify Makefile Integrity** - Ensure no broken references

---

## 🚀 Usage

```bash
# Preview changes (recommended first)
./cleanup-phase1.sh --dry-run

# Execute cleanup
./cleanup-phase1.sh
```

---

## 📊 What Will Be Removed/Changed

### Files to Remove (6 total)

#### Legacy Compose Files (2)
- `docker-compose.base.yml` - Duplicate of `infra/compose/docker-compose.base.yml`
- `docker-compose.staging.dev.yml` - Duplicate of `infra/compose/docker-compose.staging.dev.yml`

#### Legacy Backup Scripts (4)
- `scripts/backup-database.sh` - Logic already exists in canonical script
- `scripts/backup-minio.sh` - MinIO mirror logic will be merged
- `scripts/backup-uploads.sh` - Uploads backup logic will be merged
- `scripts/backup-full.sh` - Unique utility, see notes below

### Files to Update (2 total)

#### Canonical Backup Script (1)
- `infra/backup/backup.sh` - Will receive merged logic:
  - `backup_uploads()` function (from `scripts/backup-uploads.sh`)
  - `mirror_minio_bucket()` function (from `scripts/backup-minio.sh`)
  - Consolidation comment header

#### .gitignore (1)
Will add these entries:
- `pre-migration-backup.tar.gz`
- `legacy-archive.tar.gz`
- `/tmp/`
- `build.log`

---

## 🔄 Logic Merge Details

### uploads_backup Logic

**Source:** `scripts/backup-uploads.sh`

**Will Add:**
```bash
backup_uploads() {
    log STEP "Backing up uploads directory..."
    # Creates tar.gz of api-stage/server/uploads
    # Skips if directory is empty
}
```

**Integration Point:** Called from `main()` before `print_summary()`

### MinIO Mirror Logic

**Source:** `scripts/backup-minio.sh`

**Will Add:**
```bash
mirror_minio_bucket() {
    log STEP "Mirroring MinIO bucket to local backup..."
    # Uses mc mirror to copy entire bucket
    # Non-fatal if mirror fails
}
```

**Integration Point:** Called from `main()` after `upload_to_minio()`

### Note on backup-full.sh

**Decision:** `scripts/backup-full.sh` will be **REMOVED** despite having unique logic (code backup + S3 upload).

**Reason:**
- This is a full backup utility intended for server environments
- Docker-based backup system (`infra/backup/`) is the canonical solution
- Code backup should be done via Git or separate backup strategy
- S3/Rclone uploads should be integrated into canonical script if needed

**Alternative:** If `backup-full.sh` is needed, consider:
1. Renaming to `scripts/backup-full-server.sh` (clearer purpose)
2. Creating a separate `scripts/backup-code.sh` (code-only backup)
3. Integrating S3 upload into canonical backup script

---

## ✅ Pre-Run Checklist

Before running the script, ensure:

- [ ] You're in the project root directory (Makefile exists)
- [ ] Git working directory is clean (no uncommitted changes)
- [ ] You've reviewed the dry-run output
- [ ] You've backed up any critical files (if needed)
- [ ] You understand what will be removed/changed

---

## 📝 Dry-Run Output

```
════════════════════════════════════════════════════════════════
TASK 1: Remove Legacy Root Compose Files
════════════════════════════════════════════════════════════════

[REMOVE] docker-compose.base.yml (duplicate of infra/compose/docker-compose.base.yml)
[REMOVE] docker-compose.staging.dev.yml (duplicate of infra/compose/docker-compose.staging.dev.yml)

════════════════════════════════════════════════════════════════
TASK 2: Consolidate Backup Scripts
════════════════════════════════════════════════════════════════

[MERGE] [DRY-RUN] Would add uploads backup logic to infra/backup/backup.sh
[MERGE] [DRY-RUN] Would add MinIO mirror logic to infra/backup/backup.sh

[REMOVE] scripts/backup-database.sh (logic exists in infra/backup/backup.sh)
[REMOVE] scripts/backup-minio.sh (logic merged to infra/backup/backup.sh)
[REMOVE] scripts/backup-uploads.sh (logic merged to infra/backup/backup.sh)
[REMOVE] scripts/backup-full.sh (unique value removed - see docs)

════════════════════════════════════════════════════════════════
TASK 3: Update .gitignore
════════════════════════════════════════════════════════════════

[UPDATE] [DRY-RUN] Would add to .gitignore: pre-migration-backup.tar.gz
[UPDATE] [DRY-RUN] Would add to .gitignore: legacy-archive.tar.gz
[UPDATE] [DRY-RUN] Would add to .gitignore: /tmp/
[UPDATE] [DRY-RUN] Would add to .gitignore: build.log

════════════════════════════════════════════════════════════════
TASK 4: Verify Makefile Integrity
════════════════════════════════════════════════════════════════

[SUCCESS] Makefile integrity verified (no broken references)

════════════════════════════════════════════════════════════════
SUMMARY
════════════════════════════════════════════════════════════════

Files removed:      0
Files updated:      0
Logic merged:       2
.gitignore updated: ✅
```

---

## 🎯 Post-Run Actions

### 1. Review Changes

```bash
# Check what was changed
git status

# View the actual changes
git diff

# View staged changes
git diff --staged
```

### 2. Commit Changes

```bash
git add -A
git commit -m "chore: phase 1 cleanup — remove legacy files

- Remove legacy root compose files (duplicates of infra/compose/)
- Consolidate backup scripts into infra/backup/
- Update Makefile references
- Update .gitignore with missing entries

Resolves: duplicate compose files, backup script chaos"
```

### 3. Push to Remote

```bash
git push origin main
```

---

## ⚠️ Important Notes

### Safety Checks

The script performs these safety checks before executing:

1. **Makefile exists** - Ensures running from project root
2. **Git repository** - Ensures inside a git repo
3. **Clean working directory** - Aborts if uncommitted changes exist (unless --dry-run)

### Idempotent

The script is idempotent - running it multiple times will not cause errors:
- If files are already removed, they'll be skipped
- If .gitignore entries already exist, they won't be added again
- If logic already merged, duplicate functions won't be added

### Git History

All removals use `git rm`, preserving git history:
- You can always recover deleted files with `git checkout <commit>`
- History shows the cleanup was intentional
- Future developers understand why files were removed

---

## 🐛 Troubleshooting

### Error: "Git working directory is not clean"

**Solution:** Commit or stash your changes first

```bash
# Option 1: Commit
git add -A
git commit -m "WIP: Save work before cleanup"

# Option 2: Stash
git stash
# Run cleanup
git stash pop
```

### Error: "Makefile not found"

**Solution:** Run from project root directory

```bash
cd /path/to/otomuhasebe
./cleanup-phase1.sh
```

### Error: "Not in a git repository"

**Solution:** Initialize git repository first

```bash
git init
git add -A
git commit -m "Initial commit"
```

---

## 📚 References

### Related Files

- `infra/backup/backup.sh` - Canonical backup script
- `Makefile` - Build and deployment commands
- `.gitignore` - Git ignore patterns
- `README.md` - Main project documentation

### Related Documentation

- `PROJE_SON_DURUM_ANALIZI.md` - Project analysis
- `scripts/README-staging-deploy.md` - Deployment guide
- `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` - Production deployment

---

## 🎓 Learning Points

### Why Consolidate Backup Scripts?

1. **Single Source of Truth** - One canonical backup system
2. **Consistent Behavior** - All backups work the same way
3. **Easier Maintenance** - Update one script, not four
4. **Reduced Complexity** - New developers don't wonder which script to run

### Why Remove Root Compose Files?

1. **Duplication** - Identical files in two locations
2. **Confusion** - Which one is the "correct" version?
3. **Maintenance** - Update both or they diverge
4. **Clarity** - `infra/compose/` is the canonical location

---

## 📞 Support

For questions or issues:

1. Review this documentation
2. Check the dry-run output
3. Review git history for context
4. Create an issue on GitHub

---

**Last Updated:** 13 Mart 2026  
**Version:** 1.0  
**Status:** ✅ Ready for execution