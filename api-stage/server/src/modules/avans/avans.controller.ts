import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AvansService } from './avans.service';
import { CreateAvansDto } from './dto/create-avans.dto';
import { MahsuplastirAvansDto } from './dto/mahsuplastir-avans.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('avans')
@UseGuards(JwtAuthGuard)
export class AvansController {
    constructor(private readonly avansService: AvansService) { }

    @Post('create')
    create(@Body() createDto: CreateAvansDto, @Request() req) {
        return this.avansService.createAvans(createDto, req.user.userId);
    }

    @Post('mahsuplastir')
    mahsuplastir(@Body() mahsupDto: MahsuplastirAvansDto) {
        return this.avansService.mahsuplastir(mahsupDto);
    }

    @Get('personel/:personelId')
    getAvansByPersonel(@Param('personelId') personelId: string) {
        return this.avansService.getAvansByPersonel(personelId);
    }

    @Get(':id')
    getAvansDetay(@Param('id') id: string) {
        return this.avansService.getAvansDetay(id);
    }
}
