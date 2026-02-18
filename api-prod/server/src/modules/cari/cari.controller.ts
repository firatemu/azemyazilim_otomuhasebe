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
import { CariService } from './cari.service';
import { CreateCariDto, UpdateCariDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cari')
export class CariController {
  constructor(private readonly cariService: CariService) {}

  @Post()
  create(@Body() dto: CreateCariDto) {
    console.log('[CariController] POST /cari received dto:', dto);
    console.log('[CariController] dto keys:', Object.keys(dto));
    console.log('[CariController] dto.tip:', dto.tip);
    console.log('[CariController] dto.unvan:', dto.unvan);
    return this.cariService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('tip') tip?: string,
  ) {
    return this.cariService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      search,
      tip,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cariService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCariDto) {
    return this.cariService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cariService.remove(id);
  }

  @Get(':id/hareketler')
  getHareketler(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cariService.getHareketler(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
