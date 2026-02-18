import { Module } from '@nestjs/common';
import { ProductBarcodeService } from './product-barcode.service';
import { ProductBarcodeController } from './product-barcode.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [ProductBarcodeController],
  providers: [ProductBarcodeService, PrismaService],
  exports: [ProductBarcodeService],
})
export class ProductBarcodeModule {}
