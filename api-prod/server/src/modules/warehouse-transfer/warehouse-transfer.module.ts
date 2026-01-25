import { Module, forwardRef } from '@nestjs/common';
import { WarehouseTransferService } from './warehouse-transfer.service';
import { WarehouseTransferController } from './warehouse-transfer.controller';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CodeTemplateModule } from '../code-template/code-template.module';

@Module({
  imports: [forwardRef(() => CodeTemplateModule)],
  controllers: [WarehouseTransferController],
  providers: [
    WarehouseTransferService,
    PrismaService,
    TenantResolverService,
  ],
  exports: [WarehouseTransferService],
})
export class WarehouseTransferModule {}
