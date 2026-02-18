import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StokHareketService } from './stok-hareket.service';
import { HareketTipi } from '@prisma/client';

@Controller('stok-hareket')
@UseGuards(AuthGuard('jwt'))
export class StokHareketController {
  constructor(private readonly stokHareketService: StokHareketService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('stokId') stokId?: string,
    @Query('hareketTipi') hareketTipi?: HareketTipi,
  ) {
    return this.stokHareketService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 100,
      stokId,
      hareketTipi,
    );
  }
}
