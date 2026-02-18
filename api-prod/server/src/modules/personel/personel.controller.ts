import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PersonelService } from './personel.service';
import { CreatePersonelDto } from './dto/create-personel.dto';
import { UpdatePersonelDto } from './dto/update-personel.dto';
import { CreatePersonelOdemeDto } from './dto/create-personel-odeme.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('personel')
@UseGuards(JwtAuthGuard)
export class PersonelController {
  constructor(private readonly personelService: PersonelService) {}

  // Özel route'lar önce tanımlanmalı

  @Get('stats')
  async getStats(
    @Query('departman') departman?: string,
    @Query('aktif') aktif?: string,
  ) {
    const aktifBoolean =
      aktif === 'true' ? true : aktif === 'false' ? false : undefined;
    return this.personelService.getStats(departman, aktifBoolean);
  }

  @Get('departmanlar')
  async getDepartmanlar() {
    return this.personelService.getDepartmanlar();
  }

  // Genel listele endpoint'i
  @Get()
  async findAll(
    @Query('aktif') aktif?: string,
    @Query('departman') departman?: string,
  ) {
    const aktifBoolean =
      aktif === 'true' ? true : aktif === 'false' ? false : undefined;
    return this.personelService.findAll(aktifBoolean, departman);
  }

  @Post()
  async create(@Body() createDto: CreatePersonelDto, @Request() req) {
    return this.personelService.create(createDto, req.user.userId);
  }

  // Parametrik route'lar en sona konmalı
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.personelService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePersonelDto,
    @Request() req,
  ) {
    return this.personelService.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.personelService.remove(id);
  }

  // Ödeme işlemleri
  @Post('odeme')
  async createOdeme(
    @Body() createOdemeDto: CreatePersonelOdemeDto,
    @Request() req,
  ) {
    return this.personelService.createOdeme(createOdemeDto, req.user.userId);
  }

  @Get(':id/odemeler')
  async getOdemeler(@Param('id') personelId: string) {
    return this.personelService.getOdemeler(personelId);
  }
}
