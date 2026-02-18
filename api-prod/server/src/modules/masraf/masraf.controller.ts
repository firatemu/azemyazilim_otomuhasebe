import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MasrafService } from './masraf.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMasrafDto } from './dto/create-masraf.dto';
import { UpdateMasrafDto } from './dto/update-masraf.dto';

@UseGuards(JwtAuthGuard)
@Controller('masraf')
export class MasrafController {
  constructor(private readonly masrafService: MasrafService) {}

  @Get('stats')
  getStats(
    @Query('kategoriId') kategoriId?: string,
    @Query('baslangicTarihi') baslangicTarihi?: string,
    @Query('bitisTarihi') bitisTarihi?: string,
  ) {
    return this.masrafService.getStats(
      kategoriId,
      baslangicTarihi,
      bitisTarihi,
    );
  }

  @Get('kategoriler')
  findAllKategoriler() {
    return this.masrafService.findAllKategoriler();
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('kategoriId') kategoriId?: string,
    @Query('baslangicTarihi') baslangicTarihi?: string,
    @Query('bitisTarihi') bitisTarihi?: string,
  ) {
    return this.masrafService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      kategoriId,
      baslangicTarihi,
      bitisTarihi,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masrafService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateMasrafDto) {
    return this.masrafService.create(createDto);
  }

  @Post('kategoriler')
  createKategori(@Body() body: { kategoriAdi: string; aciklama?: string }) {
    return this.masrafService.createKategori(body.kategoriAdi, body.aciklama);
  }

  @Put('kategoriler/:id')
  updateKategori(
    @Param('id') id: string,
    @Body() body: { kategoriAdi: string; aciklama?: string },
  ) {
    return this.masrafService.updateKategori(
      id,
      body.kategoriAdi,
      body.aciklama,
    );
  }

  @Delete('kategoriler/:id')
  removeKategori(@Param('id') id: string) {
    return this.masrafService.removeKategori(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMasrafDto) {
    return this.masrafService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masrafService.remove(id);
  }
}
