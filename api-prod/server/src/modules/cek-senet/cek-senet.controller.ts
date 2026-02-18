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
import { CekSenetService } from './cek-senet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCekSenetDto } from './dto/create-cek-senet.dto';
import { UpdateCekSenetDto } from './dto/update-cek-senet.dto';
import { FilterCekSenetDto } from './dto/filter-cek-senet.dto';
import { TahsilCekSenetDto } from './dto/tahsil-cek-senet.dto';
import { CiroCekSenetDto } from './dto/ciro-cek-senet.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CekSenetDurum } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('cek-senet')
export class CekSenetController {
  constructor(private readonly cekSenetService: CekSenetService) {}

  // Özel route'lar önce
  @Get('kasa-bakiyesi')
  getKasaBakiyesi() {
    return this.cekSenetService.getCekSenetKasaBakiyesi();
  }

  @Get('stats')
  getStats(
    @Query('tip') tip?: string,
    @Query('portfoyTip') portfoyTip?: string,
    @Query('vadeBaslangic') vadeBaslangic?: string,
    @Query('vadeBitis') vadeBitis?: string,
  ) {
    return this.cekSenetService.getStats(
      tip as any,
      portfoyTip as any,
      vadeBaslangic,
      vadeBitis,
    );
  }

  @Get('deleted')
  findDeleted() {
    return this.cekSenetService.findDeleted();
  }

  @Get('vadesi-gecenler')
  getVadesiGecenler() {
    return this.cekSenetService.getVadesiGecenler();
  }

  @Get()
  findAll(@Query() filterDto: FilterCekSenetDto) {
    return this.cekSenetService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cekSenetService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateCekSenetDto, @CurrentUser() user: any) {
    console.log('📥 [Controller] Yeni çek/senet isteği:', {
      tip: createDto.tip,
      portfoyTip: createDto.portfoyTip,
      durum: createDto.durum || 'belirtilmedi',
      tutar: createDto.tutar,
      userId: user?.userId,
    });
    return this.cekSenetService.create(createDto, user?.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCekSenetDto,
    @CurrentUser() user: any,
  ) {
    return this.cekSenetService.update(id, updateDto, user?.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('reason') reason?: string,
  ) {
    return this.cekSenetService.remove(id, user?.userId, reason);
  }

  // Özel işlemler
  @Post(':id/tahsil')
  tahsilEt(
    @Param('id') id: string,
    @Body() tahsilDto: TahsilCekSenetDto,
    @CurrentUser() user: any,
  ) {
    return this.cekSenetService.tahsilEt(id, tahsilDto, user?.userId);
  }

  @Post(':id/ciro')
  ciroEt(
    @Param('id') id: string,
    @Body() ciroDto: CiroCekSenetDto,
    @CurrentUser() user: any,
  ) {
    return this.cekSenetService.ciroEt(id, ciroDto, user?.userId);
  }

  @Put(':id/durum')
  durumDegistir(
    @Param('id') id: string,
    @Query('durum') durum: CekSenetDurum,
    @Query('aciklama') aciklama: string,
    @CurrentUser() user: any,
  ) {
    return this.cekSenetService.durumDegistir(
      id,
      durum,
      user?.userId,
      aciklama,
    );
  }
}
