import { Module, forwardRef } from '@nestjs/common';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    forwardRef(() => CodeTemplateModule),
  ],
  controllers: [PosController],
  providers: [PosService],
  exports: [PosService],
})
export class PosModule {}
