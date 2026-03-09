import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AdvanceService } from './advance.service';
import { CreateAdvanceDto } from './dto/create-advance.dto';
import { MahsuplastirAdvanceDto } from './dto/mahsuplastir-advance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('advance')
@UseGuards(JwtAuthGuard)
export class AdvanceController {
    constructor(private readonly advanceService: AdvanceService) { }

    @Post('create')
    create(@Body() createDto: CreateAdvanceDto, @Request() req) {
        return this.advanceService.createAdvance(createDto, req.user.userId);
    }

    @Post('mahsuplastir')
    mahsuplastir(@Body() mahsupDto: MahsuplastirAdvanceDto) {
        return this.advanceService.mahsuplastir(mahsupDto);
    }

    @Get('employee/:employeeId')
    getAdvanceByEmployee(@Param('employeeId') employeeId: string) {
        return this.advanceService.getAdvanceByEmployee(employeeId);
    }

    @Get(':id')
    getAdvanceDetay(@Param('id') id: string) {
        return this.advanceService.getAdvanceDetay(id);
    }
}
