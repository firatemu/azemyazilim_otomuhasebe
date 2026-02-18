import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { FaturaTipi } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HizliService } from '../hizli/hizli.service';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { UpdateFaturaDto } from './dto/update-fatura.dto';
import { FaturaService } from './fatura.service';

@Controller('fatura')
export class FaturaController {
  constructor(
    private readonly faturaService: FaturaService,
    private readonly hizliService: HizliService,
  ) { }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('faturaTipi') faturaTipi?: FaturaTipi,
    @Query('search') search?: string,
    @Query('cariId') cariId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    try {
      const result = await this.faturaService.findAll(
        pageNum,
        limitNum,
        faturaTipi,
        search,
        cariId,
        sortBy,
        sortOrder,
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
