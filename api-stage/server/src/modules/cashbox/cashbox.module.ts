import { Module, forwardRef } from '@nestjs/common';
import { CashboxService } from './cashbox.service';
import { CashboxController } from './cashbox.controller';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { SystemParameterModule } from '../system-parameter/system-parameter.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [
        forwardRef(() => CodeTemplateModule),
        SystemParameterModule,
        TenantContextModule,
    ],
    controllers: [CashboxController],
    providers: [CashboxService],
    exports: [CashboxService],
})
export class CashboxModule { }
