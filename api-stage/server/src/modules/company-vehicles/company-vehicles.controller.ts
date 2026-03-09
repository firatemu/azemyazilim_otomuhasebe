import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CompanyVehiclesService } from './company-vehicles.service';
import { CreateCompanyVehicleDto } from './dto/create-company-vehicle.dto';
import { UpdateCompanyVehicleDto } from './dto/update-company-vehicle.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Company Vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('company-vehicles')
export class CompanyVehiclesController {
    constructor(private readonly companyVehiclesService: CompanyVehiclesService) { }

    @Post()
    @ApiOperation({ summary: 'Yeni şirket aracı oluşturur' })
    create(@Body() createCompanyVehicleDto: CreateCompanyVehicleDto) {
        return this.companyVehiclesService.create(createCompanyVehicleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Tüm şirket araçlarını listeler' })
    findAll() {
        return this.companyVehiclesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Belirtilen şirket aracının detaylarını ve expensesını getirir' })
    findOne(@Param('id') id: string) {
        return this.companyVehiclesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Şirket aracı bilgilerini günceller' })
    update(@Param('id') id: string, @Body() updateCompanyVehicleDto: UpdateCompanyVehicleDto) {
        return this.companyVehiclesService.update(id, updateCompanyVehicleDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Şirket aracını siler' })
    remove(@Param('id') id: string) {
        return this.companyVehiclesService.remove(id);
    }
}
