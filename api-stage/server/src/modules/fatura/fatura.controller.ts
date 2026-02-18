import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { FaturaDurum, FaturaTipi } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HizliService } from '../hizli/hizli.service';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { UpdateFaturaDto } from './dto/update-fatura.dto';
import { FaturaService } from './fatura.service';
import { FaturaExportService } from './fatura-export.service';

@Controller('fatura')
export class FaturaController {
  constructor(
    private readonly faturaService: FaturaService,
    private readonly hizliService: HizliService,
    private readonly faturaExportService: FaturaExportService,
  ) { }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Query('faturaTipi') faturaTipi?: FaturaTipi) {
    return this.faturaService.getSalesStats(faturaTipi);
  }

  @Get('vade-analiz')
  @UseGuards(JwtAuthGuard)
  async getVadeAnaliz(@Query('cariId') cariId?: string) {
    return this.faturaService.getVadeAnaliz(cariId);
  }

  @Get('price-history')
  @UseGuards(JwtAuthGuard)
  async getPriceHistory(
    @Query('cariId') cariId: string,
    @Query('stokId') stokId: string,
  ) {
    return this.faturaService.getPriceHistory(cariId, stokId);
  }

  @Get('exchange-rate')
  @UseGuards(JwtAuthGuard)
  async getExchangeRate(@Query('currency') currency: string) {
    const rate = await this.faturaService.getExchangeRate(currency);
    return { rate };
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  async exportExcel(
    @Query('faturaTipi') faturaTipi: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('durum') durum: string,
    @Query('search') search: string,
    @Query('satisElemaniId') satisElemaniId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.faturaExportService.generateSalesInvoiceExcel(
      faturaTipi as FaturaTipi || undefined,
      startDate || undefined,
      endDate || undefined,
      durum || undefined,
      search || undefined,
      satisElemaniId || undefined,
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=faturalar_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('faturaTipi') faturaTipi?: FaturaTipi,
    @Query('search') search?: string,
    @Query('cariId') cariId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('durum') durum?: string,
    @Query('satisElemaniId') satisElemaniId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    try {
      const result = await this.faturaService.findAllAdvanced(
        pageNum,
        limitNum,
        faturaTipi,
        search,
        cariId,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        durum,
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
    @Body() createFaturaDto: CreateFaturaDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.faturaService.create(createFaturaDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.faturaService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('bulk/durum')
  async bulkUpdateDurum(
    @Body() body: { ids: string[]; durum: FaturaDurum },
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.faturaService.bulkUpdateDurum(body.ids, body.durum, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFaturaDto: UpdateFaturaDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.faturaService.update(id, updateFaturaDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.faturaService.remove(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/iptal')
  async iptalEt(
    @Param('id') id: string,
    @Body() body: { irsaliyeIptal?: boolean },
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.faturaService.iptalEt(id, userId, undefined, undefined, body.irsaliyeIptal);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/send-einvoice')
  async sendEInvoice(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.faturaService.sendEInvoice(id, this.hizliService, userId);
  }
}
