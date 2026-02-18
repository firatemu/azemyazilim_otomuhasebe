import { Module } from '@nestjs/common';
import { AvansService } from './avans.service';
import { AvansController } from './avans.controller';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [TenantContextModule],
    controllers: [AvansController],
    providers: [AvansService],
    exports: [AvansService],
})
export class AvansModule { }
