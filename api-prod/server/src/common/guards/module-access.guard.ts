import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LicenseService } from '../services/license.service';
import { MODULE_KEY } from '../decorators/require-module.decorator';

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private licenseService: LicenseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const moduleSlug = this.reflector.get<string>(MODULE_KEY, context.getHandler());
    
    if (!moduleSlug) {
      // Modül gereksinimi yoksa geç
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Kullanıcı bilgisi bulunamadı');
    }

    // SUPER_ADMIN ve TENANT_ADMIN için modül kontrolü yapma
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'TENANT_ADMIN';
    if (isAdmin) {
      return true;
    }

    // Modül lisansı kontrolü
    const hasLicense = await this.licenseService.hasModuleLicense(user.userId, moduleSlug);
    
    if (!hasLicense) {
      throw new ForbiddenException(`Bu modüle erişim için lisans gereklidir: ${moduleSlug}`);
    }

    return true;
  }
}


