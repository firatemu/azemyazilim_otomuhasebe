import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ClsService } from './cls.service';

@Injectable()
export class TenantContextService {
  private readonly logger = new Logger(TenantContextService.name);

  /**
   * Validates if the current execution context has a valid tenant or system privilege.
   * Creates a 'Fail-Fast' mechanism.
   */
  validateContext(): void {
    if (this.isSystem()) return;
    if (this.isSuperAdmin()) return;

    const tenantId = this.getTenantId();
    if (!tenantId) {
      this.logger.error('Security Alert: Tenant context missing in protected operation.');
      throw new BadRequestException('Tenant context missing. Operation aborted.');
    }
  }

  getTenantId(): string | undefined {
    return ClsService.getTenantId();
  }

  getUserId(): string | undefined {
    return ClsService.get('userId');
  }

  setTenant(tenantId: string, userId: string) {
    if (!tenantId) throw new Error('Cannot set empty tenantId');
    ClsService.setTenantId(tenantId);
    ClsService.set('userId', userId);
  }

  setUserRole(role: string) {
    ClsService.set('userRole', role);
  }

  isSuperAdmin(): boolean {
    const role = ClsService.get('userRole');
    return role === 'SUPER_ADMIN' || role === 'SuperAdmin' || role === 'super_admin' || role === 'SUPERADMIN';
  }

  isSystem(): boolean {
    return ClsService.get('isSystem') === true;
  }

  /**
   * Run a callback with system privileges (bypassing tenant checks)
   * Use with CAUTION.
   * usage: await this.tenantContext.runAsSystem(async () => { ... });
   */
  async runAsSystem<T>(callback: () => Promise<T>): Promise<T> {
    return ClsService.run(async () => {
      ClsService.set('isSystem', true);
      return callback();
    });
  }

  /**
   * Run a callback within a specific tenant context
   * Useful for background jobs (BullMQ) where HTTP request context is missing.
   * usage: await this.tenantContext.runWithTenantContext(tenantId, userId, async () => { ... });
   */
  async runWithTenantContext<T>(
    tenantId: string,
    userId: string | undefined,
    callback: () => Promise<T>,
  ): Promise<T> {
    if (!tenantId) throw new Error('Tenant ID required for context hydration');

    return ClsService.run(async () => {
      ClsService.setTenantId(tenantId);
      if (userId) ClsService.set('userId', userId);
      return callback();
    });
  }
}
