import { Module, forwardRef } from '@nestjs/common';
import { PersonelService } from './personel.service';
import { PersonelController } from './personel.controller';
import { PrismaModule } from '../../common/prisma.module';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, forwardRef(() => CodeTemplateModule), TenantContextModule],
  controllers: [PersonelController],
  providers: [PersonelService],
  exports: [PersonelService],
})
export class PersonelModule {}
