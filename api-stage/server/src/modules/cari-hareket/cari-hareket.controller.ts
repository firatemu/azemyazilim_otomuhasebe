import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { CariHareketService } from './cari-hareket.service';
import { CreateCariHareketDto, EkstreQueryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('cari-hareket')
@UseGuards(JwtAuthGuard)
export class CariHareketController {
  constructor(private readonly cariHareketService: CariHareketService) {}

  @Post()
  async create(@Body() dto: CreateCariHareketDto) {
    return this.cariHareketService.create(dto);
  }

  @Get()
  async findAll(
    @Query('cariId') cariId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.cariHareketService.findAll(
      cariId,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 100,
    );
  }

  @Get('ekstre')
  async getEkstre(@Query() query: EkstreQueryDto) {
    return this.cariHareketService.getEkstre(query);
  }

  @Get('ekstre/excel')
  async exportExcel(@Query() query: EkstreQueryDto, @Res() res: Response) {
    try {
      const buffer = await this.cariHareketService.exportExcel(query);

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="cari-ekstre-${Date.now()}.xlsx"`,
        'Content-Length': buffer.length,
      });

      res.send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Excel oluşturulurken hata oluştu',
        error: error.message,
      });
    }
  }

  @Get('ekstre/pdf')
  async exportPdf(@Query() query: EkstreQueryDto, @Res() res: Response) {
    try {
      const buffer = await this.cariHareketService.exportPdf(query);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="cari-ekstre-${Date.now()}.pdf"`,
        'Content-Length': buffer.length,
      });

      res.send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'PDF oluşturulurken hata oluştu',
        error: error.message,
      });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.cariHareketService.delete(id);
  }
}
