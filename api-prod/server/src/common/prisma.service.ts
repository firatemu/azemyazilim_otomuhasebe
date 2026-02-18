import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Connection pool optimizasyonları - 51 bağlantı sorununu çözmek için
    // DATABASE_URL'e connection_limit ve pool_timeout parametreleri eklenmeli
    // Örnek: postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
    const databaseUrl = process.env.DATABASE_URL || '';

    // Eğer DATABASE_URL'de connection pool parametreleri yoksa ekle
    let optimizedUrl = databaseUrl;
    if (databaseUrl && !databaseUrl.includes('connection_limit')) {
      const separator = databaseUrl.includes('?') ? '&' : '?';
      optimizedUrl = `${databaseUrl}${separator}connection_limit=10&pool_timeout=20&connect_timeout=10`;
    }

    super({
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: optimizedUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
