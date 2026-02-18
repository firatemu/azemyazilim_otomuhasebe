import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { EmailService } from '../../common/services/email.service';
import { RedisService } from '../../common/services/redis.service';
import { LicenseService } from '../../common/services/license.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto';
import { SubscriptionStatus, TenantStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private redisService: RedisService,
    private licenseService: LicenseService,
  ) { }

  async register(dto: RegisterDto) {
    // Username yoksa email'den oluştur
    const username = dto.username || dto.email.split('@')[0];

    // FullName yoksa firstName ve lastName'den oluştur
    const fullName = dto.fullName || `${dto.firstName} ${dto.lastName}`;

    // Kullanıcı kontrolü
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          ...(dto.username ? [{ username: dto.username }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email veya kullanıcı adı zaten kullanılıyor',
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Tenant oluştur (eğer companyName varsa)
    let tenantId: string | undefined;
    if (dto.companyName) {
      // Plan slug'ını al (varsayılan olarak 'trial' kullan, eğer belirtilmediyse)
      const planSlug = dto.planSlug || 'trial';
      const plan = await this.prisma.plan.findFirst({
        where: { slug: planSlug },
      });

      if (!plan) {
        throw new ConflictException(`Plan '${planSlug}' bulunamadı`);
      }

      // Plan ücretsiz (trial) mi kontrol et
      const isTrialPlan = planSlug === 'trial' || Number(plan.price) === 0;

      // Tenant status belirleme:
      // - Deneme paketi (trial) ise → PENDING (admin onay bekliyor)
      // - Ücretli plan ise → PENDING (ödeme bekliyor, ödeme başarılı olursa ACTIVE olacak)
      const tenantStatus = TenantStatus.PENDING;

      // Subscription status belirleme:
      // - Deneme paketi ise → PENDING (admin onay bekliyor)
      // - Ücretli plan ise → PENDING (ödeme bekliyor)
      const subscriptionStatus = SubscriptionStatus.PENDING;

      const tenant = await this.prisma.tenant.create({
        data: {
          name: dto.companyName,
          status: tenantStatus,
          subscription: {
            create: {
              planId: plan.id,
              status: subscriptionStatus,
              startDate: new Date(),
              trialEndsAt: isTrialPlan
                ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 gün deneme
                : null,
              endDate: isTrialPlan
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Ücretli plan için de 30 gün
              autoRenew: !isTrialPlan, // Deneme paketi otomatik yenilenmez
            },
          },
        },
      });
      tenantId = tenant.id;
    }

    // Kullanıcı oluştur
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username,
        password: hashedPassword,
        fullName,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        tenantId,
        role: dto.role || (tenantId ? 'TENANT_ADMIN' : 'USER'),
      },
    });

    // Tenant oluşturulduysa ama henüz aktif değilse token verme
    // (Kullanıcı ödeme yapmalı veya admin onayı beklemeli)
    if (tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { subscription: true },
      });

      if (tenant && tenant.status === TenantStatus.PENDING) {
        // Hoş geldiniz maili gönder (asenkron - hata olsa bile register devam eder)
        console.log(`📧 [AuthService] Hoş geldiniz maili gönderiliyor: ${user.email}`);
        this.emailService
          .sendWelcomeEmail(user.email, dto.firstName, dto.lastName)
          .then(() => {
            console.log(`✅ [AuthService] Hoş geldiniz maili gönderildi: ${user.email}`);
          })
          .catch((error) => {
            console.error(`❌ [AuthService] Hoş geldiniz maili gönderilemedi: ${user.email} - Hata: ${error.message}`);
          });

        // PENDING durumunda token verme, sadece kullanıcı bilgisini döndür
        return {
          user: this.sanitizeUser(user),
          requiresPayment: !(dto.planSlug === 'trial' || !dto.planSlug),
          requiresApproval: dto.planSlug === 'trial' || !dto.planSlug,
          message: tenant.subscription?.status === SubscriptionStatus.PENDING
            ? (dto.planSlug === 'trial' || !dto.planSlug
              ? 'Deneme paketiniz admin onayı bekliyor. Onaylandıktan sonra giriş yapabileceksiniz.'
              : 'Ödeme işlemini tamamlamanız gerekiyor. Ödeme başarılı olduktan sonra giriş yapabileceksiniz.')
            : 'Hesabınız aktifleştiriliyor...',
        };
      }
    }

    // Token version'ı artır (yeni kayıt = yeni token version)
    const newTokenVersion = (user.tokenVersion || 0) + 1;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: newTokenVersion },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.tenantId || undefined,
      [],
      newTokenVersion,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Yeni token'ı Redis'e kaydet
    const redisKey = `session:${user.id}`;
    const tokenExpiry = 7 * 24 * 60 * 60; // 7 gün
    await this.redisService.set(redisKey, tokens.accessToken, tokenExpiry);

    // Hoş geldiniz maili gönder (asenkron - hata olsa bile register devam eder)
    console.log(`📧 [AuthService] Hoş geldiniz maili gönderiliyor: ${user.email}`);
    this.emailService
      .sendWelcomeEmail(user.email, dto.firstName, dto.lastName)
      .then(() => {
        console.log(`✅ [AuthService] Hoş geldiniz maili gönderildi: ${user.email}`);
      })
      .catch((error) => {
        console.error(`❌ [AuthService] Hoş geldiniz maili gönderilemedi: ${user.email} - Hata: ${error.message}`);
      });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Kullanıcıyı bul - sadece email ile giriş yapılabilir
    const user = await this.prisma.user.findFirst({
      where: { email: dto.username },
      include: {
        tenant: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`[LOGIN] User not found for email: ${dto.username}`);
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    // Şifre kontrolü
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      console.error(`[LOGIN] Password mismatch for user: ${user.email}`);
      throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı');
    }

    if (!user.isActive) {
      console.error(`[LOGIN] User is not active: ${user.email}`);
      throw new UnauthorizedException('Hesabınız aktif değil');
    }

    // Ana paket lisansı kontrolü (SUPER_ADMIN hariç)
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role === 'TENANT_ADMIN';
    if (!isSuperAdmin && user.tenantId) {
      const hasBaseLicense = await this.licenseService.hasBasePlanLicense(user.id);
      if (!hasBaseLicense) {
        console.error(`[LOGIN] User does not have base plan license: ${user.email}`);
        throw new UnauthorizedException('Ana paket lisansınız bulunmuyor. Lütfen yöneticinizle iletişime geçin.');
      }
    }

    console.log(`[LOGIN] User found: ${user.email}, Role: ${user.role}, isActive: ${user.isActive}, tenantId: ${user.tenantId}`);

    // SUPER_ADMIN ve TENANT_ADMIN kullanıcıları için tenant kontrolü yapma
    // Bu kullanıcılar her zaman giriş yapabilir
    const isAdminUser = user.role === 'SUPER_ADMIN' || user.role === 'TENANT_ADMIN';

    // Tenant ve abonelik kontrolü - sadece normal kullanıcılar için
    if (!isAdminUser && user.tenantId && user.tenant) {
      // PENDING durumunda giriş yapılamaz
      if (user.tenant.status === TenantStatus.PENDING) {
        const subscription = user.tenant.subscription;
        if (subscription?.status === SubscriptionStatus.PENDING) {
          // Deneme paketi mi kontrol et
          const plan = await this.prisma.plan.findUnique({
            where: { id: subscription.planId },
          });
          const isTrialPlan = plan && (plan.slug === 'trial' || Number(plan.price) === 0);

          throw new UnauthorizedException(
            isTrialPlan
              ? 'Deneme paketiniz henüz admin onayı bekliyor. Lütfen daha sonra tekrar deneyin.'
              : 'Ödeme işleminiz henüz tamamlanmadı. Lütfen ödeme işlemini tamamlayın veya daha sonra tekrar deneyin.'
          );
        }
      }

      if (
        user.tenant.status !== 'ACTIVE' &&
        user.tenant.status !== 'TRIAL'
      ) {
        throw new UnauthorizedException('Tenant aktif değil');
      }

      if (user.tenant.subscription) {
        const subscription = user.tenant.subscription;
        const now = new Date();

        // İptal edilmiş abonelik kontrolü
        if (subscription.status === SubscriptionStatus.CANCELED) {
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

    // Token version'ı güncelleme (artık her girişte artırmıyoruz - çoklu oturum desteği)
    // Sadece şifre değişikliği veya manuel logout-all durumunda artırılabilir
    const currentTokenVersion = user.tokenVersion || 0;

    // Eski token'ı Redis'ten silmeye gerek yok (set overwrites it)
    // Ama eğer çoklu oturum istiyorsak Redis key modelini değiştirmemiz gerekirdi.
    // Şimdilik sadece JWT süresine ve tokenVersion'a güveniyoruz.

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.tenantId || undefined,
      [],
      currentTokenVersion,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Redis'e son girişi kaydet (audit için, ama JWTStrategy'den kaldırdık)
    const redisKey = `session:${user.id}`;
    const tokenExpiry = 7 * 24 * 60 * 60; // 7 gün
    await this.redisService.set(redisKey, tokens.accessToken, tokenExpiry);

    // Son giriş zamanını sadece login anında güncelle (performans için)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Erişim reddedildi');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Erişim reddedildi');
    }

    // Refresh token sırasında token version kontrolü yap
    // Eğer token version değiştiyse, refresh token geçersizdir
    const currentTokenVersion = user.tokenVersion || 0;

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.tenantId || undefined,
      [],
      currentTokenVersion,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Redis'te token'ı güncelle
    const redisKey = `session:${user.id}`;
    const tokenExpiry = 7 * 24 * 60 * 60; // 7 gün
    await this.redisService.set(redisKey, tokens.accessToken, tokenExpiry);

    return tokens;
  }

  async logout(userId: string) {
    // Token version'ı artır (logout = token geçersiz)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
        tokenVersion: { increment: 1 },
      },
    });

    // Redis'ten token'ı sil
    const redisKey = `session:${userId}`;
    await this.redisService.del(redisKey);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    tenantId?: string,
    permissions: string[] = [],
    tokenVersion?: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tokenVersion: true },
    });

    const payload = {
      sub: userId,
      email,
      role,
      tokenVersion: tokenVersion ?? user?.tokenVersion ?? 0,
      ...(tenantId && { tenantId }),
      ...(permissions.length > 0 && { permissions }),
      isSuperAdmin: role === 'SUPER_ADMIN',
    };

    const refreshPayload = {
      sub: userId,
      email,
      tokenVersion: payload.tokenVersion,
      ...(tenantId && { tenantId }),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'secret',
        expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
      } as any),
      this.jwtService.signAsync(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      } as any),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Mevcut şifreyi kontrol et
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Mevcut şifre hatalı');
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Şifre başarıyla değiştirildi' };
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, ...result } = user;
    return result;
  }
}
