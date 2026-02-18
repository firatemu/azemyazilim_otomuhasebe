import { Module } from '@nestjs/common';
import { BankaHavaleController } from './banka-havale.controller';
import { BankaHavaleService } from './banka-havale.service';
import { PrismaService } from '../../common/prisma.service';
import { SystemParameterModule } from '../system-parameter/system-parameter.module';

@Module({
  imports: [SystemParameterModule],
  controllers: [BankaHavaleController],
  providers: [BankaHavaleService, PrismaService],
  exports: [BankaHavaleService],
})
export class BankaHavaleModule { }
