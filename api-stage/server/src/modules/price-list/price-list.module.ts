import { PrismaModule } from '../../common/prisma.module';
import { Module } from '@nestjs/common';
import { PriceListService } from './price-list.service';
import { PriceListController } from './price-list.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [PrismaModule],
    controllers: [PriceListController],
    providers: [PriceListService],
    exports: [PriceListService],
})
export class PriceListModule { }
