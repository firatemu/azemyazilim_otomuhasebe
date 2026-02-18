---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints.
---

# Executing Plans

## Overview
Load plan, review critically, execute tasks in batches (default: first 3), report for review between batches.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

## The Process
1. **Load and Review Plan**: Read plan, identify concerns, create TodoWrite.
2. **Execute Batch**: Default first 3 tasks. Follow plan steps exactly. Run verifications.
3. **Report**: Show implementation and verification output. Wait for feedback.
4. **Continue**: Repeat until complete.
5. **Complete**: Invoke `finishing-a-development-branch`.

## When to Stop
- Hit a blocker mid-batch.
- Plan has critical gaps.
- Verification fails repeatedly.
**Ask for clarification rather than guessing.**

## Remember
- Review plan critically first.
- Don't skip verifications.
- Never start implementation on main/master without explicit user consent.
