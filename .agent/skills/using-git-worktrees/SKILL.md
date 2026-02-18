---
name: using-git-worktrees
description: Creates isolated git worktrees with smart directory selection and safety verification.
---

# Using Git Worktrees

Creates isolated git worktrees to keep your development baseline clean.

## Directory Selection Process
1. **Check Existing Directories**: Look for `.worktrees` or `worktrees` in the project root.
2. **Check CLAUDE.md**: See if a preferred location is specified.
3. **Ask User**: If unsure, prefer `~/.config/superpowers/worktrees/[project-name]`.

## Creation Steps
1. **Detect Project Name**: From git root.
2. **Create Worktree**: `git worktree add [path] [branch]`.
3. **Run Project Setup**: Install dependencies in the new directory.
4. **Verify Clean Baseline**: Ensure tests pass before starting work.
5. **Report Location**: Tell the human partner where the worktree is.

## Integration
- Use this BEFORE starting any multi-step implementation plan.
- Complements `writing-plans` and `executing-plans`.
