import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { CheckBillService } from './check-bill.service';
import { CreateCheckBillDto, UpdateCheckBillDto } from './dto/create-check-bill.dto';
import { CheckBillActionDto } from './dto/check-bill-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('checks-promissory-notes')
@UseGuards(JwtAuthGuard)
export class CheckBillController {
    constructor(private readonly checkBillService: CheckBillService) { }

    @Get()
    findAll(@Query() query: any) {
        return this.checkBillService.findAll(query);
    }

    @Get('upcoming')
    getUpcomingChecks(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.checkBillService.getUpcomingChecks(
            startDate ? new Date(startDate) : new Date(),
            endDate ? new Date(endDate) : new Date(),
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.checkBillService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCheckBillDto) {
        return this.checkBillService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.checkBillService.remove(id);
    }

    @Post('action')
    processAction(@Body() dto: CheckBillActionDto, @Request() req) {
        return this.checkBillService.processAction(dto, req.user.id);
    }
}
