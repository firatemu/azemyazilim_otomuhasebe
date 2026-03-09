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
} from '@nestjs/common';
import { VehicleBrandService } from './vehicle-brand.service';
import { CreateVehicleBrandDto, UpdateVehicleBrandDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('vehicle-brand')
export class VehicleBrandController {
  constructor(private readonly vehicleBrandService: VehicleBrandService) { }

  @Post()
  create(@Body() createVehicleBrandDto: CreateVehicleBrandDto) {
    return this.vehicleBrandService.create(createVehicleBrandDto);
  }

  // Spesifik route'lar - parametrik route'lardan ÖNCE tanımlanmalı (sıralama önemli!)
  @Get('brands')
  getBrands() {
    return this.vehicleBrandService.getBrands();
  }

  @Get('fuel-types')
  getFuelTypes() {
    return this.vehicleBrandService.getFuelTypes();
  }

  @Get('models')
  getModels(@Query('brand') brand?: string) {
    return this.vehicleBrandService.getModels(brand);
  }

  // Genel listeleme route'u - parametrik route'lardan ÖNCE ama spesifik route'lardan SONRA
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('brand') brand?: string,
    @Query('fuelType') fuelType?: string,
  ) {
    return this.vehicleBrandService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      search,
      brand,
      fuelType,
    );
  }

  // Parametrik route'lar - EN SONDA tanımlanmalı
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehicleBrandService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleBrandDto: UpdateVehicleBrandDto) {
    return this.vehicleBrandService.update(id, updateVehicleBrandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleBrandService.remove(id);
  }
}
