import { Module } from '@nestjs/common';
import { BankTransferController } from './bank-transfer.controller';
import { BankTransferService } from './bank-transfer.service';
import { PrismaService } from '../../common/prisma.service';
import { SystemParameterModule } from '../system-parameter/system-parameter.module';

@Module({
  imports: [SystemParameterModule],
  controllers: [BankTransferController],
  providers: [BankTransferService, PrismaService],
  exports: [BankTransferService],
})
export class BankTransferModule { }
