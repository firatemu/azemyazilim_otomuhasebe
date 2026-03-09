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
import { ProductExportService } from './product-export.service';
import type { Response } from 'express';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, FindAllProductDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productExportService: ProductExportService,
    private readonly tenantResolver: TenantResolverService,
  ) { }

  @Get('export/eslesme')
  async exportEslesme(@Res() res: Response) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) {
      throw new Error('Tenant ID not found');
    }
    const buffer = await this.productExportService.generateEslesmeExcel(tenantId);

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
  create(@Body() dto: CreateProductDto) {
    try {
      // #region agent log
      console.log('[DEBUG product.controller.create] Request received:', {
        name: dto.name,
        code: dto.code,
        unit: dto.unit,
        purchasePrice: dto.purchasePrice,
        salePrice: dto.salePrice,
        purchasePriceType: typeof dto.purchasePrice,
        salePriceType: typeof dto.salePrice,
        description: dto.description?.substring(0, 50),
      });
      // #endregion

      console.log('🔍 [Stok Controller] create çağrıldı', { dto: { ...dto, description: dto.description?.substring(0, 50) } });
      return this.productService.create(dto);
    } catch (error: any) {
      // #region agent log
      console.error('[DEBUG product.controller.create] ERROR:', {
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
  findAll(@Query() query: FindAllProductDto) {
    try {
      console.log('🔍 [Stok Controller] findAll çağrıldı', query);
      return this.productService.findAll(query.page, query.limit, query.search, query.isActive);
    } catch (error: any) {
      console.error('❌ [Stok Controller] findAll hatası:', error);
      throw error;
    }
  }

  @Post('match')
  match(@Body() dto: { mainProductId: string; equivalentProductIds: string[] }) {
    return this.productService.matchProducts(dto.mainProductId, dto.equivalentProductIds);
  }

  @Post('match-oem')
  matchOem() {
    return this.productService.matchOemIle();
  }

  // Spesifik route'lar - genel route'lardan ÖNCE tanımlanmalı
  @Get(':id/can-delete')
  canDelete(@Param('id') id: string) {
    return this.productService.canDelete(id);
  }

  @Get(':id/hareketler')
  getHareketler(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.getStockMovements(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get(':id/esdegerler')
  getEsdegerler(@Param('id') id: string) {
    return this.productService.getEsdegerUrunler(id);
  }

  @Post(':product1Id/esdeger/:product2Id')
  addEsdeger(
    @Param('product1Id') product1Id: string,
    @Param('product2Id') product2Id: string,
  ) {
    return this.productService.addEsdeger(product1Id, product2Id);
  }

  @Delete(':id/eslesme/:eslesikId')
  matchmeCiftiKaldir(
    @Param('id') id: string,
    @Param('eslesikId') eslesikId: string,
  ) {
    return this.productService.matchmeCiftiKaldir(id, eslesikId);
  }

  @Delete(':id/match')
  matchmeKaldir(@Param('id') id: string) {
    return this.productService.matchmeKaldir(id);
  }

  // Genel route'lar - EN SONDA tanımlanmalı
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
