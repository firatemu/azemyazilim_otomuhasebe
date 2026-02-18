import { Module } from '@nestjs/common';
import { FirmaKrediKartiService } from './firma-kredi-karti.service';
import { FirmaKrediKartiController } from './firma-kredi-karti.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [FirmaKrediKartiController],
  providers: [FirmaKrediKartiService, PrismaService],
  exports: [FirmaKrediKartiService],
})
export class FirmaKrediKartiModule {}
