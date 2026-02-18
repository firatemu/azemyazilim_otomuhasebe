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
} from '@nestjs/common';
import { KasaService } from './kasa.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateKasaDto } from './dto/create-kasa.dto';
import { UpdateKasaDto } from './dto/update-kasa.dto';
import { CreateKasaHareketDto } from './dto/create-kasa-hareket.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { KasaTipi } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('kasa')
export class KasaController {
  constructor(private readonly kasaService: KasaService) {}

  @Get()
  findAll(
    @Query('kasaTipi') kasaTipi?: KasaTipi,
    @Query('aktif') aktif?: string,
  ) {
    // Eğer aktif parametresi gönderilmediyse undefined gönder (tüm kasaları getir)
    // Eğer 'true' gönderildiyse true, 'false' gönderildiyse false gönder
    const aktifValue = aktif === undefined ? undefined : aktif === 'true';
    return this.kasaService.findAll(kasaTipi, aktifValue);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kasaService.findOne(id);
  }

  @Post()
  create(@Body() createKasaDto: CreateKasaDto, @CurrentUser() user: any) {
    return this.kasaService.create(createKasaDto, user?.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateKasaDto: UpdateKasaDto,
    @CurrentUser() user: any,
  ) {
    return this.kasaService.update(id, updateKasaDto, user?.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kasaService.remove(id);
  }

  // Kasa hareketleri
  @Post('hareket')
  createHareket(
    @Body() createHareketDto: CreateKasaHareketDto,
    @CurrentUser() user: any,
  ) {
    return this.kasaService.createHareket(createHareketDto, user?.userId);
  }

  @Delete('hareket/:id')
  deleteHareket(@Param('id') id: string) {
    return this.kasaService.deleteHareket(id);
  }

  // POS transfer
  @Get(':id/bekleyen-transferler')
  getBekleyenTransferler(@Param('id') id: string) {
    return this.kasaService.getBekleyenPOSTransferler(id);
  }

  @Post(':id/transfer-pos')
  transferPOS(@Param('id') id: string, @CurrentUser() user: any) {
    return this.kasaService.transferPOStoBanka(id, user?.userId);
  }
}
