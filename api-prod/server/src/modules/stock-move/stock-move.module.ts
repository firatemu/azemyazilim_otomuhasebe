import { Module } from '@nestjs/common';
import { StockMoveService } from './stock-move.service';
import { StockMoveController } from './stock-move.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [StockMoveController],
  providers: [StockMoveService, PrismaService],
  exports: [StockMoveService],
})
export class StockMoveModule {}
