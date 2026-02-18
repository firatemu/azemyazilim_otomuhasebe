import { Module } from '@nestjs/common';
import { BankaHesapService } from './banka-hesap.service';
import { BankaHesapController } from './banka-hesap.controller';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  controllers: [BankaHesapController],
  providers: [BankaHesapService, PrismaService],
  exports: [BankaHesapService],
})
export class BankaHesapModule { }

