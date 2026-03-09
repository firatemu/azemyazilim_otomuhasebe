import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VehicleExpensesService } from './vehicle-expenses.service';
import { CreateVehicleExpenseDto } from './dto/create-vehicle-expense.dto';
import { UpdateVehicleExpenseDto } from './dto/update-vehicle-expense.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Vehicle Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicle-expenses')
export class VehicleExpensesController {
    constructor(private readonly vehicleExpensesService: VehicleExpensesService) { }

    @Post()
    @ApiOperation({ summary: 'Yeni araç masrafı oluşturur' })
    create(@Body() createVehicleExpenseDto: CreateVehicleExpenseDto) {
        return this.vehicleExpensesService.create(createVehicleExpenseDto);
    }

    @Get()
    @ApiOperation({ summary: 'Tüm araç expensesını listeler' })
    findAll() {
        return this.vehicleExpensesService.findAll();
    }

    @Get('vehicle/:vehicleId')
    @ApiOperation({ summary: 'Belirtilen aracın expensesını listeler' })
    findByVehicle(@Param('vehicleId') vehicleId: string) {
        return this.vehicleExpensesService.findByVehicle(vehicleId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Belirtilen masraf detaylarını getirir' })
    findOne(@Param('id') id: string) {
        return this.vehicleExpensesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Masraf bilgilerini günceller' })
    update(@Param('id') id: string, @Body() updateVehicleExpenseDto: UpdateVehicleExpenseDto) {
        return this.vehicleExpensesService.update(id, updateVehicleExpenseDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Masrafı siler' })
    remove(@Param('id') id: string) {
        return this.vehicleExpensesService.remove(id);
    }
}
