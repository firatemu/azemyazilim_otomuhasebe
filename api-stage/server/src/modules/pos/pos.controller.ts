import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PosService } from './pos.service';
import { CreatePosSaleDto } from './dto/create-pos-sale.dto';
import { CreatePosSessionDto } from './dto/create-pos-session.dto';
import { ClosePosSessionDto } from './dto/close-pos-session.dto';
import { CreatePosReturnDto } from './dto/create-pos-return.dto';

@ApiTags('POS Console')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post('cart/draft')
  @ApiOperation({ summary: 'Taslak POS sepeti oluştur' })
  @ApiResponse({ status: 201, description: 'Taslak fatura oluşturuldu' })
  async createDraftCart(@Body() dto: CreatePosSaleDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.posService.createDraftSale(dto, userId);
  }

  @Post('cart/:invoiceId/complete')
  @ApiOperation({ summary: 'POS satışını tamamla' })
  @ApiResponse({ status: 200, description: 'Satış tamamlandı' })
  async completeSale(
    @Param('invoiceId') invoiceId: string,
    @Body('payments') payments: CreatePosSaleDto['payments'],
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.posService.completeSale(invoiceId, payments, userId);
  }

  @Post('return')
  @ApiOperation({ summary: 'POS iadesi oluştur' })
  @ApiResponse({ status: 201, description: 'İade oluşturuldu' })
  async createReturn(@Body() dto: CreatePosReturnDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.posService.createReturn(dto, userId);
  }

  @Post('session/open')
  @ApiOperation({ summary: 'POS kasiyer session aç' })
  @ApiResponse({ status: 201, description: 'Session açıldı' })
  async openSession(@Body() dto: CreatePosSessionDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.posService.createSession(dto, userId);
  }

  @Post('session/:sessionId/close')
  @ApiOperation({ summary: 'POS kasiyer session kapat' })
  @ApiResponse({ status: 200, description: 'Session kapatıldı' })
  async closeSession(
    @Param('sessionId') sessionId: string,
    @Body() dto: ClosePosSessionDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.posService.closeSession(sessionId, dto, userId);
  }

  @Get('products/barcode/:barcode')
  @ApiOperation({ summary: 'Barkoda göre ürünleri getir' })
  @ApiResponse({ status: 200, description: 'Ürünler listelendi' })
  async getProductsByBarcode(@Param('barcode') barcode: string) {
    return this.posService.getProductsByBarcode(barcode);
  }

  @Get('carts/active')
  @ApiOperation({ summary: 'Aktif POS sepetlerini getir' })
  @ApiResponse({ status: 200, description: 'Aktif sepetler getirildi' })
  async getActiveCarts(@Query('cashierId') cashierId?: string) {
    return this.posService.getActiveCarts(cashierId);
  }

  @Delete('cart/:invoiceId')
  @ApiOperation({ summary: 'Taslak sepeti sil' })
  @ApiResponse({ status: 200, description: 'Sepet silindi' })
  async deleteCart(@Param('invoiceId') invoiceId: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.posService.deleteDraftCart(invoiceId, userId);
  }
}
