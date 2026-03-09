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
  ) { }

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
      const parameter = await this.prisma.extended.systemParameter.findFirst({
        where: {
          key: 'STAGING_DEFAULT_TENANT_ID',
          tenantId: null, // Explicitly query global parameter
        },
      });

      if (parameter && parameter.value != null) {
        const v = parameter.value;
        const id = typeof v === 'string' ? v : (v as any)?.id ?? (v as any)?.value;
        if (typeof id === 'string' && id.length > 0) {
          this.cachedStagingDefaultTenantId = id;
          return id;
        }
      }
    } catch (error) {
      console.warn('[TenantResolverService] SystemParameter okuma hatası, fallback kullanılıyor:', error);
    }

    // Fallback: .env
    let fallbackId = process.env.STAGING_DEFAULT_TENANT_ID || null;
    if (fallbackId) {
      this.cachedStagingDefaultTenantId = fallbackId;
      return fallbackId;
    }
    // Fallback: veritabanında tek tenant varsa onu kullan (staging için)
    try {
      const first = await this.prisma.extended.tenant.findFirst({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });
      if (first?.id) {
        this.cachedStagingDefaultTenantId = first.id;
        return first.id;
      }
    } catch (_) { /* ignore */ }
    this.cachedStagingDefaultTenantId = null;
    return null;
  }

  private async resolve(options: {
    userId?: string;
    allowNull: boolean;
  }): Promise<string | null> {
    let tenantId: string | null = this.tenantContext.getTenantId() ?? null;

    // 2. Yoksa ve userId verilmişse: User.tenantId al; varsa context'e set et
    if (!tenantId && options.userId) {
      const user = await this.prisma.extended.user.findUnique({
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
        const exists = await this.prisma.extended.tenant.findUnique({
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
      const tenant = await this.prisma.extended.tenant.findUnique({
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
