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
import { StokExportService } from './stok-export.service';
import type { Response } from 'express';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { StokService } from './stok.service';
import { CreateStokDto, UpdateStokDto, FindAllStokDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('stok')
export class StokController {
  constructor(
    private readonly stokService: StokService,
    private readonly stokExportService: StokExportService,
    private readonly tenantResolver: TenantResolverService,
  ) { }

  @Get('export/eslesme')
  async exportEslesme(@Res() res: Response) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) {
      throw new Error('Tenant ID not found');
    }
    const buffer = await this.stokExportService.generateEslesmeExcel(tenantId);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=urun-eslesmeleri.xlsx',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  // Parametresiz route'lar
  @Post()
  create(@Body() dto: CreateStokDto) {
    try {
      // #region agent log
      console.log('[DEBUG stok.controller.create] Request received:', {
        stokAdi: dto.stokAdi,
        stokKodu: dto.stokKodu,
        birim: dto.birim,
        alisFiyati: dto.alisFiyati,
        satisFiyati: dto.satisFiyati,
        alisFiyatiType: typeof dto.alisFiyati,
        satisFiyatiType: typeof dto.satisFiyati,
        aciklama: dto.aciklama?.substring(0, 50),
      });
      // #endregion

      console.log('🔍 [Stok Controller] create çağrıldı', { dto: { ...dto, aciklama: dto.aciklama?.substring(0, 50) } });
      return this.stokService.create(dto);
    } catch (error: any) {
      // #region agent log
      console.error('[DEBUG stok.controller.create] ERROR:', {
        message: error?.message,
        status: error?.status,
        response: error?.response,
        stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
      });
      // #endregion

      console.error('❌ [Stok Controller] create hatası:', error);
      throw error;
    }
  }

  @Get()
  findAll(@Query() query: FindAllStokDto) {
    try {
      console.log('🔍 [Stok Controller] findAll çağrıldı', query);
      return this.stokService.findAll(query.page, query.limit, query.search);
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
