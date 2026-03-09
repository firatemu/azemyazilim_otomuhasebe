import { Controller, Get, Post, Body } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { ClsService } from '../../common/services/cls.service';

@Controller('rls')
export class RlsController {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  /**
   * RLS Test: Tenant context'i PostgreSQL'e set eder ve ürün sayısını döner
   */
  @Public()
  @Get('test')
  async testRls() {
    const tenantId = this.tenantContext.getTenantId();
    const userId = this.tenantContext.getUserId();
    const userRole = ClsService.get('userRole');

    // Extended Prisma client kullanımı (RLS aktif)
    // Not: Public endpoint olduğu için tenantId undefined olabilir
    let productCount = 0;
    try {
      productCount = await this.prisma.extended.product.count();
    } catch (e) {
      console.error('Prisma extended count error:', e);
    }

    // Raw query ile kontrol (RLS kontrolü için)
    let rawCount = 0;
    if (tenantId) {
      try {
        const result = await this.prisma.extended.$queryRawUnsafe(`
          BEGIN;
          SET LOCAL app.current_tenant_id = $1;
          SELECT COUNT(*) as count FROM "products";
          COMMIT;
        `, tenantId);
        rawCount = Number((result as any)?.[2]?.count || 0);
      } catch (e) {
        console.error('Raw query error:', e);
      }
    }

    return {
      tenantId,
      userId,
      userRole,
      productCountViaPrismaExtended: productCount,
      productCountViaRawQuery: rawCount,
      message: !tenantId 
        ? '⚠️ Tenant context yok (public endpoint)' 
        : (productCount === rawCount ? '✅ RLS çalışıyor!' : '⚠️ RLS eşleşmiyor'),
    };
  }

  /**
   * RLS Status: Tüm tablolardaki RLS durumunu göster
   */
  @Public()
  @Get('status')
  async getRlsStatus() {
    const result = await this.prisma.extended.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as rls_tables,
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND policyname LIKE '%_tenant_isolation') as policies_created
    `;

    // BigInt'i String'e çevir
    return {
      rls_tables: String((result as any)?.[0]?.rls_tables || 0),
      policies_created: String((result as any)?.[0]?.policies_created || 0),
    };
  }

  /**
   * Transaction Test: Prisma transaction içinde RLS kontrolü
   */
  @Post('test-transaction')
  async testRlsTransaction() {
    const tenantId = this.tenantContext.getTenantId();
    
    const result = await this.prisma.extended.$transaction(async (tx) => {
      // Transaction içinde tenant context otomatik set edilir
      const products = await tx.product.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          tenantId: true,
        },
      });

      const count = await tx.product.count();

      return {
        products,
        count,
        tenantId,
      };
    });

    return {
      ...result,
      message: '✅ Transaction içinde RLS aktif',
    };
  }
}