import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import { ShippedPurchaseOrderDto } from './dto/shipped-purchase-order.dto';
import { InvoicedPurchaseOrderDto } from './dto/invoiced-purchase-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PurchaseOrderLocalStatus } from '@prisma/client';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrdersController {
  constructor(private readonly service: PurchaseOrdersService) { }

  @Get()
  async findAll(@Query() query: QueryPurchaseOrderDto) {
    return this.service.findAll(query);
  }

  @Get('deleted')
  async findDeleted(@Query() query: QueryPurchaseOrderDto) {
    return this.service.findDeleted(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  async create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.service.create(
      dto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.service.update(
      id,
      dto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.service.remove(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.service.cancel(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body('status') status: PurchaseOrderLocalStatus,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.service.changeStatus(
      id,
      status,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.service.restore(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/invoiced')
  async invoiced(
    @Param('id') id: string,
    @Body() dto: InvoicedPurchaseOrderDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.service.markAsInvoiced(
      id,
      dto.invoiceNo,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/create-waybill')
  async createWaybill(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.service.createWaybill(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }
}
