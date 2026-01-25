import { Injectable, BadRequestException } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';
import { PrismaService } from '../prisma.service';
import { isStagingEnvironment } from '../utils/staging.util';

export interface ResolveForCreateOptions {
  userId?: string;
  allowNull?: boolean;
}

/**
 * Merkezi tenant ID çözümleme servisi.
 * Create ve query akışlarında tutarlı tenant çözümleme ve FK güvenliği sağlar.
 */
@Injectable()
export class TenantResolverService {
  // Cache for staging default tenant ID
  private cachedStagingDefaultTenantId: string | null | undefined = undefined;

  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create / FK kullanımı için tenant ID çözümle (kasa, cari, fatura, vb.)
   */
  async resolveForCreate(options?: ResolveForCreateOptions): Promise<string | null> {
    return this.resolve({
      userId: options?.userId,
      allowNull: options?.allowNull ?? false,
    });
  }

  /**
   * Liste/filtre sorguları için tenant ID çözümle (findAll, findFirst, vb.)
   */
  async resolveForQuery(): Promise<string | null> {
    return this.resolve({ allowNull: true });
  }

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
      console.warn('[TenantResolverService] SystemParameter okuma hatası, fallback kullanılıyor:', error);
    }

    // Fallback: .env dosyasından oku
    const fallbackId = process.env.STAGING_DEFAULT_TENANT_ID || 'cmi5of04z0000ksb3g5eyu6ts';
    this.cachedStagingDefaultTenantId = fallbackId || null;
    return this.cachedStagingDefaultTenantId;
  }

  private async resolve(options: {
    userId?: string;
    allowNull: boolean;
  }): Promise<string | null> {
    let tenantId: string | null = this.tenantContext.getTenantId() ?? null;

    // 2. Yoksa ve userId verilmişse: User.tenantId al; varsa context'e set et
    if (!tenantId && options.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: options.userId },
        select: { tenantId: true },
      });
      if (user?.tenantId) {
        tenantId = user.tenantId;
        this.tenantContext.setTenant(tenantId, options.userId);
      }
    }

    // 3. Hâlâ yoksa ve staging/dev: STAGING_DEFAULT_TENANT_ID (sadece DB'de varsa)
    if (!tenantId && isStagingEnvironment()) {
      const defaultId = await this.getStagingDefaultTenantId();
      if (defaultId) {
        const exists = await this.prisma.tenant.findUnique({
          where: { id: defaultId },
          select: { id: true },
        });
        if (exists) {
          tenantId = defaultId;
          this.tenantContext.setTenant(
            defaultId,
            options.userId || 'tenant-resolver-default',
          );
        }
      }
    }

    // 4. Elde edilen tenantId null değilse DB'de varlık kontrolü
    if (tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { id: true },
      });
      if (!tenant) {
        tenantId = null;
      }
    }

    // 5.–6. allowNull false ve tenant yoksa throw; allowNull true ise null dön
    if (!tenantId && !options.allowNull) {
      throw new BadRequestException(
        'Tenant bulunamadı. Lütfen tekrar giriş yapın veya yöneticinizle iletişime geçin.',
      );
    }

    return tenantId;
  }
}
