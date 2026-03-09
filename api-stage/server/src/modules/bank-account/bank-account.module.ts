import { PrismaModule } from '../../common/prisma.module';
import { Module } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { BankAccountController } from './bank-account.controller';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [
    PrismaModule,TenantContextModule],
  controllers: [BankAccountController],
  providers: [BankAccountService],
  exports: [BankAccountService],
})
export class BankAccountModule { }

