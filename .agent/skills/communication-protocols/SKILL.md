---
name: communication-protocols
description: Use when choosing or designing communication between services (REST, RPC, HTTP). Based on System Design Primer.
---

# Communication Protocols

## REST (Representational State Transfer)
- **Principles**: Stateless, Client-Server, Cacheable.
- **Verbs**: GET, POST, PUT, DELETE, PATCH.
- **Cons**: Overhead of HTTP, discovery, payload size.

## RPC (Remote Procedure Call)
- **Tools**: gRPC (Protobuf), Thrift.
- **Pros**: Type safety, binary protocol (small payload), fast.
- **Cons**: Tight coupling, debugging difficulty.

## Protocol Comparison
- **HTTP**: Standard, browser-friendly, text-based.
- **TCP**: Full duplex, reliable, segment-based. Use for database/app server communication.
- **UDP**: Fast, unreliable, datagram-based. Use for Streaming, VoIP, Gaming.

## Decision Tree
- Need browser support? Use REST.
- Internal Microservices? Use gRPC.
- Real-time / High-speed? Use UDP or WebSockets.
