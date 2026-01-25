import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenantId?: string;
  private userId?: string;
  private userRole?: string;

  setTenant(tenantId: string, userId: string) {
    this.tenantId = tenantId;
    this.userId = userId;
  }

  setUserRole(role: string) {
    this.userRole = role;
  }

  getTenantId(): string | undefined {
    // SUPER_ADMIN için tenant kontrolünü atla
    const role = this.userRole?.toString() || this.userRole;
    if (role === 'SUPER_ADMIN' || role === 'SuperAdmin' || role === 'super_admin') {
      return undefined; // SUPER_ADMIN tenant kontrollerini atlayabilir
    }

    // Staging/development: Middleware tenant set ettiyse (header, user.tenantId, STAGING_DEFAULT)
    // onu döndür. Yoksa undefined (opsiyonel tenant).
    // Böylece Kasa vb. create işlemlerinde FK için gerçek tenant kullanılır; var olmayan
    // hardcoded default’a düşülmez.
    const isStaging = process.env.NODE_ENV === 'staging' ||
                      process.env.NODE_ENV === 'development' ||
                      (typeof process !== 'undefined' && process.env.STAGING_DISABLE_TENANT === 'true');

    if (isStaging) {
      return this.tenantId;
    }

    return this.tenantId;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  hasTenant(): boolean {
    // SUPER_ADMIN için tenant kontrolünü atla
    const role = this.userRole?.toString() || this.userRole;
    if (role === 'SUPER_ADMIN' || role === 'SuperAdmin' || role === 'super_admin') {
      return true; // SUPER_ADMIN tenant olmadan da çalışabilir
    }

    // STAGING ORTAMI İÇİN: Tenant ID gereksiz (her zaman true döndür)
    const isStaging = process.env.NODE_ENV === 'staging' ||
                      process.env.NODE_ENV === 'development' ||
                      process.env.STAGING_DISABLE_TENANT === 'true';
    if (isStaging) {
      return true; // Staging'de tenant ID gereksiz
    }

    return !!this.tenantId;
  }

  isSuperAdmin(): boolean {
    const role = this.userRole?.toString() || this.userRole;
    return role === 'SUPER_ADMIN' || role === 'SuperAdmin' || role === 'super_admin' || role === 'SUPERADMIN';
  }
}
