---
name: changelog-generator
description: Automatically creates user-facing changelogs from git commits by analyzing commit history and transforming technical commits into clear release notes.
---

# Changelog Generator

Transform technical git commits into polished, user-friendly changelogs.

## When to Use
- Preparing release notes for new versions.
- Weekly/monthly product updates.
- Customer-facing documentation.

## Process
1. **Scan Git History**: Analyze commits since last tag/date.
2. **Categorize**: Group into Features, Improvements, Fixes, Breaking Changes.
3. **Translate**: Convert "chore: refactor internal api" to "Improved internal performance".
4. **Format**: Create clean Markdown output.

## Tips
- Run from repository root.
- Use `git log --oneline` or `git log --pretty=format` to gather input.
- Filter out noise (tests, minor refactors).
