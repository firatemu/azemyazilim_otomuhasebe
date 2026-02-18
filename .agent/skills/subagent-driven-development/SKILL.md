---
name: subagent-driven-development
description: Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.
---

# Subagent-Driven Development

## Overview
Execute plan by dispatching fresh subagent per task.
**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration.

## The Process
1. **Read plan**: Extract all tasks, create TodoWrite.
2. **Dispatch Implementer**: Give subagent the specific task + context.
3. **Wait for Implementer**: They implement, test, commit, self-review.
4. **Dispatch Spec Reviewer**: Confirms code matches spec. If not, implementer fixes.
5. **Dispatch Quality Reviewer**: Approves code quality. If not, implementer fixes.
6. **Next Task**: Repeat until all complete.
7. **Final Review**: Dispatch final code reviewer for entire implementation.

## Advantages
- Fresh context per task (no context pollution).
- Subagents follow TDD naturally.
- Continuous progress with automatic checkpoints.

## Red Flags
- Skipping reviews (spec OR quality).
- Proceeding with unfixed issues.
- Starting on main/master without consent.
- Making subagent read plan file (provide full task text instead).
- Ignoring subagent questions.

**If subagent fails task:** Dispatch fix subagent, don't try to fix manually.
