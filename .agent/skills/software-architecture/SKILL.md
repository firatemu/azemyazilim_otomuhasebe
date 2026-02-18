---
name: software-architecture
description: Guide for quality focused software architecture. This skill should be used when users want to write code, design architecture, analyze code, in any case that relates to software development. 
---

# Software Architecture Development Skill

This skill provides guidance for quality focused software development and architecture. It is based on Clean Architecture and Domain Driven Design principles.

## Code Style Rules

### General Principles
- **Early return pattern**: Always use early returns when possible.
- Avoid code duplication.
- Decompose long components and functions.

### Best Practices

#### Library-First Approach
- **ALWAYS search for existing solutions before writing custom code**
- Use libraries instead of writing your own utils or helpers.

#### Architecture and Design
- **Clean Architecture & DDD Principles:**
  - Follow domain-driven design and ubiquitous language
  - Separate domain entities from infrastructure concerns
  - Keep business logic independent of frameworks
- **Naming Conventions:**
  - **AVOID** generic names: `utils`, `helpers`, `common`, `shared`
  - **USE** domain-specific names: `OrderCalculator`, `UserAuthenticator`

#### Anti-Patterns to Avoid
- **NIH (Not Invented Here) Syndrome**
- **Poor Architectural Choices** (Mixing logic with UI, direct DB calls in controllers)
- **Generic Naming Anti-Patterns**

## Code Quality
- Proper error handling with typed catch blocks
- Break down complex logic into smaller, reusable functions
- Avoid deep nesting (max 3 levels)
- Keep functions focused and under 50 lines when possible
- Keep files focused and under 200 lines of code when possible
