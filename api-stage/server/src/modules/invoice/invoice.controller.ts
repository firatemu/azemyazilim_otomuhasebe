import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiParam } from '@nestjs/swagger';
import { InvoiceType, InvoiceStatus } from './invoice.enums';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoicePaymentPlanDto } from './dto/create-invoice-payment-plan.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceService } from './invoice.service';
import { InvoiceExportService } from './invoice-export.service';

@ApiTags('invoice')
@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoiceExportService: InvoiceExportService,
  ) { }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'invoiceType', enum: InvoiceType, required: false })
  async getStats(@Query('invoiceType') invoiceType?: string) {
    return this.invoiceService.getSalesStats(invoiceType as InvoiceType);
  }

  @Get('vade-analiz')
  @UseGuards(JwtAuthGuard)
  async getVadeAnaliz(@Query('accountId') accountId?: string) {
    return this.invoiceService.getDueDateAnalysis(accountId);
  }

  @Get('price-history')
  @UseGuards(JwtAuthGuard)
  async getPriceHistory(
    @Query('accountId') accountId: string,
    @Query('productId') productId: string,
  ) {
    return this.invoiceService.getPriceHistory(accountId, productId);
  }

  @Get('exchange-rate')
  @UseGuards(JwtAuthGuard)
  async getExchangeRate(@Query('currency') currency: string) {
    const rate = await this.invoiceService.getExchangeRate(currency);
    return { rate };
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  async exportExcel(
    @Query('invoiceType') invoiceType: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('status') status: string,
    @Query('search') search: string,
    @Query('satisElemaniId') satisElemaniId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.invoiceExportService.generateSalesInvoiceExcel(
      invoiceType as InvoiceType || undefined,
      startDate || undefined,
      endDate || undefined,
      status || undefined,
      search || undefined,
      satisElemaniId || undefined,
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=faturalar_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }

  @Get()
  @ApiQuery({ name: 'invoiceType', enum: InvoiceType, required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('invoiceType') invoiceType?: string,
    @Query('search') search?: string,
    @Query('accountId') accountId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('satisElemaniId') satisElemaniId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    try {
      const result = await this.invoiceService.findAllAdvanced(
        pageNum,
        limitNum,
        invoiceType as InvoiceType | undefined,
        search,
        accountId,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        status as any,
        satisElemaniId,
      );

      return {
        success: true,
        data: result.data,
        meta: result.meta,
        page: pageNum,
        limit: limitNum,
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createFaturaDto: CreateInvoiceDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.create(createFaturaDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('bulk/status')
  async bulkUpdateDurum(
    @Body() body: { ids: string[]; status: InvoiceStatus },
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.bulkUpdateStatus(body.ids, body.status, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFaturaDto: UpdateInvoiceDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.update(id, updateFaturaDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.remove(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  async changeDurum(
    @Param('id') id: string,
    @Body() body: { status: InvoiceStatus },
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.changeStatus(id, body.status, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/iptal')
  async iptalEt(
    @Param('id') id: string,
    @Body() body: { deliveryNoteIptal?: boolean },
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.cancel(id, userId, undefined, undefined, body.deliveryNoteIptal);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/odeme-plani')
  async addOdemePlani(
    @Param('id') id: string,
    @Body() body: CreateInvoicePaymentPlanDto[],
  ) {
    return this.invoiceService.createPaymentPlan(id, body);
  }
}