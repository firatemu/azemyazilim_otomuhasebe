---
name: dispatching-parallel-agents
description: Use when you have multiple unrelated failures or tasks that can be investigated or implemented concurrently.
---

# Dispatching Parallel Agents

When you have multiple unrelated tasks or failures, investigating them sequentially wastes time.

**Core principle:** Dispatch one agent per independent problem domain. Let them work concurrently.

## When to Use
- 3+ test files failing with different root causes.
- Multiple subsystems broken independently.
- Each problem can be understood without context from others.
- No shared state between investigations.

### The Pattern
1. **Identify Independent Domains**: Group tasks/failures by domain.
2. **Create Focused Agent Tasks**: One agent per domain with specific scope and goal.
3. **Dispatch in Parallel**: Invoke tasks concurrently.
4. **Review and Integrate**: Verify fixes don't conflict, run full test suite.

## Red Flags
- Failures are related (fixing one might fix others).
- Need to understand full system state.
- Agents would interfere with each other.
