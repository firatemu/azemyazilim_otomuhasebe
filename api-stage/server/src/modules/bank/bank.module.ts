import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [PrismaModule, TenantContextModule],
    controllers: [BankController],
    providers: [BankService],
    exports: [BankService],
})
export class BankModule { }
