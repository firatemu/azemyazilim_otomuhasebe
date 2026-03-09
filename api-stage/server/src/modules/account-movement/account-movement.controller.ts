import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Res,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AccountMovementService } from './account-movement.service';
import { CreateAccountMovementDto, StatementQueryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('account-movement')
@UseGuards(JwtAuthGuard)
export class AccountMovementController {
    constructor(private readonly accountMovementService: AccountMovementService) { }

    @Post()
    async create(@Body() dto: CreateAccountMovementDto) {
        return this.accountMovementService.create(dto);
    }

    @Get()
    async findAll(
        @Query('accountId') accountId: string,
        @Query('skip') skip?: string,
        @Query('take') take?: string,
    ) {
        return this.accountMovementService.findAll(
            accountId,
            skip ? parseInt(skip) : 0,
            take ? parseInt(take) : 100,
        );
    }

    @Get('statement')
    async getStatement(@Query() query: StatementQueryDto) {
        return this.accountMovementService.getStatement(query);
    }

    @Get('statement/excel')
    async exportExcel(@Query() query: StatementQueryDto, @Res() res: Response) {
        try {
            const buffer = await this.accountMovementService.exportExcel(query);

            res.set({
                'Content-Type':
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="account-statement-${Date.now()}.xlsx"`,
                'Content-Length': buffer.length,
            });

            res.send(buffer);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Excel oluşturulurken hata oluştu',
                error: error.message,
            });
        }
    }

    @Get('statement/pdf')
    async exportPdf(@Query() query: StatementQueryDto, @Res() res: Response) {
        try {
            const buffer = await this.accountMovementService.exportPdf(query);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="account-statement-${Date.now()}.pdf"`,
                'Content-Length': buffer.length,
            });

            res.send(buffer);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'PDF oluşturulurken hata oluştu',
                error: error.message,
            });
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.accountMovementService.delete(id);
    }
}
