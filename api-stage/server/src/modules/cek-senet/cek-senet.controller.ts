import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { CekSenetService } from './cek-senet.service';
import { UpdateCekSenetDto } from './dto/create-cek-senet.dto';
import { CekSenetIslemDto } from './dto/cek-senet-islem.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('cek-senet')
@UseGuards(JwtAuthGuard)
export class CekSenetController {
    constructor(private readonly cekSenetService: CekSenetService) { }

    @Get()
    findAll(@Query() query: any) {
        return this.cekSenetService.findAll(query);
    }

    @Get('yaklasan')
    getYaklasanCekler(
        @Query('baslangic') baslangic?: string,
        @Query('bitis') bitis?: string,
    ) {
        return this.cekSenetService.getYaklasanCekler(
            baslangic ? new Date(baslangic) : new Date(),
            bitis ? new Date(bitis) : new Date(),
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cekSenetService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCekSenetDto, @Request() req) {
        return this.cekSenetService.update(id, dto, req.user?.id);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.cekSenetService.remove(id, req.user.id);
    }

    @Post('islem')
    islemYap(@Body() dto: CekSenetIslemDto, @Request() req) {
        return this.cekSenetService.islemYap(dto, req.user.id);
    }
}
