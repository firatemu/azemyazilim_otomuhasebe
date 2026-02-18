---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements.
---

# Requesting Code Review

Dispatch `code-reviewer` subagent to catch issues before they cascade.

**Core principle:** Review early, review often.

## When to Request Review
- After each task in subagent-driven development (Mandatory).
- After completing major feature.
- Before merge to main.

## How to Request
1. **Get git SHAs**: BASE_SHA and HEAD_SHA.
2. **Dispatch code-reviewer subagent**: Use the template at `code-reviewer.md`.
3. **Act on feedback**: Fix Critical and Important issues before proceeding.

## Red Flags
- Skipping review because "it's simple".
- Ignoring Critical issues.
- Proceeding with unfixed Important issues.
