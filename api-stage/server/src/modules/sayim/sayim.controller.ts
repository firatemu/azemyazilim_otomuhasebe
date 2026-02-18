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
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { SayimService } from './sayim.service';
import { SayimExportService } from './sayim-export.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSayimDto } from './dto/create-sayim.dto';
import { UpdateSayimDto } from './dto/update-sayim.dto';
import { AddKalemDto } from './dto/add-kalem.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SayimTipi, SayimDurum } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('sayim')
export class SayimController {
  constructor(
    private readonly sayimService: SayimService,
    private readonly sayimExportService: SayimExportService,
  ) {}

  @Get()
  findAll(
    @Query('sayimTipi') sayimTipi?: SayimTipi,
    @Query('durum') durum?: SayimDurum,
  ) {
    return this.sayimService.findAll(sayimTipi, durum);
  }

  @Get('barcode/product/:barcode')
  findProductByBarcode(@Param('barcode') barcode: string) {
    return this.sayimService.findProductByBarcode(barcode);
  }

  @Get('barcode/location/:barcode')
  findLocationByBarcode(@Param('barcode') barcode: string) {
    return this.sayimService.findLocationByBarcode(barcode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sayimService.findOne(id);
  }

  @Post()
  create(@Body() createSayimDto: CreateSayimDto, @CurrentUser() user: any) {
    return this.sayimService.create(createSayimDto, user?.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSayimDto: UpdateSayimDto,
    @CurrentUser() user: any,
  ) {
    return this.sayimService.update(id, updateSayimDto, user?.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sayimService.remove(id);
  }

  @Put(':id/tamamla')
  tamamla(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sayimService.tamamla(id, user?.userId);
  }

  @Put(':id/onayla')
  onayla(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sayimService.onayla(id, user?.userId);
  }

  @Post(':id/kalem')
  addKalem(@Param('id') id: string, @Body() addKalemDto: AddKalemDto) {
    return this.sayimService.addKalem(id, addKalemDto);
  }

  @Get(':id/export/excel')
  async exportExcel(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.sayimExportService.generateExcel(id);
    const sayim = await this.sayimService.findOne(id);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Sayim_${sayim.sayimNo}_${new Date().getTime()}.xlsx"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get(':id/export/pdf')
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.sayimExportService.generatePdf(id);
    const sayim = await this.sayimService.findOne(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Sayim_${sayim.sayimNo}_${new Date().getTime()}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
