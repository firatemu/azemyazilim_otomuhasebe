import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InvoiceProfitService } from './invoice-profit.service';
import { GetProfitQueryDto } from './dto/get-profit-query.dto';

@Controller('invoice-profit')
@UseGuards(JwtAuthGuard)
export class InvoiceProfitController {
  constructor(private readonly invoiceProfitService: InvoiceProfitService) {}

  @Get('by-invoice/:invoiceId')
  async getProfitByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.invoiceProfitService.getProfitByInvoice(invoiceId);
  }

  @Get('list')
  async getProfitList(@Query() query: GetProfitQueryDto) {
    return this.invoiceProfitService.getProfitList({
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      accountId: query.accountId,
      status: query.status,
    });
  }

  @Get('by-product')
  async getProfitByProduct(@Query() query: GetProfitQueryDto) {
    return this.invoiceProfitService.getProfitByProduct({
      productId: query.productId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }

  @Get('detail/:invoiceId')
  async getProfitDetail(@Param('invoiceId') invoiceId: string) {
    return this.invoiceProfitService.getProfitDetailByInvoice(invoiceId);
  }

  @Post('recalculate/:invoiceId')
  async recalculateProfit(
    @Param('invoiceId') invoiceId: string,
    @Request() req: any,
  ) {
    await this.invoiceProfitService.recalculateProfit(
      invoiceId,
      req.user?.id,
    );
    return { message: 'Kar hesaplaması başarıyla güncellendi' };
  }
}
