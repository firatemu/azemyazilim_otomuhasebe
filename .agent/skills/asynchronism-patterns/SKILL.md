---
name: asynchronism-patterns
description: Use when designing background processing, message queues, or task-based systems. Based on System Design Primer.
---

# Asynchronism Patterns

## Overview
Decouple time-consuming operations from the main request flow to improve responsiveness.

## Message Queues
- **Pattern**: Producer -> Queue -> Consumer.
- **Tools**: Redis (simple), RabbitMQ (AMQP), Amazon SQS (managed).
- **Workflow**: Publish job -> Notify status -> Process in background.

## Task Queues
- **Difference**: Handles scheduling and complex job states.
- **Tools**: Celery (Python), Bull/Sidekiq (Redis-based).

## Back Pressure
- **Problem**: Consumers overloaded, queue grows indefinitely.
- **Solutions**:
  - Limit queue size.
  - Return HTTP 530/503 (Server Busy).
  - Exponential backoff for retries.

## Trade-offs
- **Pros**: Scalability, decoupling, better UX.
- **Cons**: Complexity, eventual consistency, potential for data loss or duplicate processing.

## Use Cases
- Email delivery.
- Image/Video processing.
- Order fulfillment.
- Analytics ingestion.
