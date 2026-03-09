import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../../common/prisma.service';
import { RedisService } from '../../../common/services/redis.service';

type JwtPayload = {
  sub: string;
  email: string;
  tokenVersion?: number;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      passReqToCallback: true,
    } as any);
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.extended.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    // Token Version kontrolü
    const tokenVersion = payload.tokenVersion ?? 0;
    if (user.tokenVersion !== tokenVersion) {
      console.log(`❌ [JWT Refresh] Token version mismatch for user ${user.id}. JWT: ${tokenVersion}, DB: ${user.tokenVersion}`);
      throw new UnauthorizedException('Oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.');
    }

    return { userId: payload.sub, email: payload.email, refreshToken };
  }
}
