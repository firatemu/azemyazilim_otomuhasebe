import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { CreateInvoiceFromOrderDto } from './dto/create-invoice-from-order.dto';
import { CreateOrderFromRemainingDto } from './dto/create-order-from-remaining.dto';
import { PurchaseOrderFilterDto } from './dto/purchase-order-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) {}

  @Post()
  async create(@Body() dto: CreatePurchaseOrderDto, @Request() req) {
    return this.service.create(dto, req.user?.id);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query() filters: PurchaseOrderFilterDto,
  ) {
    return this.service.findAll(page, limit, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @Request() req,
  ) {
    return this.service.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user?.id);
  }

  @Get(':id/remaining-items')
  async getRemainingItems(@Param('id') id: string) {
    return this.service.getRemainingItems(id);
  }

  @Post(':id/create-invoice')
  async createInvoice(
    @Param('id') id: string,
    @Body() dto: CreateInvoiceFromOrderDto,
    @Request() req,
  ) {
    return this.service.createInvoiceFromOrder(id, dto, req.user?.id);
  }

  @Post('from-remaining')
  async createOrderFromRemaining(
    @Body() dto: CreateOrderFromRemainingDto,
    @Request() req,
  ) {
    return this.service.createOrderFromRemaining(dto, req.user?.id);
  }

  @Get(':id/invoices')
  async getOrderInvoices(@Param('id') id: string) {
    return this.service.getOrderInvoices(id);
  }
}
