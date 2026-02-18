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
import { FirmaKrediKartiService } from './firma-kredi-karti.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateFirmaKrediKartiDto } from './dto/create-firma-kredi-karti.dto';
import { UpdateFirmaKrediKartiDto } from './dto/update-firma-kredi-karti.dto';

@UseGuards(JwtAuthGuard)
@Controller('firma-kredi-karti')
export class FirmaKrediKartiController {
  constructor(
    private readonly firmaKrediKartiService: FirmaKrediKartiService,
  ) { }

  @Post()
  create(@Body() createDto: CreateFirmaKrediKartiDto) {
    return this.firmaKrediKartiService.create(createDto);
  }

  @Get()
  findAll(@Query('kasaId') kasaId?: string) {
    return this.firmaKrediKartiService.findAll(kasaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.firmaKrediKartiService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFirmaKrediKartiDto) {
    return this.firmaKrediKartiService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.firmaKrediKartiService.remove(id);
  }

}
