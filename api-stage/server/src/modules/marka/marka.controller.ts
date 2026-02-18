import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MarkaService } from './marka.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('marka')
export class MarkaController {
  constructor(private readonly markaService: MarkaService) {}

  /**
   * Tüm markaları getir (stoklardan unique markalar)
   */
  @Get()
  findAll() {
    return this.markaService.findAll();
  }

  /**
   * Yeni marka ekle (parametreli route'lardan ÖNCE olmalı)
   */
  @Post()
  create(@Body('markaAdi') markaAdi: string) {
    return this.markaService.create(markaAdi);
  }

  /**
   * Belirli bir markayı getir
   */
  @Get(':markaAdi')
  findOne(@Param('markaAdi') markaAdi: string) {
    return this.markaService.findOne(markaAdi);
  }

  /**
   * Markayı güncelle - Marka adını değiştir
   */
  @Put(':markaAdi')
  update(
    @Param('markaAdi') markaAdi: string,
    @Body('yeniMarkaAdi') yeniMarkaAdi: string,
  ) {
    return this.markaService.update(markaAdi, yeniMarkaAdi);
  }

  /**
   * Markayı sil - Sadece ürünü olmayan markalar silinebilir
   */
  @Delete(':markaAdi')
  remove(@Param('markaAdi') markaAdi: string) {
    return this.markaService.remove(markaAdi);
  }
}
