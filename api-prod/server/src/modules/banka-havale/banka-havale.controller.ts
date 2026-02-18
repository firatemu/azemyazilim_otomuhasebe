import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HavaleTipi } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BankaHavaleService } from './banka-havale.service';
import { CreateBankaHavaleDto } from './dto/create-banka-havale.dto';
import { FilterBankaHavaleDto } from './dto/filter-banka-havale.dto';
import { UpdateBankaHavaleDto } from './dto/update-banka-havale.dto';

@UseGuards(JwtAuthGuard)
@Controller('banka-havale')
export class BankaHavaleController {
  constructor(private readonly bankaHavaleService: BankaHavaleService) { }

  // Özel route'lar önce tanımlanmalı (stats, deleted vb.)
  @Get('stats')
  getStats(
    @Query('bankaHesabiId') bankaHesabiId?: string,
    @Query('baslangicTarihi') baslangicTarihi?: string,
    @Query('bitisTarihi') bitisTarihi?: string,
    @Query('hareketTipi') hareketTipi?: HavaleTipi,
  ) {
    return this.bankaHavaleService.getStats(
      bankaHesabiId,
      baslangicTarihi,
      bitisTarihi,
      hareketTipi,
    );
  }

  @Get('deleted')
  findDeleted() {
    return this.bankaHavaleService.findDeleted();
  }

  // Genel listele endpoint'i
  @Get()
  findAll(@Query() filterDto: FilterBankaHavaleDto) {
    return this.bankaHavaleService.findAll(filterDto);
  }

  // Parametrik route'lar en sona konmalı
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankaHavaleService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateBankaHavaleDto, @CurrentUser() user: any) {
    return this.bankaHavaleService.create(createDto, user?.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBankaHavaleDto,
    @CurrentUser() user: any,
  ) {
    return this.bankaHavaleService.update(id, updateDto, user?.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('reason') reason?: string,
  ) {
    return this.bankaHavaleService.remove(id, user?.userId, reason);
  }
}
