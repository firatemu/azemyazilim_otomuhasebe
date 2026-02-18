import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { TahsilatService } from './tahsilat.service';
import { TahsilatExportService } from './tahsilat-export.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTahsilatDto } from './dto/create-tahsilat.dto';
import { CreateCaprazOdemeDto } from './dto/create-capraz-odeme.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TahsilatTip, OdemeTipi } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('tahsilat')
export class TahsilatController {
  constructor(
    private readonly tahsilatService: TahsilatService,
    private readonly tahsilatExportService: TahsilatExportService,
  ) {}

  @Post()
  create(@Body() createDto: CreateTahsilatDto, @CurrentUser() user: any) {
    return this.tahsilatService.create(createDto, user.userId);
  }

  @Post('capraz-odeme')
  createCaprazOdeme(
    @Body() createDto: CreateCaprazOdemeDto,
    @CurrentUser() user: any,
  ) {
    return this.tahsilatService.createCaprazOdeme(createDto, user.userId);
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 50,
    @Query('tip') tip?: TahsilatTip,
    @Query('odemeTipi') odemeTipi?: OdemeTipi,
    @Query('cariId') cariId?: string,
    @Query('baslangicTarihi') baslangicTarihi?: string,
    @Query('bitisTarihi') bitisTarihi?: string,
    @Query('kasaId') kasaId?: string,
    @Query('bankaHesapId') bankaHesapId?: string,
    @Query('firmaKrediKartiId') firmaKrediKartiId?: string,
  ) {
    return this.tahsilatService.findAll(
      page,
      limit,
      tip,
      odemeTipi,
      cariId,
      baslangicTarihi,
      bitisTarihi,
      kasaId,
      bankaHesapId,
      firmaKrediKartiId,
    );
  }

  @Get('stats')
  getStats() {
    return this.tahsilatService.getStats();
  }

  @Get('export/excel')
  async exportExcel(
    @Res() res: Response,
    @Query('tip') tip?: TahsilatTip,
    @Query('odemeTipi') odemeTipi?: OdemeTipi,
    @Query('cariId') cariId?: string,
    @Query('baslangicTarihi') baslangicTarihi?: string,
    @Query('bitisTarihi') bitisTarihi?: string,
    @Query('kasaId') kasaId?: string,
    @Query('bankaHesapId') bankaHesapId?: string,
    @Query('firmaKrediKartiId') firmaKrediKartiId?: string,
  ) {
    const buffer = await this.tahsilatExportService.generateExcel(
      tip,
      odemeTipi,
      cariId,
      baslangicTarihi,
      bitisTarihi,
      kasaId,
      bankaHesapId,
      firmaKrediKartiId,
    );

    const fileName = `Tahsilat_Raporu_${new Date().getTime()}.xlsx`;

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get('export/pdf')
  async exportPdf(
    @Res() res: Response,
    @Query('tip') tip?: TahsilatTip,
    @Query('odemeTipi') odemeTipi?: OdemeTipi,
    @Query('cariId') cariId?: string,
    @Query('baslangicTarihi') baslangicTarihi?: string,
    @Query('bitisTarihi') bitisTarihi?: string,
    @Query('kasaId') kasaId?: string,
    @Query('bankaHesapId') bankaHesapId?: string,
    @Query('firmaKrediKartiId') firmaKrediKartiId?: string,
  ) {
    const buffer = await this.tahsilatExportService.generatePdf(
      tip,
      odemeTipi,
      cariId,
      baslangicTarihi,
      bitisTarihi,
      kasaId,
      bankaHesapId,
      firmaKrediKartiId,
    );

    const fileName = `Tahsilat_Raporu_${new Date().getTime()}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tahsilatService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tahsilatService.delete(id);
  }
}
