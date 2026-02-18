---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code. Creates bite-sized tasks for execution.
---

# Writing Plans

## Overview
Write comprehensive implementation plans. Document everything: files to touch, code, testing, commands. Give the whole plan as bite-sized tasks.

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

## Plan Document Header
Every plan MUST start with this:
```markdown
# [Feature Name] Implementation Plan
> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
**Goal:** [Summary]
**Architecture:** [Approach]
---
```

## Bite-Sized Task Granularity
Each step is one action (2-5 minutes):
- "Write the failing test"
- "Run it to make sure it fails"
- "Implement minimal code"
- "Run tests and make sure they pass"
- "Commit"

## Task Structure
Include:
- **Files**: Create/Modify/Test paths.
- **Steps**: Exact code snippets and commands with expected output.
- **Commits**: Specific commit messages.

## Execution Handoff
After saving, offer choice:
1. **Subagent-Driven** (same session) — Uses `subagent-driven-development`.
2. **Parallel Session** (separate) — Uses `executing-plans`.
