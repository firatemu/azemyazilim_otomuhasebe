import { Module } from '@nestjs/common';
import { BankaHavaleController } from './banka-havale.controller';
import { BankaHavaleService } from './banka-havale.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [BankaHavaleController],
  providers: [BankaHavaleService, PrismaService],
  exports: [BankaHavaleService],
})
export class BankaHavaleModule {}
