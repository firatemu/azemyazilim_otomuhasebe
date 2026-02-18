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
  Req,
} from '@nestjs/common';
import { SiparisService } from './siparis.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSiparisDto } from './dto/create-siparis.dto';
import { UpdateSiparisDto } from './dto/update-siparis.dto';
import { QuerySiparisDto } from './dto/query-siparis.dto';
import { FaturalandiSiparisDto } from './dto/faturalandi-siparis.dto';
import { HazirlaSiparisDto } from './dto/hazirla-siparis.dto';
import { SevkSiparisDto } from './dto/sevk-siparis.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('siparis')
export class SiparisController {
  constructor(private readonly siparisService: SiparisService) {}

  @Get()
  findAll(@Query() query: QuerySiparisDto) {
    return this.siparisService.findAll(
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 50,
      query.siparisTipi,
      query.search,
      query.cariId,
    );
  }

  @Get('deleted')
  findDeleted(@Query() query: QuerySiparisDto) {
    return this.siparisService.findDeleted(
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 50,
      query.siparisTipi,
      query.search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siparisService.findOne(id);
  }

  @Post()
  create(
    @Body() createSiparisDto: CreateSiparisDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.siparisService.create(
      createSiparisDto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSiparisDto: UpdateSiparisDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.siparisService.update(
      id,
      updateSiparisDto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.siparisService.remove(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/iptal')
  iptalEt(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.siparisService.iptalEt(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/durum')
  changeDurum(
    @Param('id') id: string,
    @Body('durum') durum: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.siparisService.changeDurum(
      id,
      durum as any,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/restore')
  restore(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.siparisService.restore(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/irsaliye-olustur')
  createIrsaliye(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.siparisService.createIrsaliyeFromSiparis(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/faturalandi')
  faturalandi(
    @Param('id') id: string,
    @Body() dto: FaturalandiSiparisDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.siparisService.faturalandi(
      id,
      dto.faturaNo,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get(':id/hazirlama-detaylari')
  hazirlamaDetaylari(@Param('id') id: string) {
    return this.siparisService.getHazirlamaDetaylari(id);
  }

  @Post(':id/hazirla')
  hazirla(
    @Param('id') id: string,
    @Body() dto: HazirlaSiparisDto,
    @CurrentUser() user: any,
  ) {
    return this.siparisService.hazirla(id, dto.hazirlananlar, user?.userId);
  }

  @Post(':id/sevk-et')
  sevkEt(
    @Param('id') id: string,
    @Body() dto: SevkSiparisDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.siparisService.sevkEt(
      id,
      dto.kalemler,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('fatura-icin-siparisler')
  getSiparislerForInvoice(@Query() query: any) {
    return this.siparisService.findSiparislerForInvoice(
      query.cariId,
      query.search,
    );
  }
}
