import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { TenantContextService } from '../services/tenant-context.service';
import { JwtPayload } from '../../modules/auth/strategies/jwt.strategy';

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
  ) {}

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
    try {
      // ✅ ÖNCE HEADER'DAN TENANT ID OKU (STAGING ORTAMI İÇİN)
      // Express header'ları lowercase'e dönüştürür, bu yüzden küçük harf kullan
      console.log('🔍 [TenantMiddleware] Tüm header\'lar:', Object.keys(req.headers).filter(k => k.toLowerCase().includes('tenant')));
      console.log('🔍 [TenantMiddleware] x-tenant-id header:', req.headers['x-tenant-id']);

      let tenantIdFromHeader = req.headers['x-tenant-id'] as string;
      if (!tenantIdFromHeader) {
        // Alternatif formatları da dene (Express lowercase'e dönüştürür ama yine de kontrol et)
        tenantIdFromHeader = (req.headers as any)['X-Tenant-Id'] as string ||
                            req.headers['tenant-id'] as string ||
                            (req.headers as any)['Tenant-Id'] as string;
      }

      // STAGING ORTAMI İÇİN: Tenant ID gereksiz - sadece header'dan varsa kullan
      const nodeEnv = process.env.NODE_ENV;
      const isStaging = nodeEnv === 'staging' ||
                        nodeEnv === 'development' ||
                        process.env.STAGING_DISABLE_TENANT === 'true';
      const stagingDefaultTenantId = await this.getStagingDefaultTenantId();
      
      console.log('🔍 [TenantMiddleware] Environment check:', { 
        NODE_ENV: nodeEnv, 
        isStaging, 
        STAGING_DEFAULT_TENANT_ID: stagingDefaultTenantId 
      });

      if (tenantIdFromHeader) {
        console.log('✅ [TenantMiddleware] Tenant ID header\'dan alındı:', tenantIdFromHeader);
        req.tenantId = tenantIdFromHeader;
        this.tenantContext.setTenant(tenantIdFromHeader, 'header-user');
      } else if (isStaging && stagingDefaultTenantId) {
        // Staging ortamında default tenant ID varsa, onu kullan
        console.log('✅ [Staging] Default tenant ID kullanılıyor:', stagingDefaultTenantId);
        req.tenantId = stagingDefaultTenantId;
        this.tenantContext.setTenant(stagingDefaultTenantId, 'staging-default');
      } else if (isStaging) {
        // Staging ortamında tenant ID gereksiz - set etme
        console.log('🔧 [Staging] Tenant ID gereksiz, atlanıyor');
        req.tenantId = undefined;
      }

      // Authorization header'dan token'ı çıkar
      const authHeader = req.headers.authorization;

      // STAGING ORTAMI İÇİN: Token yoksa ve header'dan tenant ID aldıysak devam et
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Header'dan veya default'tan tenant ID aldıysak devam et
        if (req.tenantId) {
          return next();
        }

        // Tenant ID yoksa ve staging değilse sessizce devam et (guard'lar handle eder)
        return next();
      }

      const token = authHeader.substring(7);

      // Token'ı doğrula
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'secret',
      });

      // Request objesine ekle
      req.userId = payload.sub;
      req.tenantId = payload.tenantId;
      req.jwtPayload = payload;
      // Passport uyumluluğu için user property'sini de set et
      req.user = payload as any;

      // ✅ HEADER'DAN TENANT ID VARSA ÖNCELİK VER (TOKEN'DAN ÖNCE)
      if (tenantIdFromHeader) {
        console.log('✅ [TenantMiddleware] Header\'dan tenant ID öncelikli kullanılıyor:', tenantIdFromHeader);
        req.tenantId = tenantIdFromHeader;
        if (payload.sub) {
          this.tenantContext.setTenant(tenantIdFromHeader, payload.sub);
        } else {
          this.tenantContext.setTenant(tenantIdFromHeader, 'header-user');
        }
      } else if (isStaging && stagingDefaultTenantId) {
        // Staging ortamında default tenant ID kullan
        console.log('✅ [Staging] Default tenant ID kullanılıyor:', stagingDefaultTenantId);
        req.tenantId = stagingDefaultTenantId;
        this.tenantContext.setTenant(stagingDefaultTenantId, payload.sub || 'staging-default');
      } else if (payload.tenantId && payload.sub && !isStaging) {
        // Header'da yoksa token'dan al (sadece production'da)
        this.tenantContext.setTenant(payload.tenantId, payload.sub);
        req.tenantId = payload.tenantId;
      } else if (isStaging) {
        // Staging ortamında tenant ID gereksiz - set etme
        console.log('🔧 [Staging] Tenant ID gereksiz, atlanıyor');
        req.tenantId = undefined;
      }

      // Kullanıcı ve tenant bilgilerini doğrula
      if (payload.sub) {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          include: {
            tenant: true,
          },
        });

        if (user) {
          // User role'ünü TenantContextService'e ekle (string olarak kontrol et)
          const userRole = user.role?.toString() || user.role;
          const isSuperAdminRole = userRole === 'SUPER_ADMIN' || userRole === 'SuperAdmin' || userRole === 'super_admin' || (user as any).role === 'SUPER_ADMIN';

          console.log('🔍 [TenantMiddleware] User role:', { role: userRole, userId: user.id, isSuperAdminRole });
          this.tenantContext.setUserRole(userRole as string);

          if (isSuperAdminRole) {
            // SUPER_ADMIN için tenant olmasa da çalışabilir - ÖNCELİK VER
            console.log('✅ [TenantMiddleware] SUPER_ADMIN detected, bypassing tenant check');
            req.jwtPayload = {
              ...payload,
              user,
            };
            req.user = {
              ...payload,
              user,
            } as any;
            // SUPER_ADMIN için TenantContextService'e tenant set etme (undefined kalacak)
            // Ama role'u set etmeliyiz
            this.tenantContext.setUserRole('SUPER_ADMIN');
          } else if (user.tenant) {
            req.tenantId = user.tenantId || undefined;
            req.jwtPayload = {
              ...payload,
              user,
            };
            // Passport uyumluluğu için user property'sini de set et
            req.user = {
              ...payload,
              user,
            } as any;

            // Tenant Context Service'e güncelle
            if (user.tenantId) {
              this.tenantContext.setTenant(user.tenantId, user.id);
            }
          } else if (isStaging) {
            // STAGING ORTAMI İÇİN: Tenant ID gereksiz - set etme
            console.log('🔧 [Staging] Kullanıcı tenant\'ı yok, staging ortamında gereksiz - atlanıyor');
            req.tenantId = undefined;
          }
        }
      }
    } catch (error) {
      // Token geçersizse staging için tenant ID set etme
      const isStaging = process.env.NODE_ENV === 'staging' ||
                        process.env.NODE_ENV === 'development' ||
                        process.env.STAGING_DISABLE_TENANT === 'true';
      const stagingDefaultTenantId = await this.getStagingDefaultTenantId();

      if (isStaging && stagingDefaultTenantId) {
        // Staging'de default tenant ID kullan
        console.log('✅ [Staging] Token hatası, default tenant ID kullanılıyor:', stagingDefaultTenantId);
        req.tenantId = stagingDefaultTenantId;
        this.tenantContext.setTenant(stagingDefaultTenantId, 'staging-default');
      } else if (isStaging) {
        console.log('🔧 [Staging] Token hatası, staging ortamında tenant ID gereksiz - atlanıyor');
        req.tenantId = undefined;
      }
    }

    next();
  }
}
