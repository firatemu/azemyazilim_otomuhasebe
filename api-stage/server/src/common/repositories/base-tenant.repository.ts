import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContextService } from '../services/tenant-context.service';
import { Prisma } from '@prisma/client';

/**
 * BaseTenantRepository - RLS Entegreli
 * 
 * NOT: Bu repository artık manuel tenant filtering yapmıyor.
 * RLS (Row Level Security) database-level tenant isolation sağlıyor.
 * prisma.extended kullanıldığında, PostgreSQL otomatik olarak tenant'a göre filtreler.
 * 
 * Migration: Bu repository'yi inherit eden service'lerin query'leri
 * otomatik olarak RLS ile çalışacaktır.
 */
@Injectable()
export abstract class BaseTenantRepository<T> {
  private readonly logger = new Logger(BaseTenantRepository.name);

  constructor(
    protected prisma: PrismaService,
    protected tenantContext: TenantContextService,
  ) {}

  /**
   * Model adını döndürür (alt sınıflarda implement edilmeli)
   */
  protected abstract getModel(): any;

  /**
   * Prisma extended client'yi döndürür (RLS aktif)
   */
  protected getExtendedPrisma() {
    return this.prisma.extended;
  }

  /**
   * Tenant filtresi ile findMany
   * 
   * NOT: Manuel tenant filtering devre dışı bırakıldı.
   * RLS otomatik olarak tenant'a göre filtreler (prisma.extended aracılığıyla).
   */
  protected async findMany(args?: any): Promise<T[]> {
    const model = this.getModel();
    return (this.getExtendedPrisma() as any)[model].findMany(args);
  }

  /**
   * Tenant filtresi ile findUnique
   * 
   * NOT: RLS otomatik olarak tenant'a göre filtreler.
   */
  protected async findUnique(
    where: any,
    args?: any,
  ): Promise<T | null> {
    const model = this.getModel();
    return (this.getExtendedPrisma() as any)[model].findFirst({
      ...args,
      where,
    });
  }

  /**
   * Tenant filtresi ile create
   * 
   * NOT: RLS otomatik olarak tenantId'yi inject eder.
   */
  protected async create(data: any): Promise<T> {
    const model = this.getModel();
    return (this.getExtendedPrisma() as any)[model].create({ data });
  }

  /**
   * Tenant filtresi ile update
   * 
   * NOT: RLS otomatik olarak tenant'a göre filtreler.
   */
  protected async update(where: any, data: any): Promise<T> {
    const model = this.getModel();
    return (this.getExtendedPrisma() as any)[model].update({ where, data });
  }

  /**
   * Tenant filtresi ile delete
   * 
   * NOT: RLS otomatik olarak tenant'a göre filtreler.
   */
  protected async delete(where: any): Promise<T> {
    const model = this.getModel();
    return (this.getExtendedPrisma() as any)[model].delete({ where });
  }

  /**
   * Tenant filtresi ile count
   */
  protected async count(args?: any): Promise<number> {
    const model = this.getModel();
    return (this.getExtendedPrisma() as any)[model].count(args);
  }

  /**
   * Transaction ile bulk operation
   */
  protected async transaction<R>(callback: (tx: any) => Promise<R>): Promise<R> {
    return this.getExtendedPrisma().$transaction(callback);
  }
}

