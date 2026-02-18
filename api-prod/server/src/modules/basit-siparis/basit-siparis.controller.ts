import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasitSiparisService } from './basit-siparis.service';
import { CreateBasitSiparisDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BasitSiparisDurum } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('basit-siparis')
export class BasitSiparisController {
  constructor(private readonly basitSiparisService: BasitSiparisService) {}

  /**
   * Yeni sipariş oluştur
   * Durum otomatik olarak ONAY_BEKLIYOR olarak ayarlanır
   */
  @Post()
  create(@Body() dto: CreateBasitSiparisDto) {
    return this.basitSiparisService.create(dto);
  }

  /**
   * Tüm siparişleri listele
   */
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('durum') durum?: BasitSiparisDurum,
  ) {
    return this.basitSiparisService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      durum,
    );
  }

  /**
   * Tek sipariş getir
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.basitSiparisService.findOne(id);
  }
}
