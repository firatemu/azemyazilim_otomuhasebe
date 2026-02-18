---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work.
---

# Finishing a Development Branch

**Core principle:** Verify tests -> Present options -> Execute choice -> Clean up.

## The Process
1. **Verify Tests**: Run project's test suite. Stop if tests fail.
2. **Determine Base Branch**: Default to `main` or `master`.
3. **Present Options**:
   1. Merge locally.
   2. Push and create PR.
   3. Keep branch as-is.
   4. Discard work.
4. **Execute Choice**: Perform git operations based on choice.
5. **Cleanup Worktree**: Remove worktree if applicable.

## Red Flags
- Proceeding with failing tests.
- Merging without verification.
- Delete work without confirmation ("discard" confirmation required).
