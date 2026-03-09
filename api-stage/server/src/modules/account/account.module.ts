import { Module, forwardRef } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { AccountMovementModule } from '../account-movement/account-movement.module';
import { DeletionProtectionModule } from '../../common/services/deletion-protection.module';

@Module({
    imports: [
        PrismaModule,
        TenantContextModule,
        DeletionProtectionModule,
        forwardRef(() => CodeTemplateModule),
        AccountMovementModule,
    ],
    controllers: [AccountController],
    providers: [AccountService],
    exports: [AccountService],
})
export class AccountModule { }
