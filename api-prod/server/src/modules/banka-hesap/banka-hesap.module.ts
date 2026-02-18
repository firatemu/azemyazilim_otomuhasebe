import { Module } from '@nestjs/common';
import { BankaHesapService } from './banka-hesap.service';
import { BankaHesapController } from './banka-hesap.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [BankaHesapController],
  providers: [BankaHesapService, PrismaService],
  exports: [BankaHesapService],
})
export class BankaHesapModule {}
