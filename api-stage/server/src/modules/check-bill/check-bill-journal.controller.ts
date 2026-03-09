import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CheckBillJournalService } from './check-bill-journal.service';
import { CreateCheckBillJournalDto } from './dto/create-check-bill-journal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class CheckBillJournalController {
    constructor(private readonly checkBillJournalService: CheckBillJournalService) { }

    @Get()
    findAll() {
        return this.checkBillJournalService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.checkBillJournalService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateCheckBillJournalDto, @Request() req) {
        return this.checkBillJournalService.create(dto, req.user.id);
    }
}
