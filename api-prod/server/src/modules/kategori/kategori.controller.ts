import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { KategoriService } from './kategori.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('kategori')
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  /**
   * Tüm kategorileri getir (ana kategorilere göre grupla)
   */
  @Get()
  findAll() {
    return this.kategoriService.findAll();
  }

  /**
   * Belirli bir ana kategoriye ait alt kategorileri getir
   */
  @Get(':anaKategori/alt-kategoriler')
  findAltKategoriler(@Param('anaKategori') anaKategori: string) {
    return this.kategoriService.findAltKategoriler(anaKategori);
  }

  /**
   * Ana kategoriye alt kategori ekle
   */
  @Post(':anaKategori/alt-kategori')
  addAltKategori(
    @Param('anaKategori') anaKategori: string,
    @Body('altKategori') altKategori: string,
  ) {
    return this.kategoriService.addAltKategori(anaKategori, altKategori);
  }

  /**
   * Ana kategori ekle
   */
  @Post('ana-kategori')
  addAnaKategori(@Body('anaKategori') anaKategori: string) {
    return this.kategoriService.addAnaKategori(anaKategori);
  }

  /**
   * Alt kategoriyi sil
   */
  @Delete(':anaKategori/alt-kategori/:altKategori')
  removeAltKategori(
    @Param('anaKategori') anaKategori: string,
    @Param('altKategori') altKategori: string,
  ) {
    return this.kategoriService.removeAltKategori(anaKategori, altKategori);
  }

  /**
   * Ana kategoriyi sil
   */
  @Delete(':anaKategori')
  removeAnaKategori(@Param('anaKategori') anaKategori: string) {
    return this.kategoriService.removeAnaKategori(anaKategori);
  }
}
