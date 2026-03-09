import { Module } from '@nestjs/common';
import { AdvanceService } from './advance.service';
import { AdvanceController } from './advance.controller';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [TenantContextModule],
    controllers: [AdvanceController],
    providers: [AdvanceService],
    exports: [AdvanceService],
})
export class AdvanceModule { }
