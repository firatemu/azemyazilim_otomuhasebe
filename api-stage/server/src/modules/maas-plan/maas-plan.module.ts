import { Module, forwardRef } from '@nestjs/common';
import { MaasPlanService } from './maas-plan.service';
import { MaasPlanController } from './maas-plan.controller';
import { PersonelModule } from '../personel/personel.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [forwardRef(() => PersonelModule), TenantContextModule],
    controllers: [MaasPlanController],
    providers: [MaasPlanService],
    exports: [MaasPlanService],
})
export class MaasPlanModule { }
