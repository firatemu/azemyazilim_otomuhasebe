import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { PrismaModule } from '../../common/prisma.module';
import { EmailService } from '../../common/services/email.service';
import { RedisModule } from '../../common/services/redis.module';
import { LicenseModule } from '../../common/services/license.module';
import { InvitationService } from '../../common/services/invitation.service';

@Module({
  imports: [PassportModule, JwtModule.register({}), PrismaModule, RedisModule, LicenseModule],
  controllers: [AuthController],
  providers: [AuthService, EmailService, InvitationService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
