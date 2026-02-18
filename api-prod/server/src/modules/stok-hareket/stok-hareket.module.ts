import { Module } from '@nestjs/common';
import { StokHareketService } from './stok-hareket.service';
import { StokHareketController } from './stok-hareket.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [StokHareketController],
  providers: [StokHareketService],
  exports: [StokHareketService],
})
export class StokHareketModule { }
