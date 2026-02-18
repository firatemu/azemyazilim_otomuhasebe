import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../common/prisma.service';
import { RedisService } from '../../../common/services/redis.service';

export type JwtPayload = {
  sub: string;
  email: string;
  tenantId?: string;
  role: string;
  permissions?: string[];
  tokenVersion?: number;
  iat?: number;
  exp?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'secret',
      passReqToCallback: true,
    } as any);
  }

  async validate(req: any, payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        tenant: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya aktif değil');
    }

    // Token Version kontrolü - JWT'deki version ile DB'deki version karşılaştır
    const tokenVersion = payload.tokenVersion ?? 0;
    if (user.tokenVersion !== tokenVersion) {
      console.log(`❌ [JWT] Token version mismatch for user ${user.id}. JWT: ${tokenVersion}, DB: ${user.tokenVersion}`);
      throw new UnauthorizedException('Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.');
    }

    // Redis ile aktif oturum kontrolü - Çoklu sekme desteği için gevşetildi
    // JWT ve TokenVersion kontrolü güvenlik için yeterlidir.

    // SUPER_ADMIN için tenant kontrolünü atla
    const userRole = user.role?.toString() || user.role;
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SuperAdmin' || userRole === 'super_admin';
    const isStaging = process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'development';

    console.log('🔍 [JwtStrategy] Tenant validation:', { isStaging, userRole, isSuperAdmin, hasTenantId: !!user.tenantId, hasTenant: !!user.tenant });

    // Tenant kontrolü (SUPER_ADMIN hariç ve staging hariç)
    if (user.tenantId && !isSuperAdmin && !isStaging) {
      if (!user.tenant) {
        throw new UnauthorizedException('Tenant bulunamadı');
      }

      // Tenant durumu kontrolü
      if (user.tenant.status !== 'ACTIVE' && user.tenant.status !== 'TRIAL') {
        throw new UnauthorizedException('Tenant aktif değil');
      }

      // Abonelik kontrolü
      if (user.tenant.subscription) {
        const subscription = user.tenant.subscription;
        const now = new Date();

        // İptal edilmiş abonelik kontrolü
        if (subscription.status === 'CANCELED') {
          throw new UnauthorizedException('Aboneliğiniz iptal edilmiştir. Sisteme giriş yapabilmek için aboneliğinizin aktif olması gerekmektedir.');
        }

        if (
          subscription.status !== 'ACTIVE' &&
          subscription.status !== 'TRIAL'
        ) {
          throw new UnauthorizedException('Abonelik aktif değil');
        }

        if (subscription.endDate < now) {
          throw new UnauthorizedException('Abonelik süresi dolmuş');
        }
      }
    }

    // Son giriş artık sadece login işleminde güncelleniyor

    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      tenantId: user.tenantId || payload.tenantId,
      role: payload.role,
      permissions: payload.permissions || [],
      user,
    };
  }
}
