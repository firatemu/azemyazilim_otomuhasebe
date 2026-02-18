---
name: system-design
description: A procedural checklist for designing scalable, available, and performant systems. Based on the System Design Primer.
---

# System Design

## Overview
Learn how to design large-scale systems. This skill provides a step-by-step approach to system design, covering use cases, high-level design, core components, and scaling.

## The Approach

### Step 1: Outline use cases, constraints, and assumptions
Gather requirements and scope the problem. Ask questions to clarify:
- **Use cases**: Who is going to use it? How are they going to use it?
- **Constraints**: How many users? How many requests per second? What is the read/write ratio? How much data is expected?
- **Assumptions**: What can we assume about the system's behavior?

### Step 2: Create a high-level design
Outline all critical components:
- **Clients**: Mobile, Web, etc.
- **DNS**: Domain Name Resolution.
- **CDN**: Content Delivery Network for static assets.
- **Load Balancer**: Distribute traffic.
- **Web/App Tier**: Handle requests.
- **Database**: Store data.
- **Cache**: Improve performance.

### Step 3: Design core components
Dive into details for each component:
- **Data model**: Define schema and relationships.
- **API design**: Define endpoints and request/response formats.
- **Service discovery**: How services find each other.

### Step 4: Scale the design
Identify and address bottlenecks:
- **Load balancing**: Layer 4 vs Layer 7.
- **Horizontal scaling**: Add more machines.
- **Database scaling**: Replication, Sharding, Partitioning.
- **Caching**: Client-side, CDN, Web server, Database, Application.
- **Asynchronism**: Message queues, Task queues.
- **Microservices**: Decompose the monolith.

## Key Topics & Patterns

### Scalability vs Performance
- **Scalability**: Handle more work by adding resources.
- **Performance**: Handle work faster.

### Latency vs Throughput
- **Latency**: Time to perform some action or produce some result.
- **Throughput**: Number of such actions or results per unit of time.

### Availability vs Consistency (CAP Theorem)
- **Consistency**: Every read receives the most recent write or an error.
- **Availability**: Every request receives a (non-error) response.
- **Partition Tolerance**: The system continues to operate despite an arbitrary number of messages being dropped by the network.

### Consistency Patterns
- **Weak consistency**: After a write, reads may or may not see it.
- **Eventual consistency**: After a write, reads will eventually see it.
- **Strong consistency**: After a write, reads will see it.

### Availability Patterns
- **Fail-over**: Active-passive or Active-active.
- **Replication**: Master-slave or Master-master.

## Red Flags - STOP
- Designing without understanding use cases/constraints.
- Over-engineering simple systems.
- Ignoring single points of failure.
- Not considering data consistency requirements.
- Ignoring network latency.
