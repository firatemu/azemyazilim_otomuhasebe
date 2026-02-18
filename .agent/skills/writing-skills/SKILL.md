---
name: writing-skills
description: Use when creating new skills to ensure they follow best practices and follow the TDD cycle for skill development.
---

# Writing Skills

## Directory Structure
```
skills/
  skill-name/
    SKILL.md              # Main reference (required)
    supporting-file.*     # Only if needed
```

## SKILL.md Structure
- **Frontmatter (YAML)**: `name` and `description` (Use when...).
- **Overview**: Core principle.
- **When to Use**: Symptoms and use cases.
- **Core Pattern**: Before/after examples.
- **Common Mistakes**: What to avoid.

## Skill TDD (RED-GREEN-REFACTOR)
1. **RED**: Write a failing test for the skill (baseline).
2. **GREEN**: Write the minimal skill content.
3. **REFACTOR**: Close loopholes, add red flags, optimize for discovery (CSO).

## Claude Search Optimization (CSO)
- Rich description field (symptoms-focused).
- Keyword coverage.
- Descriptive naming.
- Token efficiency.
