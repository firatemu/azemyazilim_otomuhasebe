// ============================================
// RLS Middleware Example for Prisma
// ============================================
// This middleware sets app.current_tenant_id for every Prisma query
// ensuring Row Level Security policies work correctly
// ============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Option 1: Prisma Middleware (Global)
// ============================================
// This runs before every Prisma query

prisma.$use(async (params, next) => {
  // Get tenant_id from context (set by your auth middleware)
  const tenantId = prisma._meta.tenantId;
  
  if (tenantId) {
    // Set PostgreSQL session variable for RLS
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
  }
  
  return next(params);
});

// ============================================
// Option 2: Express/NestJS Middleware
// ============================================
// Set tenant context on request level

import { Request, Response, NextFunction } from 'express';

export function tenantContextMiddleware(req: Request, res: Response, next: NextFunction) {
  // Extract tenant from JWT token or session
  const user = req.user; // Set by your auth middleware
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // SUPER_ADMIN and SUPPORT don't need tenant context
  if (['SUPER_ADMIN', 'SUPPORT'].includes(user.role)) {
    prisma._meta.tenantId = null; // Clear tenant context
  } else {
    // Set tenant context for regular users
    prisma._meta.tenantId = user.tenantId;
  }
  
  next();
}

// ============================================
// Option 3: NestJS Interceptor
// ============================================
// For NestJS applications

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (user && !['SUPER_ADMIN', 'SUPPORT'].includes(user.role)) {
      // Set tenant context for Prisma queries
      prisma._meta.tenantId = user.tenantId;
    } else {
      prisma._meta.tenantId = null;
    }
    
    return next.handle();
  }
}

// ============================================
// Option 4: Per-Query Tenant Context
// ============================================
// Manual tenant context for specific queries

async function queryWithTenant<T>(tenantId: string, callback: () => Promise<T>): Promise<T> {
  // Set tenant context
  prisma._meta.tenantId = tenantId;
  
  try {
    // Execute query with tenant context
    return await callback();
  } finally {
    // Clear tenant context
    prisma._meta.tenantId = null;
  }
}

// ============================================
// Usage Examples
// ============================================

// Example 1: Using middleware automatically
async function getInvoices() {
  // Tenant context is set automatically by middleware
  const invoices = await prisma.invoice.findMany();
  return invoices;
}

// Example 2: Manual tenant context
async function getTenantInvoices(tenantId: string) {
  return await queryWithTenant(tenantId, () => {
    return prisma.invoice.findMany();
  });
}

// Example 3: SUPER_ADMIN queries all tenants
async function getAllUsers() {
  // SUPER_ADMIN sees all users (no tenant filter)
  const users = await prisma.user.findMany();
  return users;
}

// Example 4: SUPER_ADMIN queries specific tenant
async function getTenantUsers(tenantId: string) {
  return await queryWithTenant(tenantId, () => {
    return prisma.user.findMany();
  });
}

// ============================================
// Connection Pool Considerations
// ============================================
// SET LOCAL is session-scoped, connection pool safe

// Each Prisma query transaction gets its own connection
// SET LOCAL affects only the current transaction/session
// Connection pooling works correctly with SET LOCAL

// ============================================
// Error Handling
// ============================================

prisma.$use(async (params, next) => {
  try {
    const tenantId = prisma._meta.tenantId;
    
    if (tenantId) {
      await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
    }
    
    return await next(params);
  } catch (error) {
    console.error('RLS Middleware Error:', error);
    throw error;
  }
});

// ============================================
// Testing RLS
// ============================================

async function testRLS() {
  // Test 1: Regular user sees only their tenant's data
  const regularUser = { tenantId: 'tenant-1-id', role: 'USER' };
  prisma._meta.tenantId = regularUser.tenantId;
  
  const tenant1Invoices = await prisma.invoice.findMany();
  console.log('Regular user sees', tenant1Invoices.length, 'invoices');
  
  // Test 2: SUPER_ADMIN sees all data
  const superAdmin = { role: 'SUPER_ADMIN' };
  prisma._meta.tenantId = null;
  
  const allInvoices = await prisma.invoice.findMany();
  console.log('SUPER_ADMIN sees', allInvoices.length, 'invoices');
  
  // Test 3: SUPER_ADMIN queries specific tenant
  const tenant2Invoices = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = 'tenant-2-id'`);
    return await tx.invoice.findMany();
  });
  
  console.log('SUPER_ADMIN sees', tenant2Invoices.length, 'invoices for tenant-2');
}

// ============================================
// Export for use in application
// ============================================

export { prisma, tenantContextMiddleware, TenantContextInterceptor, queryWithTenant };