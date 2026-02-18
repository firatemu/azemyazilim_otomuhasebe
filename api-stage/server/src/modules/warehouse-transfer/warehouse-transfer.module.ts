import { Module, forwardRef } from '@nestjs/common';
import { WarehouseTransferService } from './warehouse-transfer.service';
import { WarehouseTransferController } from './warehouse-transfer.controller';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [forwardRef(() => CodeTemplateModule), TenantContextModule],
  controllers: [WarehouseTransferController],
  providers: [
    WarehouseTransferService,
  ],
  exports: [WarehouseTransferService],
})
export class WarehouseTransferModule { }
