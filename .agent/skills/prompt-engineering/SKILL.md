---
name: prompt-engineering
description: Advanced prompt engineering techniques to maximize LLM performance, reliability, and controllability.
---

# Prompt Engineering Patterns

Advanced prompt engineering techniques.

## Core Capabilities

### 1. Few-Shot Learning
Teach the model by showing examples instead of explaining rules. Include 2-5 input-output pairs.

### 2. Chain-of-Thought Prompting
Request step-by-step reasoning before the final answer. Add "Let's think step by step".

### 3. Prompt Optimization
Systematically improve prompts through testing and refinement.

### 4. Template Systems
Build reusable prompt structures with variables and modular components.

### 5. System Prompt Design
Set global behavior and constraints that persist across the conversation.

## Key Patterns
- **Progressive Disclosure**: Start simple, add complexity only when needed.
- **Instruction Hierarchy**: [System Context] → [Task Instruction] → [Examples] → [Input Data] → [Output Format]
- **Error Recovery**: Build prompts that gracefully handle failures.

## Best Practices
1. **Be Specific**
2. **Show, Don't Tell**
3. **Test Extensively**
4. **Iterate Rapidly**

## Agent Prompting Best Practices (Anthropic)

### Concise is key
Only add context Claude doesn't already have. Challenge each piece of information.

### Set appropriate degrees of freedom
Match the level of specificity to the task's fragility and variability.
- **High freedom**: Multiple approaches are valid.
- **Low freedom**: Operations are fragile and error-prone.
