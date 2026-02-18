import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BordroService } from './bordro.service';
import { CreateBordroDto } from './dto/create-bordro.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('bordro')
@UseGuards(JwtAuthGuard)
export class BordroController {
    constructor(private readonly bordroService: BordroService) { }

    @Get()
    findAll() {
        return this.bordroService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bordroService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateBordroDto, @Request() req) {
        return this.bordroService.create(dto, req.user.id);
    }
}
