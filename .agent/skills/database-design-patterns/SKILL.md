---
name: database-design-patterns
description: Use when selecting or scaling databases (SQL vs NoSQL, Replication, Sharding). Based on System Design Primer.
---

# Database Design Patterns

## SQL vs NoSQL

### Relational (SQL)
- **ACID compliance**: Atomicity, Consistency, Isolation, Durability.
- **Scaling**: Mainly vertical (then replication/sharding).
- **Use Case**: Complex queries, strong consistency, structured data.

### Non-Relational (NoSQL)
- **BASE**: Basically Available, Soft state, Eventual consistency.
- **Scaling**: Horizontal by design.
- **Types**: Key-Value (Redis), Document (MongoDB), Wide-column (Cassandra), Graph (Neo4j).

## Scaling Techniques
1. **Replication**:
   - **Master-Slave**: Reads from slaves, writes to master.
   - **Master-Master**: Multiple nodes for writes (complex conflict resolution).
2. **Federation**: Split DB by function (e.g., users DB, products DB).
3. **Sharding**: Horizontal partitioning of data across multiple servers.
4. **Denormalization**: Improve read performance by adding redundant data.

## Availability vs Consistency (CAP)
- **CA**: Consistency + Availability (Single node).
- **CP**: Consistency + Partition Tolerance (Bank systems).
- **AP**: Availability + Partition Tolerance (Social media).

## Checklist
- Structure: Rigid schema (SQL) or Dynamic (NoSQL)?
- Consistency: Strong or Eventual?
- Growth: How will we scale from 1M to 100M rows?
