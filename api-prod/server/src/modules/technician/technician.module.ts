import { Module } from '@nestjs/common';
import { TechnicianController } from './technician.controller';
import { TechnicianService } from './technician.service';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  controllers: [TechnicianController],
  providers: [TechnicianService],
  exports: [TechnicianService],
})
export class TechnicianModule {}

