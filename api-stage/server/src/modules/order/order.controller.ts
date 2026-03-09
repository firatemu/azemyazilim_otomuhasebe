import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { MarkInvoicedDto } from './dto/faturalandi-order.dto';
import { PrepareOrderDto } from './dto/hazirla-order.dto';
import { ShipOrderDto } from './dto/sevk-order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get()
  findAll(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 50,
      query.orderType,
      query.search,
      query.accountId,
      query.status,
    );
  }

  @Get('deleted')
  findDeleted(@Query() query: QueryOrderDto) {
    return this.orderService.findDeleted(
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 50,
      query.orderType,
      query.search,
    );
  }

  @Get('for-invoice')
  getOrdersForInvoice(@Query() query: any) {
    return this.orderService.findOrdersForInvoice(
      query.accountId,
      query.search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.orderService.create(
      createOrderDto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.orderService.update(
      id,
      updateOrderDto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.orderService.remove(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.orderService.cancel(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.orderService.changeStatus(
      id,
      status,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/restore')
  restore(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.orderService.restore(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/delivery-note')
  createDeliveryNote(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.orderService.createDeliveryNoteFromOrder(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/mark-invoiced')
  markInvoiced(
    @Param('id') id: string,
    @Body() dto: MarkInvoicedDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.orderService.markInvoiced(
      id,
      dto.invoiceNo,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get(':id/preparation-details')
  getPreparationDetails(@Param('id') id: string) {
    return this.orderService.getPreparationDetails(id);
  }

  @Post(':id/prepare')
  prepare(
    @Param('id') id: string,
    @Body() dto: PrepareOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.orderService.prepare(id, dto.items, user?.userId);
  }

  @Post(':id/ship')
  ship(
    @Param('id') id: string,
    @Body() dto: ShipOrderDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.orderService.ship(
      id,
      dto.items,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }
}
