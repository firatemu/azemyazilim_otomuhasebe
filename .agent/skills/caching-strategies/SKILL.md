---
name: caching-strategies
description: Use when designing or optimizing caching layers (Client, CDN, Server, DB, Application). Based on System Design Primer.
---

# Caching Strategies

## Overview
Optimize performance and reduce load by serving data from memory.

## Types of Caching
- **Client**: Browser, OS.
- **CDN**: Static assets and edge content.
- **Web Server**: Reverse proxies (Varnish), static content.
- **Database**: Buffer pool, query cache.
- **Application**: Redis, Memcached (Key-value stores).

## Cache Update Strategies
1. **Cache-aside (Lazy Loading)**:
   - Application checks cache; on miss, loads from DB and updates cache.
   - **Pros**: Only requested data is cached.
   - **Cons**: Cache miss penalty, data staleness risk (fixed with TTL).
2. **Write-through**:
   - Application writes to cache; cache writes to DB synchronously.
   - **Pros**: Data in cache is never stale.
   - **Cons**: High write latency.
3. **Write-behind (Write-back)**:
   - Application writes to cache; cache writes to DB asynchronously.
   - **Pros**: High write performance.
   - **Cons**: Potential data loss on cache failure.
4. **Refresh-ahead**:
   - Cache automatically refreshes items before expiration.

## Cache Invalidation
- **TTL (Time to Live)**: Automatic expiration.
- **LRU (Least Recently Used)**: Discard oldest data first.
- **FIFO (First In First Out)**.

## Decision Tree
- High Read/Low Write? Use Cache-aside + TTL.
- Zero Staleness Required? Use Write-through.
- High Write performance? Use Write-behind.
