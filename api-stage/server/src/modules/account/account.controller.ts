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
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AccountService } from './account.service';
import { AccountMovementService } from '../account-movement/account-movement.service';
import { CreateAccountDto, UpdateAccountDto, DebtCreditReportQueryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        // TODO: AccountMovementService should be refactored to AccountMovementService later
        private readonly accountMovementService: AccountMovementService,
    ) { }

    @Get('report/debt-credit')
    getDebtCreditReport(@Query() query: DebtCreditReportQueryDto) {
        return this.accountService.getDebtCreditReport(query);
    }

    @Get('report/debt-credit/export/excel')
    async exportDebtCreditReportExcel(@Query() query: DebtCreditReportQueryDto, @Res() res: Response) {
        const buffer = await this.accountService.exportDebtCreditReportExcel(query);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=debt-credit-report.xlsx',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('report/debt-credit/export/pdf')
    async exportDebtCreditReportPdf(@Query() query: DebtCreditReportQueryDto, @Res() res: Response) {
        const buffer = await this.accountService.exportDebtCreditReportPdf(query);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=debt-credit-report.pdf',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('report/credit-limits')
    getCreditLimitReport(@Query() query: DebtCreditReportQueryDto) {
        return this.accountService.getCreditLimitReport(query);
    }

    @Get('report/credit-limits/export/excel')
    async exportCreditLimitReportExcel(@Query() query: DebtCreditReportQueryDto, @Res() res: Response) {
        const buffer = await this.accountService.exportCreditLimitReportExcel(query);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=credit-limits-report.xlsx',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('report/credit-limits/export/pdf')
    async exportCreditLimitReportPdf(@Query() query: DebtCreditReportQueryDto, @Res() res: Response) {
        const buffer = await this.accountService.exportCreditLimitReportPdf(query);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=credit-limits-report.pdf',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    // Backward compatibility alias for existing frontend routes if needed, otherwise these can be dropped
    @Get(':id/statement/export/excel')
    async exportStatementExcel(
        @Param('id') id: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Res() res: Response
    ) {
        const buffer = await this.accountMovementService.exportExcel({
            accountId: id,
            startDate: startDate,
            endDate: endDate,
        });
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=account-statement.xlsx',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get(':id/statement/export/pdf')
    async exportStatementPdf(
        @Param('id') id: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Res() res: Response
    ) {
        const buffer = await this.accountMovementService.exportPdf({
            accountId: id,
            startDate: startDate,
            endDate: endDate,
        });
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=account-statement.pdf',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Post()
    create(@Body() dto: CreateAccountDto) {
        return this.accountService.create(dto);
    }

    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('type') type?: string,
        @Query('isActive') isActive?: string,
    ) {
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.accountService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 50,
            search,
            type,
            isActiveBool,
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.accountService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
        return this.accountService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.accountService.remove(id);
    }

    @Get(':id/movements')
    getMovements(
        @Param('id') id: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.accountService.getMovements(
            id,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 50,
        );
    }
}
