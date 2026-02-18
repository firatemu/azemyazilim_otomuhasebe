import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
} from '@nestjs/common';
import { SatisElemaniService } from './satis-elemani.service';
import { CreateSatisElemaniDto } from './dto/create-satis-elemani.dto';
import { UpdateSatisElemaniDto } from './dto/update-satis-elemani.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('satis-elemani')
@UseGuards(JwtAuthGuard)
export class SatisElemaniController {
    constructor(private readonly satisElemaniService: SatisElemaniService) { }

    @Post()
    create(@Body() createDto: CreateSatisElemaniDto, @Req() req: any) {
        return this.satisElemaniService.create(createDto, req.user?.id);
    }

    @Get()
    findAll() {
        return this.satisElemaniService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.satisElemaniService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateSatisElemaniDto) {
        return this.satisElemaniService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.satisElemaniService.remove(id);
    }
}
