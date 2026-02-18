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
    Request,
} from '@nestjs/common';
import { MaasPlanService } from './maas-plan.service';
import { CreateMaasPlanDto } from './dto/create-maas-plan.dto';
import { UpdateMaasPlanDto } from './dto/update-maas-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('maas-plan')
@UseGuards(JwtAuthGuard)
export class MaasPlanController {
    constructor(private readonly maasPlanService: MaasPlanService) { }

    @Post('create')
    create(@Body() createDto: CreateMaasPlanDto) {
        return this.maasPlanService.createPlanForPersonel(createDto);
    }

    @Get('personel/:personelId/:yil')
    getPlanByPersonel(
        @Param('personelId') personelId: string,
        @Param('yil') yil: string,
    ) {
        return this.maasPlanService.getPlanByPersonel(personelId, parseInt(yil));
    }

    @Get('odenecek/:yil/:ay')
    getOdenecekMaaslar(@Param('yil') yil: string, @Param('ay') ay: string) {
        return this.maasPlanService.getOdenecekMaaslar(
            parseInt(yil),
            parseInt(ay),
        );
    }

    @Get(':id')
    getPlanById(@Param('id') id: string) {
        return this.maasPlanService.getPlanById(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateMaasPlanDto) {
        return this.maasPlanService.updatePlan(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.maasPlanService.deletePlan(id);
    }

    @Delete('yillik/:personelId/:yil')
    deleteYillikPlan(
        @Param('personelId') personelId: string,
        @Param('yil') yil: string,
    ) {
        return this.maasPlanService.deleteYillikPlan(personelId, parseInt(yil));
    }
}
