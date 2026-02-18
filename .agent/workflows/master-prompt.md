---
description: OTOMUHASEBE Master AI System Prompt - Core Rules & Architecture
---

# OTOMUHASEBE – MASTER AI SYSTEM PROMPT

(Multi-Tenant SaaS ERP | Antigravity / Agent Rules)

## 1️⃣ PROJECT IDENTITY (ALWAYS REMEMBER)

This project is called **Otomuhasebe**.

It is a **Multi-Tenant SaaS ERP system**.

### Core facts (always true):

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 15 (App Router) + Material UI v7
- **Cache**: Redis
- **Queue**: BullMQ
- **Infrastructure**: Docker Compose + Caddy
- **Environments**: Staging and Production are separate
- **Architecture**: Controller / Service / DTO / Guard / Middleware pattern

These facts must be treated as global assumptions in every interaction.

## 2️⃣ MULTI-TENANT ABSOLUTE SAFETY RULE (MOST CRITICAL)

### 🔴 GOLDEN RULE

Tenant isolation is **non-negotiable** in this project.

- All tenant-owned data **must be isolated** using `tenantId`
- Any database operation **without tenantId** is a **SECURITY VIOLATION**
- `tenantId` must be obtained from:
  - request context
  - authentication payload
  - tenant middleware
- **Hardcoded tenantId is strictly forbidden**

### 🔍 Mandatory scope decision

Before writing any code, always answer this question:

**"Is this data tenant-scoped or global-scoped?"**

#### Examples of global-scoped data:
- countries
- currencies
- subscription plans
- system permissions

#### Examples of tenant-scoped data:
- users
- invoices
- customers
- transactions

**No code is written before this decision is explicit.**

## 3️⃣ TECHNOLOGY STACK DISCIPLINE

### Backend rules

- Native Express usage is **not allowed**
- Use NestJS decorators and module structure
- DTO + class-validator is **mandatory**
- Flow must always be: **Controller → Service → Prisma**
- Heavy logic must **never** live inside controllers
- Long-running or expensive operations must be handled via **BullMQ jobs**

### Frontend rules

- Use **Next.js App Router only**
- State management: **TanStack Query only**
- Forms: **react-hook-form + Zod**
- Styling: **Material UI (sx or styled)**
- Redux or React Context API is **not allowed**

## 4️⃣ CACHE (REDIS) STRICT RULES

Redis usage must always be **tenant-aware**.

### Cache key naming convention:
```
tenant:{tenantId}:{resource}:{identifier}
```

### Cache design decisions (always required):

1. Does this cache need a TTL?
2. Where is cache invalidation triggered?
3. Is this read-through or write-through?

**Any cache key without tenantId is forbidden.**

## 5️⃣ QUEUE & ASYNC THINKING (BullMQ)

The following operations must **never be synchronous**:

- Email sending
- PDF / Excel generation
- Report generation
- Long-running integrations

### Job rules:

- Every job payload must include `tenantId`
- Retry and failure strategies must be considered
- Job logs must be analyzable on a tenant basis

## 6️⃣ ENVIRONMENT AWARENESS (STAGING / PRODUCTION)

Before any action, always evaluate:

- Is this running on **staging** or **production**?
- Does this require a **database migration**?
- Does Redis cache need **invalidation or flush**?
- Is **rollback** possible?

### In production:

- Risky migrations must be **explicitly warned**
- Rollback strategy must be mentioned
- Cache and queue side effects must be stated

## 7️⃣ MCP USAGE STRATEGY (TOOL AWARENESS)

Always select the correct MCP before writing code:

- **Database / Prisma** → `prisma-schema-mcp`
- **Query performance / slow queries** → `db-query-mcp`
- **Containers / services** → `docker-ops-mcp`
- **Tenant-related issues** → `tenant-context-mcp`
- **Frontend CRUD / forms** → `component-gen-mcp`
- **Cache operations** → `redis-cache-mcp`
- **Logs / errors** → `log-analyzer-mcp`
- **Deployment** → `deployment-mcp`

**Principle**: Analyze first, then implement.

## 8️⃣ STANDARD WORKFLOW – BACKEND FEATURE DEVELOPMENT

When a new backend feature is requested, follow this order:

1. Decide tenant scope (tenant vs global)
2. Analyze Prisma schema impact
3. Evaluate indexes and relations
4. Plan DTOs and validation rules
5. Decide cache strategy (if any)
6. Separate async tasks into queues
7. Verify RBAC and guards
8. **Only then proceed with implementation**

## 9️⃣ STANDARD WORKFLOW – FRONTEND PAGE DEVELOPMENT

Frontend development must follow:

1. Backend DTO ↔ Zod schema alignment
2. Tenant-aware React Query cache keys
3. Form validation must exactly match backend rules
4. Success and error handling via Notistack
5. Role-based UI visibility checks

## 🔟 ARCHITECTURAL CONSISTENCY GUARDIAN

The AI has a responsibility to:

- Avoid suggesting solutions that break existing patterns
- Check how similar problems were solved previously in this project
- Warn early about decisions that may cause technical debt
- Prefer long-term maintainability over short-term speed
