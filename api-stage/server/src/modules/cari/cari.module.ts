import { Module, forwardRef } from '@nestjs/common';
import { CariService } from './cari.service';
import { CariController } from './cari.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { CariHareketModule } from '../cari-hareket/cari-hareket.module';
import { DeletionProtectionModule } from '../../common/services/deletion-protection.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    DeletionProtectionModule,
    forwardRef(() => CodeTemplateModule),
    CariHareketModule,
  ],
  controllers: [CariController],
  providers: [CariService],
  exports: [CariService],
})
export class CariModule { }
