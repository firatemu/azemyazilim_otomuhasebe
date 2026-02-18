---
name: object-oriented-design
description: Use when designing class hierarchies, object interactions, or application domain models. Based on System Design Primer.
---

# Object-Oriented Design (OOD)

## SOLID Principles
1. **Single Responsibility**: One class, one reason to change.
2. **Open/Closed**: Open for extension, closed for modification.
3. **Liskov Substitution**: Subtypes must be substitutable for base types.
4. **Interface Segregation**: Clients shouldn't depend on interfaces they don't use.
5. **Dependency Inversion**: Depend on abstractions, not concretions.

## Common Design Patterns
- **Creational**: Singleton, Factory, Builder, Prototype.
- **Structural**: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy.
- **Behavioral**: Command, Iterator, Mediator, Observer, State, Strategy, Visitor.

## OOD Process
1. **Identify Objects**: Nouns in the problem description.
2. **Define Relationships**: Is-a (Inheritance), Has-a (Composition), Uses-a (Association).
3. **Map Methods**: Verbs in the description.
4. **Apply Patterns**: Solve common structure problems.

## Checklist
- Is the inheritance hierarchy deep? (Favor composition).
- Are classes tightly coupled?
- Are we leaking internals? (Encapsulation).
