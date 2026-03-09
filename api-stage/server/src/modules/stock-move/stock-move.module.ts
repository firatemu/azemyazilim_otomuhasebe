import { PrismaModule } from '../../common/prisma.module';
import { Module } from '@nestjs/common';
import { StockMoveService } from './stock-move.service';
import { StockMoveController } from './stock-move.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [StockMoveController],
  providers: [StockMoveService],
  exports: [StockMoveService],
})
export class StockMoveModule {}
