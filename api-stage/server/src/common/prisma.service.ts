import { Injectable, OnModuleInit, OnModuleDestroy, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from './services/cls.service';

/**
 * Models that MUST have tenant isolation.
 * Accessing these without a tenant context will throw an error.
 */
const TENANT_MODELS = [
  'User', 'Role', 'Permission',
  'Stok', 'StokHareket', 'Cari', 'CariHareket', 'Kasa', 'Fatura', 'FaturaKalemi', 'FaturaTahsilat',
  'Tahsilat', 'Siparis', 'SiparisKalemi', 'Teklif', 'TeklifKalemi',
  'Personel', 'PersonelOdeme', 'MaasPlani', 'MaasOdeme', 'Avans',
  'Warehouse', 'Location', 'StockMove', 'ProductLocationStock',
  'Banka', 'BankaHesabi', 'BankaHavale', 'Bordro', 'CekSenet',
  'SatisIrsaliyesi', 'SatisIrsaliyesiKalemi', 'SatınAlmaIrsaliyesi', 'SatınAlmaIrsaliyesiKalemi',
  'Arac', 'Technician', 'WorkOrder', 'PriceQuote', 'TechnicalFinding', 'DiagnosticNote', 'SolutionPackage',
  'PurchaseOrder', 'PurchaseOrderItem', 'BasitSiparis', 'SatınAlmaSiparisi', 'SatınAlmaSiparisKalemi',
  'Masraf', 'MasrafKategori', 'SatisElemani', 'Randevu', 'SystemParameter'
] as const;

// Helper to define the extension (for type inference)
const createExtendedClient = (client: PrismaClient) => {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          const context = {
            tenantId: ClsService.getTenantId(),
            isSystem: ClsService.get('isSystem') === true,
            isSuperAdmin: ClsService.get('userRole') === 'SUPER_ADMIN',
          };

          // Check if model strictly requires tenant isolation
          if (TENANT_MODELS.includes(model as any)) {

            // 1. Bypass Logic (System or explicit SuperAdmin bypass)
            const isBypass = context.isSystem || context.isSuperAdmin;

            if (!isBypass) {
              // 2. Fail-Fast: strict check
              if (!context.tenantId) {
                throw new BadRequestException(
                  `[Security] Tenant context missing for operation on ${model}.`
                );
              }

              // 3. Inject Tenant ID
              // Write operations
              if (operation === 'create' || operation === 'createMany') {
                if (args.data) {
                  if (Array.isArray(args.data)) {
                    args.data.forEach((item: any) => { item.tenantId = context.tenantId; });
                  } else {
                    (args.data as any).tenantId = context.tenantId;
                  }
                }
              }

              // Read/Update/Delete operations
              if (['update', 'updateMany', 'upsert'].includes(operation)) {
                if (args.data) {
                  delete (args.data as any).tenantId;
                }
              }

              if (['findUnique', 'findFirst', 'findMany', 'count', 'groupBy', 'aggregate', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'].includes(operation)) {
                // Safe inject into where
                args.where = { ...(args.where as any), tenantId: context.tenantId };
              }
            }
          }

          // 4. Soft Delete Guard (Global)
          // Models that support soft delete (convention: has deletedAt field)
          const SOFT_DELETE_MODELS = [
            'User', 'Tenant', 'Stok', 'StokHareket', 'Cari', 'CariHareket', 'Fatura',
            'Tahsilat', 'Siparis', 'Teklif', 'Personel', 'Warehouse', 'Banka', 'CekSenet',
            'SatisIrsaliyesi', 'SatınAlmaIrsaliyesi', 'Arac', 'Technician', 'WorkOrder',
            'PurchaseOrder', 'BasitSiparis', 'SatınAlmaSiparisi', 'Masraf'
          ];

          if (SOFT_DELETE_MODELS.includes(model as any)) {
            // 4.1 Read Operations: Exclude deleted by default
            // EXCLUDED 'findUnique' to prevent runtime errors (findUnique only accepts unique fields)
            if (['findFirst', 'findMany', 'count', 'groupBy', 'aggregate'].includes(operation)) {
              if (args.where) {
                if ((args.where as any).deletedAt === undefined) {
                  (args.where as any).deletedAt = null;
                }
              } else {
                args.where = { deletedAt: null };
              }
            }

            // 4.2 Delete -> Soft Delete
            if (operation === 'delete') {
              return query({
                ...args,
                operation: 'update',
                data: { ...args.data, deletedAt: new Date() },
              });
            }
            if (operation === 'deleteMany') {
              return query({
                ...args,
                operation: 'updateMany',
                data: { ...args.data, deletedAt: new Date() },
              });
            }
          }

          // 5. Forbid Raw Queries (Security Hardening)
          // Raw queries bypass Prisma's type safety and middleware, making them dangerous in multi-tenant apps.
          if (operation === '$queryRaw' || operation === '$executeRaw' || operation === '$queryRawUnsafe' || operation === '$executeRawUnsafe') {
            // Only allow if System or SuperAdmin context
            if (!context.isSystem && !context.isSuperAdmin) {
              throw new BadRequestException('Raw queries are forbidden in tenant context.');
            }
          }

          return query(args);
        },
      },
    },
  });
};

export type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  private _extendedClient: ExtendedPrismaClient;

  constructor() {
    // Basic connection optimization
    const databaseUrl = process.env.DATABASE_URL || '';
    let optimizedUrl = databaseUrl;
    if (databaseUrl && !databaseUrl.includes('connection_limit')) {
      const separator = databaseUrl.includes('?') ? '&' : '?';
      optimizedUrl = `${databaseUrl}${separator}connection_limit=10&pool_timeout=20`;
    }

    super({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: { db: { url: optimizedUrl } },
    });
  }

  /**
   * Returns the Extended Prisma Client with strict Tenant Guards.
   * Do NOT use `this` (raw client) directly for business logic.
   */
  get extended(): ExtendedPrismaClient {
    if (!this._extendedClient) {
      this._extendedClient = createExtendedClient(this);
    }
    return this._extendedClient;
  }

  async onModuleInit() {
    await this.$connect();
    this._extendedClient = createExtendedClient(this);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
