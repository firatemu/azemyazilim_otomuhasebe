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
import { BankaHesapService } from './banka-hesap.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateBankaHesapDto } from './dto/create-banka-hesap.dto';
import { UpdateBankaHesapDto } from './dto/update-banka-hesap.dto';

@UseGuards(JwtAuthGuard)
@Controller('banka-hesap')
export class BankaHesapController {
  constructor(private readonly bankaHesapService: BankaHesapService) {}

  @Post()
  create(@Body() createDto: CreateBankaHesapDto) {
    return this.bankaHesapService.create(createDto);
  }

  @Get()
  findAll(@Query('kasaId') kasaId?: string, @Query('hesapTipi') hesapTipi?: string) {
    return this.bankaHesapService.findAll(kasaId, hesapTipi);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankaHesapService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateBankaHesapDto) {
    return this.bankaHesapService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankaHesapService.remove(id);
  }
}
