import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { TenantContextService } from '../services/tenant-context.service';
import { JwtPayload } from '../../modules/auth/strategies/jwt.strategy';
import { ClsService } from '../services/cls.service';

// Request interface'i genişlet
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      userId?: string;
      jwtPayload?: JwtPayload & { user?: any };
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  // Cache for staging default tenant ID
  private cachedStagingDefaultTenantId: string | null | undefined = undefined;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) { }

  /**
   * Staging default tenant ID'yi veritabanından al (cache'li)
   */
  private async getStagingDefaultTenantId(): Promise<string | null> {
    // Cache kontrolü
    if (this.cachedStagingDefaultTenantId !== undefined) {
      return this.cachedStagingDefaultTenantId;
    }

    try {
      // Veritabanından oku
      const parameter = await this.prisma.systemParameter.findFirst({
        where: {
          key: 'STAGING_DEFAULT_TENANT_ID',
          tenantId: null, // Global parametre
        },
      });

      if (parameter && typeof parameter.value === 'string') {
        this.cachedStagingDefaultTenantId = parameter.value;
        return parameter.value;
      }
    } catch (error) {
      // Hata durumunda fallback kullan
      console.warn('[TenantMiddleware] SystemParameter okuma hatası, fallback kullanılıyor:', error);
    }

    // Fallback: .env dosyasından oku
    const fallbackId = process.env.STAGING_DEFAULT_TENANT_ID || 'cmi5of04z0000ksb3g5eyu6ts';
    this.cachedStagingDefaultTenantId = fallbackId || null;
    return this.cachedStagingDefaultTenantId;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Giriş işlemi için tenant ID set etme (global kullanıcılar için)
    // req.path sadece '/' döndürüyor, originalUrl kullanmalıyız
    if (req.originalUrl === '/api/auth/login' || req.originalUrl === '/api/auth/register') {
      return next();
    }

    // CLS context başlat ve middleware mantığını içine al
    ClsService.run(async () => {
      try {
        await this.handleRequest(req);

        // Tenant ID'yi CLS'e kaydet
        if (req.tenantId) {
          ClsService.setTenantId(req.tenantId);
        }

        next();
      } catch (error) {
        console.error('[TenantMiddleware] Error:', error);
        next(error);
      }
    });
  }

  private async handleRequest(req: Request) {
    // 1. Header'dan Tenant ID oku
    let tenantIdFromHeader = req.headers['x-tenant-id'] as string;
    if (!tenantIdFromHeader) {
      tenantIdFromHeader = (req.headers as any)['X-Tenant-Id'] as string ||
        req.headers['tenant-id'] as string ||
        (req.headers as any)['Tenant-Id'] as string;
    }

    const nodeEnv = process.env.NODE_ENV;
    const isStaging = nodeEnv === 'staging' ||
      nodeEnv === 'development' ||
      process.env.STAGING_DISABLE_TENANT === 'true';
    const stagingDefaultTenantId = await this.getStagingDefaultTenantId();

    // 2. Authorization header'dan token'ı çıkar
    const authHeader = req.headers.authorization;
    let jwtPayload: JwtPayload | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        jwtPayload = this.jwtService.verify<JwtPayload>(token, {
          secret: process.env.JWT_ACCESS_SECRET || 'secret',
        });
        req.userId = jwtPayload.sub;
        req.tenantId = jwtPayload.tenantId;
        req.jwtPayload = jwtPayload;
        req.user = jwtPayload as any;
      } catch (error) {
        // Token geçersizse misafir olarak devam et
      }
    }

    // 3. User bazlı kontroller (Token varsa)
    if (jwtPayload?.sub) {
      const user = await this.prisma.user.findUnique({
        where: { id: jwtPayload.sub },
        include: { tenant: true },
      });

      if (user) {
        const userRole = user.role?.toString() || user.role;
        const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SuperAdmin' || userRole.toLowerCase() === 'super_admin';

        this.tenantContext.setUserRole(userRole as string);

        if (isSuperAdmin) {
          this.tenantContext.setUserRole('SUPER_ADMIN');

          // Super admin için header'dan gelirse zaten aşağıda set edilecek.
          // Ancak user.tenantId varsa, varsayılan olarak onu set edelim.
          if (user.tenantId) {
            req.tenantId = user.tenantId;
            this.tenantContext.setTenant(user.tenantId, user.id);
          } else {
            req.tenantId = undefined;
          }
        } else if (user.tenantId) {
          req.tenantId = user.tenantId;
          this.tenantContext.setTenant(user.tenantId, user.id);
        }

        req.jwtPayload = { ...jwtPayload, user } as any;
        req.user = { ...jwtPayload, user } as any;
      }
    }

    // 4. Header veya Staging Default (Super admin olsa bile header'dan geleni kabul et)
    const isSuperAdminNow = this.tenantContext.isSuperAdmin();

    if (tenantIdFromHeader) {
      req.tenantId = tenantIdFromHeader;
      this.tenantContext.setTenant(tenantIdFromHeader, req.userId || 'header-user');
    } else if (!req.tenantId && !isSuperAdminNow && isStaging && stagingDefaultTenantId) {
      req.tenantId = stagingDefaultTenantId;
      this.tenantContext.setTenant(stagingDefaultTenantId, req.userId || 'staging-default');
    }
  }
}
