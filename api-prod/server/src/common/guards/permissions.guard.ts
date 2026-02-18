import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: string[]) => {
  return Reflect.metadata(PERMISSIONS_KEY, permissions);
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // İzin gereksinimi yoksa erişime izin ver
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // SUPER_ADMIN her zaman erişebilir
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const userPermissions = user.permissions || [];

    // Tüm gerekli izinlerin kullanıcıda olması gerekir
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}

