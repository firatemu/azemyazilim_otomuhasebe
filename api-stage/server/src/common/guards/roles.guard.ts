import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => {
  return Reflect.metadata(ROLES_KEY, roles);
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Rol gereksinimi yoksa erişime izin ver
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

    return requiredRoles.includes(user.role as UserRole);
  }
}

