import { Module } from '@nestjs/common';
import { PriceCardService } from './price-card.service';
import { PriceCardController } from './price-card.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [PriceCardController],
  providers: [PriceCardService, PrismaService],
  exports: [PriceCardService],
})
export class PriceCardModule {}
