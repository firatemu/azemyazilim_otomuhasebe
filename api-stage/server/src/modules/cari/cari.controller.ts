import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CariService } from './cari.service';
import { CariHareketService } from '../cari-hareket/cari-hareket.service';
import { CreateCariDto, UpdateCariDto, DebtCreditReportQueryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cari')
export class CariController {
  constructor(
    private readonly cariService: CariService,
    private readonly cariHareketService: CariHareketService,
  ) { }

  @Get('rapor/borc-alacak')
  getDebtCreditReport(@Query() query: DebtCreditReportQueryDto) {
    return this.cariService.getDebtCreditReport(query);
  }

  @Get('rapor/borc-alacak/export/excel')
  async exportDebtCreditReportExcel(@Query() query: DebtCreditReportQueryDto, @Res() res: Response) {
    const buffer = await this.cariService.exportDebtCreditReportExcel(query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=borc-alacak-raporu.xlsx',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('rapor/borc-alacak/export/pdf')
  async exportDebtCreditReportPdf(@Query() query: DebtCreditReportQueryDto, @Res() res: Response) {
    const buffer = await this.cariService.exportDebtCreditReportPdf(query);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=borc-alacak-raporu.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id/ekstre/export/excel')
  async exportEkstreExcel(
    @Param('id') id: string,
    @Query('baslangicTarihi') baslangicTarihi: string,
    @Query('bitisTarihi') bitisTarihi: string,
    @Res() res: Response
  ) {
    const buffer = await this.cariHareketService.exportExcel({
      cariId: id,
      baslangicTarihi,
      bitisTarihi,
    });
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=cari-ekstre.xlsx',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id/ekstre/export/pdf')
  async exportEkstrePdf(
    @Param('id') id: string,
    @Query('baslangicTarihi') baslangicTarihi: string,
    @Query('bitisTarihi') bitisTarihi: string,
    @Res() res: Response
  ) {
    const buffer = await this.cariHareketService.exportPdf({
      cariId: id,
      baslangicTarihi,
      bitisTarihi,
    });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=cari-ekstre.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post()
  create(@Body() dto: CreateCariDto) {
    console.log('[CariController] POST /cari received dto:', dto);
    console.log('[CariController] dto keys:', Object.keys(dto));
    console.log('[CariController] dto.tip:', dto.tip);
    console.log('[CariController] dto.unvan:', dto.unvan);
    return this.cariService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('tip') tip?: string,
    @Query('aktif') aktif?: string,
  ) {
    const aktifBool = aktif === 'true' ? true : aktif === 'false' ? false : undefined;
    return this.cariService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      search,
      tip,
      aktifBool,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cariService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCariDto) {
    return this.cariService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cariService.remove(id);
  }

  @Get(':id/hareketler')
  getHareketler(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cariService.getHareketler(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

}
