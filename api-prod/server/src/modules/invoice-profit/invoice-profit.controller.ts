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

  @Get('by-invoice/:faturaId')
  async getProfitByInvoice(@Param('faturaId') faturaId: string) {
    return this.invoiceProfitService.getProfitByInvoice(faturaId);
  }

  @Get('list')
  async getProfitList(@Query() query: GetProfitQueryDto) {
    return this.invoiceProfitService.getProfitList({
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      cariId: query.cariId,
      durum: query.durum,
    });
  }

  @Get('by-product')
  async getProfitByProduct(@Query() query: GetProfitQueryDto) {
    return this.invoiceProfitService.getProfitByProduct({
      stokId: query.stokId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }

  @Get('detail/:faturaId')
  async getProfitDetail(@Param('faturaId') faturaId: string) {
    return this.invoiceProfitService.getProfitDetailByInvoice(faturaId);
  }

  @Post('recalculate/:faturaId')
  async recalculateProfit(
    @Param('faturaId') faturaId: string,
    @Request() req: any,
  ) {
    await this.invoiceProfitService.recalculateProfit(
      faturaId,
      req.user?.id,
    );
    return { message: 'Kar hesaplaması başarıyla güncellendi' };
  }
}
