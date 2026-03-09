import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { UnitSetService } from './unit-set.service';
import { CreateUnitSetDto, UpdateUnitSetDto } from './dto/unit-set.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('unit-set')
export class UnitSetController {
    constructor(private readonly unitSetService: UnitSetService) { }

    @Get()
    findAll() {
        return this.unitSetService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.unitSetService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateUnitSetDto) {
        return this.unitSetService.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUnitSetDto) {
        return this.unitSetService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.unitSetService.remove(id);
    }
}
