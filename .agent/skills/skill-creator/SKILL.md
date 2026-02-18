---
name: skill-creator
description: Meta-skill providing guidance for creating effective skills that extend capabilities with specialized knowledge, workflows, and tool integrations.
---

# Skill Creator

This skill provides guidance for creating effective skills.

## Anatomy of a Skill
Every skill consists of a required SKILL.md file and optional bundled resources:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code
    ├── references/       - Documentation
    └── assets/           - Files used in output
```

## Skill Creation Process

### Step 1: Understanding the Skill with Concrete Examples
Understand how the skill will be used. Ask relevant questions.

### Step 2: Planning the Reusable Skill Contents
Identify scripts, references, and assets that would be helpful.

### Step 3: Initializing the Skill
Create the directory and SKILL.md.

### Step 4: Edit the Skill
Include procedural knowledge, domain-specific details, or reusable assets. Use imperative form.

### Step 5: Packaging a Skill
Package into a distributable zip file.

### Step 6: Iterate
Improve based on real tasks and fresh context.
