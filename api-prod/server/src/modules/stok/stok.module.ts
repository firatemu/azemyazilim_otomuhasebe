import { Module, forwardRef } from '@nestjs/common';
import { StokService } from './stok.service';
import { StokController } from './stok.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    forwardRef(() => CodeTemplateModule),
  ],
  controllers: [StokController],
  providers: [StokService],
  exports: [StokService],
})
export class StokModule {}
