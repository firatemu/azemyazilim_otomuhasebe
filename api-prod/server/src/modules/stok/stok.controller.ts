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
} from '@nestjs/common';
import { StokService } from './stok.service';
import { CreateStokDto, UpdateStokDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stok')
export class StokController {
  constructor(private readonly stokService: StokService) {}

  // Parametresiz route'lar
  @Post()
  create(@Body() dto: CreateStokDto) {
    try {

      console.log('🔍 [Stok Controller] create çağrıldı', { dto: { ...dto, aciklama: dto.aciklama?.substring(0, 50) } });
      return this.stokService.create(dto);
    } catch (error: any) {

      console.error('❌ [Stok Controller] create hatası:', error);
      throw error;
    }
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    try {
      console.log('🔍 [Stok Controller] findAll çağrıldı', { page, limit, search });
      return this.stokService.findAll(
        page ? parseInt(page) : 1,
        limit ? parseInt(limit) : 50,
        search,
      );
    } catch (error: any) {
      console.error('❌ [Stok Controller] findAll hatası:', error);
      throw error;
    }
  }

  @Post('eslestir')
  eslestir(@Body() dto: { anaUrunId: string; esUrunIds: string[] }) {
    return this.stokService.eslestirUrunler(dto.anaUrunId, dto.esUrunIds);
  }

  @Post('eslestir-oem')
  eslestirOem() {
    return this.stokService.eslestirOemIle();
  }

  // Spesifik route'lar - genel route'lardan ÖNCE tanımlanmalı
  @Get(':id/can-delete')
  canDelete(@Param('id') id: string) {
    return this.stokService.canDelete(id);
  }

  @Get(':id/hareketler')
  getHareketler(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stokService.getStokHareketleri(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get(':id/esdegerler')
  getEsdegerler(@Param('id') id: string) {
    return this.stokService.getEsdegerUrunler(id);
  }

  @Post(':stok1Id/esdeger/:stok2Id')
  addEsdeger(
    @Param('stok1Id') stok1Id: string,
    @Param('stok2Id') stok2Id: string,
  ) {
    return this.stokService.addEsdeger(stok1Id, stok2Id);
  }

  @Delete(':id/eslesme/:eslesikId')
  eslestirmeCiftiKaldir(
    @Param('id') id: string,
    @Param('eslesikId') eslesikId: string,
  ) {
    return this.stokService.eslestirmeCiftiKaldir(id, eslesikId);
  }

  @Delete(':id/eslestir')
  eslestirmeKaldir(@Param('id') id: string) {
    return this.stokService.eslestirmeKaldir(id);
  }

  // Genel route'lar - EN SONDA tanımlanmalı
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stokService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStokDto) {
    return this.stokService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stokService.remove(id);
  }
}
