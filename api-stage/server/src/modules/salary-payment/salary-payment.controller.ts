import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { SalaryPaymentService } from './salary-payment.service';
import { CreateSalaryPaymentDto } from './dto/create-salary-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('salary-payment')
@UseGuards(JwtAuthGuard)
export class SalaryPaymentController {
    constructor(private readonly salaryPaymentService: SalaryPaymentService) { }

    @Post('create')
    create(@Body() createDto: CreateSalaryPaymentDto, @Request() req) {
        return this.salaryPaymentService.createOdeme(createDto, req.user.userId);
    }

    @Get('plan/:salaryPlanId')
    getOdemelerByPlan(@Param('salaryPlanId') salaryPlanId: string) {
        return this.salaryPaymentService.getOdemelerByPlan(salaryPlanId);
    }

    @Get('employee/:employeeId/:year')
    getOdemelerByPersonel(
        @Param('employeeId') employeeId: string,
        @Param('year') year: string,
    ) {
        return this.salaryPaymentService.getOdemelerByPersonel(
            employeeId,
            parseInt(year),
        );
    }

    @Get('export/excel/:year/:month')
    async exportExcel(@Param('year') year: string, @Param('month') month: string, @Res() res: Response) {
        const workbook = await this.salaryPaymentService.exportExcel(parseInt(year), parseInt(month));
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=maas-listesi-${year}-${month}.xlsx`,
        );
        await workbook.xlsx.write(res);
        res.end();
    }

    @Get('makbuz/:id')
    async getMakbuz(@Param('id') id: string, @Res() res: Response) {
        const pdfDoc = await this.salaryPaymentService.generateMakbuz(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=odeme-makbuzu-${id}.pdf`,
        );
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
}