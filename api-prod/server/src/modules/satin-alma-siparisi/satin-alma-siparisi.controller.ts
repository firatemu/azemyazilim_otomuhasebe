import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSatinAlmaSiparisDto } from './dto/create-satin-alma-siparis.dto';
import { FaturalandiSatinAlmaSiparisDto } from './dto/faturalandi-satin-alma-siparis.dto';
import { QuerySatinAlmaSiparisDto } from './dto/query-satin-alma-siparis.dto';
import { SevkSatinAlmaSiparisDto } from './dto/sevk-satin-alma-siparis.dto';
import { UpdateSatinAlmaSiparisDto } from './dto/update-satin-alma-siparis.dto';
import { SatinAlmaSiparisiService } from './satin-alma-siparisi.service';

@UseGuards(JwtAuthGuard)
@Controller('satin-alma-siparisi')
export class SatinAlmaSiparisiController {
  constructor(
    private readonly satinAlmaSiparisiService: SatinAlmaSiparisiService,
  ) { }

  @Get()
  findAll(@Query() query: QuerySatinAlmaSiparisDto) {
    return this.satinAlmaSiparisiService.findAll(
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 50,
      query.durum,
      query.search,
      query.cariId,
    );
  }

  @Get('deleted')
  findDeleted(@Query() query: QuerySatinAlmaSiparisDto) {
    return this.satinAlmaSiparisiService.findDeleted(
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 50,
      query.search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.satinAlmaSiparisiService.findOne(id);
  }

  @Post()
  create(
    @Body() createSiparisDto: CreateSatinAlmaSiparisDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.satinAlmaSiparisiService.create(
      createSiparisDto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSiparisDto: UpdateSatinAlmaSiparisDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.satinAlmaSiparisiService.update(
      id,
      updateSiparisDto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.satinAlmaSiparisiService.remove(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/iptal')
  iptalEt(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.satinAlmaSiparisiService.iptalEt(
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
    return this.satinAlmaSiparisiService.changeDurum(
      id,
      durum as any,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/restore')
  restore(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.satinAlmaSiparisiService.restore(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/faturalandi')
  faturalandi(
    @Param('id') id: string,
    @Body() dto: FaturalandiSatinAlmaSiparisDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.satinAlmaSiparisiService.faturalandi(
      id,
      dto.faturaNo,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/sevk-et')
  sevkEt(
    @Param('id') id: string,
    @Body() dto: SevkSatinAlmaSiparisDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.satinAlmaSiparisiService.sevkEt(
      id,
      dto.kalemler,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/create-irsaliye')
  createIrsaliye(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.satinAlmaSiparisiService.createIrsaliyeFromSiparis(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }
}
