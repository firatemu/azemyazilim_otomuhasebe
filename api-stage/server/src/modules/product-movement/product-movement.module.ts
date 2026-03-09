import { PrismaModule } from '../../common/prisma.module';
import { Module } from '@nestjs/common';
import { ProductMovementService } from './product-movement.service';
import { ProductMovementController } from './product-movement.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductMovementController],
  providers: [ProductMovementService],
  exports: [ProductMovementService],
})
export class ProductMovementModule { }
