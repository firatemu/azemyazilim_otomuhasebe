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
import { MaasOdemeService } from './maas-odeme.service';
import { CreateMaasOdemeDto } from './dto/create-maas-odeme.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('maas-odeme')
@UseGuards(JwtAuthGuard)
export class MaasOdemeController {
    constructor(private readonly maasOdemeService: MaasOdemeService) { }

    @Post('create')
    create(@Body() createDto: CreateMaasOdemeDto, @Request() req) {
        return this.maasOdemeService.createOdeme(createDto, req.user.userId);
    }

    @Get('plan/:planId')
    getOdemelerByPlan(@Param('planId') planId: string) {
        return this.maasOdemeService.getOdemelerByPlan(planId);
    }

    @Get('personel/:personelId/:yil')
    getOdemelerByPersonel(
        @Param('personelId') personelId: string,
        @Param('yil') yil: string,
    ) {
        return this.maasOdemeService.getOdemelerByPersonel(
            personelId,
            parseInt(yil),
        );
    }

    @Get('export/excel/:yil/:ay')
    async exportExcel(@Param('yil') yil: string, @Param('ay') ay: string, @Res() res: Response) {
        const workbook = await this.maasOdemeService.exportExcel(parseInt(yil), parseInt(ay));
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=maas-listesi-${yil}-${ay}.xlsx`,
        );
        await workbook.xlsx.write(res);
        res.end();
    }

    @Get('makbuz/:id')
    async getMakbuz(@Param('id') id: string, @Res() res: Response) {
        const pdfDoc = await this.maasOdemeService.generateMakbuz(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=odeme-makbuzu-${id}.pdf`,
        );
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
}
