---
name: system-design-estimations
description: Use for back-of-the-envelope calculations, capacity planning, and latency estimations. Based on System Design Primer.
---

# System Design Estimations

## Overview
Perform quick calculations to estimate system capacity, bandwidth, and latency requirements.

## Latency Numbers Every Programmer Should Know
- **L1 cache reference**: 0.5 ns
- **Branch mispredict**: 5 ns
- **L2 cache reference**: 7 ns
- **Mutex lock/unlock**: 25 ns
- **Main memory reference**: 100 ns
- **Read 1 MB sequentially from memory**: 250,000 ns (250 us)
- **Round trip within same datacenter**: 500,000 ns (0.5 ms)
- **Read 1 MB sequentially from SSD**: 1,000,000 ns (1 ms)
- **Disk seek (HDD)**: 10,000,000 ns (10 ms)
- **Read 1 MB sequentially from HDD**: 30,000,000 ns (30 ms)
- **Send packet CA -> Netherlands -> CA**: 150 ms

## Handy Metrics
- **Read from HDD**: ~30 MB/s
- **Read from 1 Gbps Ethernet**: ~100 MB/s
- **Read from SSD**: ~1 GB/s
- **Read from Main Memory**: ~4 GB/s

## Powers of Two
- **2^10**: 1 Thousand (1 KB)
- **2^20**: 1 Million (1 MB)
- **2^30**: 1 Billion (1 GB)
- **2^40**: 1 Trillion (1 TB)

## Methodology
1. **Identify scale**: QPS (Queries Per Second), Data size, Concurrency.
2. **Back-of-the-envelope**: Estimate storage (Total data over retention period), Bandwidth (QPS * Average size), and RAM requirements.
3. **Verify Constraints**: Does the design fit within hardware limits?
