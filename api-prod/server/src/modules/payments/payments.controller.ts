import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { IyzicoService } from './iyzico/iyzico.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly iyzicoService: IyzicoService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  findHistory(@Query('subscriptionId') subscriptionId: string) {
    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }
    return this.paymentsService.findBySubscriptionId(subscriptionId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  async refund(@Param('id') id: string) {
    const payment = await this.paymentsService.findOne(id);
    if (!payment.iyzicoPaymentId) {
      throw new Error('Payment does not have iyzico payment ID');
    }
    return this.iyzicoService.refund(payment.iyzicoPaymentId, Number(payment.amount));
  }

  @Post('webhooks/iyzico')
  @Public() // Public endpoint - no auth required
  async handleIyzicoWebhook(@Body() payload: any) {
    return this.iyzicoService.handleWebhook(payload);
  }

  @Post('callback')
  @Public() // Public endpoint - no auth required
  async handleCallback(@Query('token') token: string) {
    // İyzico callback işleme
    return this.iyzicoService.handleCallback(token);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
