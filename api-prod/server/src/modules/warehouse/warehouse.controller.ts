import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@UseGuards(JwtAuthGuard)
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  findAll(@Query('active') active?: string) {
    const activeValue = active === undefined ? undefined : active === 'true';
    return this.warehouseService.findAll(activeValue);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.warehouseService.findByCode(code);
  }

  @Get('default/get')
  getDefault() {
    return this.warehouseService.getDefaultWarehouse();
  }

  @Get(':id/inventory')
  getInventory(@Param('id') id: string) {
    return this.warehouseService.getWarehouseStock(id);
  }

  @Get(':id/stock-report')
  getStockReport(@Param('id') id: string) {
    return this.warehouseService.getWarehouseStock(id);
  }

  @Post()
  create(@Body() createDto: CreateWarehouseDto) {
    return this.warehouseService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateWarehouseDto) {
    return this.warehouseService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }
}
