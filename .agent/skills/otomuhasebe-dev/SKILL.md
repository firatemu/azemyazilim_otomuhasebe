# OTOMUHASEBE -- AGGRESSIVE ENFORCED DEVELOPMENT PROTOCOL (ANTIGRAVITY VERSION)

Version: 2026.1 -- Strict Autonomous Agent Governance Layer

This document is an aggressively enforced development protocol designed
for AI agents (Antigravity) working on the Otomuhasebe multi-tenant SaaS
ERP system.

============================================================ CORE
PRINCIPLE: ZERO TOLERANCE FOR ARCHITECTURAL VIOLATION
============================================================

If any rule below is violated, the implementation MUST be rejected and
regenerated.

  ---------------------------------------------
  1\. NON-NEGOTIABLE MULTI-TENANT ENFORCEMENT
  ---------------------------------------------

MANDATORY:

-   Every Prisma query MUST include tenantId filter.
-   Every controller MUST use @CurrentTenant().
-   Every new model MUST contain tenantId.
-   Every relation MUST preserve tenant isolation.
-   Every endpoint MUST be tenant-safe.

FORBIDDEN:

-   Global queries without tenantId.
-   Cross-tenant joins.
-   Shared cache keys without tenant prefix.
-   Hardcoded tenant logic.

Required pattern:

where: { tenantId }

Cache pattern:

cacheKey = `tenant:${tenantId}:resource:${id}`

  ----------------------------------------------
  2\. BACKEND STRICT RULESET (NestJS + Prisma)
  ----------------------------------------------

REQUIRED:

-   DTO validation via class-validator only.
-   Global ValidationPipe enabled.
-   Centralized exception filter.
-   Structured logging (tenantId included).
-   Soft delete support where business critical.
-   Audit log for financial mutations.

PERFORMANCE:

-   Index on tenantId in ALL tables.
-   Composite indexes where required.
-   No N+1 queries.
-   Pagination required on list endpoints.

  ------------------------------------------------
  3\. FRONTEND STRICT RULESET (Next.js + MUI v7)
  ------------------------------------------------

UI FRAMEWORK:

-   Material UI v7 only.
-   Grid v2 syntax only.
-   Tailwind strictly forbidden.
-   sx prop preferred.

FORM RULES:

-   react-hook-form mandatory.
-   Zod mandatory.
-   Proper error display required.

DATA LAYER:

-   TanStack Query required.
-   Query keys must include tenant context when relevant.
-   Optimistic updates where applicable.

  ------------------------------------------------------
  4\. ENTERPRISE HARDENING LAYER (MANDATORY FOR SCALE)
  ------------------------------------------------------

Every enterprise-grade module MUST support:

-   Audit log
-   Soft delete
-   Role-based granular permission
-   Approval workflow (if financial impact exists)
-   Activity history timeline
-   Rate limiting
-   Input validation
-   Proper error boundaries

  -----------------------------------
  5\. SAAS MONETIZATION ENFORCEMENT
  -----------------------------------

Every feature proposal MUST evaluate:

-   Can it be Premium?
-   Can it be usage-limited?
-   Can API access be monetized?
-   Can AI-powered tier exist?

Feature scoring required:

Technical Difficulty: 1--5 Revenue Potential: 1--5 User Value: 1--5
Priority = (Revenue + User Value) -- Difficulty

  --------------------------------------------------------
  6\. FEATURE ADVISE ENGINE -- MANDATORY ANALYSIS FORMAT
  --------------------------------------------------------

Every advisory response MUST follow:

📌 Current State 🚀 Proposed Features - Description - Type: Core /
Premium / AI / Enterprise - Technical Difficulty - Revenue Potential -
User Value - Priority Level

  ----------------------------------
  7\. MCP PRE-ANALYSIS REQUIREMENT
  ----------------------------------

Before proposing structural change, agent SHOULD check:

-   Slow queries
-   Error-heavy modules
-   Cache misses
-   Tenant distribution
-   Endpoint performance

  --------------------------
  8\. REJECTION CONDITIONS
  --------------------------

Agent MUST regenerate solution if:

-   tenantId missing
-   Grid legacy props used
-   Tailwind suggested
-   No validation layer
-   No pagination in large datasets
-   No monetization evaluation
-   No enterprise hardening consideration

  ------------
  FINAL RULE
  ------------

If uncertain → choose stricter, safer, scalable solution.

This document overrides default behavior and enforces enterprise-grade
SaaS discipline.
