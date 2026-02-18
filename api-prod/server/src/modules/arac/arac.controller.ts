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
import { AracService } from './arac.service';
import { CreateAracDto, UpdateAracDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('arac')
export class AracController {
  constructor(private readonly aracService: AracService) {}

  @Post()
  create(@Body() createAracDto: CreateAracDto) {
    return this.aracService.create(createAracDto);
  }

  // Spesifik route'lar - parametrik route'lardan ÖNCE tanımlanmalı (sıralama önemli!)
  @Get('markalar')
  getMarkalar() {
    return this.aracService.getMarkalar();
  }

  @Get('yakit-tipleri')
  getYakitTipleri() {
    return this.aracService.getYakitTipleri();
  }

  @Get('modeller')
  getModeller(@Query('marka') marka?: string) {
    return this.aracService.getModeller(marka);
  }

  // Genel listeleme route'u - parametrik route'lardan ÖNCE ama spesifik route'lardan SONRA
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('marka') marka?: string,
    @Query('yakitTipi') yakitTipi?: string,
  ) {
    return this.aracService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      search,
      marka,
      yakitTipi,
    );
  }

  // Parametrik route'lar - EN SONDA tanımlanmalı
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aracService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAracDto: UpdateAracDto) {
    return this.aracService.update(id, updateAracDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aracService.remove(id);
  }
}
