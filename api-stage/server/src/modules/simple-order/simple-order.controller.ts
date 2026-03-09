import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SimpleOrderService } from './simple-order.service';
import { CreateSimpleOrderDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SimpleOrderDurum } from './dto/create-simple-order.dto';

@ApiTags('simple-order')
@UseGuards(JwtAuthGuard)
@Controller('simple-order')
export class SimpleOrderController {
  constructor(private readonly simpleOrderService: SimpleOrderService) { }

  /**
   * Yeni sipariş oluştur
   * Durum otomatik olarak AWAITING_APPROVAL olarak ayarlanır
   */
  @Post()
  create(@Body() dto: CreateSimpleOrderDto) {
    return this.simpleOrderService.create(dto);
  }

  /**
   * Tüm siparişleri listele
   */
  @Get()
  @ApiQuery({ name: 'status', enum: SimpleOrderDurum, required: false })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: SimpleOrderDurum,
  ) {
    return this.simpleOrderService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      status,
    );
  }

  /**
   * Tek sipariş getir
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.simpleOrderService.findOne(id);
  }
}
