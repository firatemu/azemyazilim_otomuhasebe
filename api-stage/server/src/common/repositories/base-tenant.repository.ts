import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContextService } from '../services/tenant-context.service';
import { Prisma } from '@prisma/client';

@Injectable()
export abstract class BaseTenantRepository<T> {
  constructor(
    protected prisma: PrismaService,
    protected tenantContext: TenantContextService,
  ) {}

  /**
   * Tenant filtresini döndürür
   */
  protected getTenantFilter(): { tenantId: string } | {} {
    const tenantId = this.tenantContext.getTenantId();
    return tenantId ? { tenantId } : {};
  }

  /**
   * Tenant filtresi ile findMany
   */
  protected async findMany(args?: any): Promise<T[]> {
    const tenantFilter = this.getTenantFilter();
    return (this.getModel() as any).findMany({
      ...args,
      where: {
        ...args?.where,
        ...tenantFilter,
      },
    });
  }

  /**
   * Tenant filtresi ile findUnique
   */
  protected async findUnique(
    where: any,
    args?: any,
  ): Promise<T | null> {
    const tenantFilter = this.getTenantFilter();
    return (this.getModel() as any).findFirst({
      ...args,
      where: {
        ...where,
        ...tenantFilter,
      },
    });
  }

  /**
   * Tenant filtresi ile create
   */
  protected async create(data: any): Promise<T> {
    const tenantId = this.tenantContext.getTenantId();
    return (this.getModel() as any).create({
      data: {
        ...data,
        ...(tenantId && { tenantId }),
      },
    });
  }

  /**
   * Tenant filtresi ile update
   */
  protected async update(where: any, data: any): Promise<T> {
    const tenantFilter = this.getTenantFilter();
    return (this.getModel() as any).update({
      where: {
        ...where,
        ...tenantFilter,
      },
      data,
    });
  }

  /**
   * Tenant filtresi ile delete
   */
  protected async delete(where: any): Promise<T> {
    const tenantFilter = this.getTenantFilter();
    return (this.getModel() as any).delete({
      where: {
        ...where,
        ...tenantFilter,
      },
    });
  }

  /**
   * Model adını döndürür (alt sınıflarda implement edilmeli)
   */
  protected abstract getModel(): any;
}

