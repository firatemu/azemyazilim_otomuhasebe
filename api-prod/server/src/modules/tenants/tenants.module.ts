import { Module, forwardRef } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { PrismaModule } from '../../common/prisma.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [PrismaModule, forwardRef(() => WarehouseModule)],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}

