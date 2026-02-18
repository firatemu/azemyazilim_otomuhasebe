import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProductBarcodeService } from './product-barcode.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateProductBarcodeDto } from './dto/create-product-barcode.dto';

@UseGuards(JwtAuthGuard)
@Controller('product-barcode')
export class ProductBarcodeController {
  constructor(private readonly productBarcodeService: ProductBarcodeService) {}

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.productBarcodeService.findByProduct(productId);
  }

  @Get('barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productBarcodeService.findByBarcode(barcode);
  }

  @Post()
  create(@Body() createDto: CreateProductBarcodeDto) {
    return this.productBarcodeService.create(createDto);
  }

  @Put(':id/set-primary')
  setPrimary(@Param('id') id: string) {
    return this.productBarcodeService.setPrimary(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productBarcodeService.remove(id);
  }
}
