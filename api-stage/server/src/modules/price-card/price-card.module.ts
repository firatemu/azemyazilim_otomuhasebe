import { PrismaModule } from '../../common/prisma.module';
import { Module } from '@nestjs/common';
import { PriceCardService } from './price-card.service';
import { PriceCardController } from './price-card.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [PriceCardController],
  providers: [PriceCardService],
  exports: [PriceCardService],
})
export class PriceCardModule {}
