import { Module } from '@nestjs/common';
import { CodeTemplateService } from './code-template.service';
import { CodeTemplateController } from './code-template.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [CodeTemplateController],
  providers: [CodeTemplateService],
  exports: [CodeTemplateService], // Diğer modüller kullanabilsin
})
export class CodeTemplateModule {}
