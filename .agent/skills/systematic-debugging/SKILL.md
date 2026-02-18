---
name: systematic-debugging
description: Use for ANY technical issue (test failures, bugs, unexpected behavior) - requires finding root cause before attempting fixes; NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.
---

# Systematic Debugging

## Overview
Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law
```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## The Four Phases

### Phase 1: Root Cause Investigation
**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Read stack traces completely. Note line numbers, file paths, error codes.
2. **Reproduce Consistently**
   - Can you trigger it reliably? What are the exact steps?
3. **Check Recent Changes**
   - What changed recently? Git diff, recent commits, new dependencies.
4. **Gather Evidence in Multi-Component Systems**
   - Add diagnostic instrumentation at each component boundary (log inputs, outputs, config).
5. **Trace Data Flow**
   - Trace bad values back to their source. Fix at source, not at symptom.

### Phase 2: Pattern Analysis
**Find the pattern before fixing:**

1. **Find Working Examples**
   - Locate similar working code.
2. **Compare Against References**
   - Read reference implementations COMPLETELY. Don't skim.
3. **Identify Differences**
   - List every difference, however small. Don't assume "that can't matter".

### Phase 3: Hypothesis and Testing
**Scientific method:**

1. **Form Single Hypothesis**
   - "I think X is the root cause because Y".
2. **Test Minimally**
   - Make the SMALLEST possible change to test your hypothesis. One variable at a time.
3. **Verify Before Continuing**
   - If it didn't work, form a NEW hypothesis. DON'T add more fixes on top.

### Phase 4: Implementation
**Fix the root cause, not the symptom:**

1. **Create Failing Test Case**
   - Simplest possible reproduction. MUST have before fixing.
   - Use `superpowers:test-driven-development`.
2. **Implement Single Fix**
   - Address the root cause identified. ONE change at a time.
3. **Verify Fix**
   - Test passes? No regressions? Issue resolved?
4. **If 3+ Fixes Failed: Question Architecture**
   - STOP and question if the architecture/pattern is fundamentally sound. Discuss with your human partner.

## Red Flags - STOP
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "I don't fully understand but this might work"
- **"One more fix attempt" (when already tried 2+)**
- Proposing solutions before tracing data flow
