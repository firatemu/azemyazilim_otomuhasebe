import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionExportService } from './collection-export.service';
import { CollectionController } from './collection.controller';
import { PrismaModule } from '../../common/prisma.module';
import { SystemParameterModule } from '../system-parameter/system-parameter.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [
    PrismaModule,
    SystemParameterModule,
    TenantContextModule,
  ],
  controllers: [CollectionController],
  providers: [CollectionService, CollectionExportService],
  exports: [CollectionService],
})
export class CollectionModule { }

