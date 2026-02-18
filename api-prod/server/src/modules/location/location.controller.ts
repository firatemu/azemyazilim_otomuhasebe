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
import { LocationService } from './location.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@UseGuards(JwtAuthGuard)
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('active') active?: string,
    @Query('layer') layer?: number,
    @Query('corridor') corridor?: string,
  ) {
    try {
      console.log('🔍 [Location Controller] findAll çağrıldı', { warehouseId, active, layer, corridor });
      const activeValue = active === undefined ? undefined : active === 'true';
      const layerValue = layer ? parseInt(layer.toString(), 10) : undefined;
      return this.locationService.findAll(
        warehouseId,
        activeValue,
        layerValue,
        corridor,
      );
    } catch (error: any) {
      console.error('❌ [Location Controller] findAll hatası:', error);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.locationService.findByCode(code);
  }

  @Get('barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.locationService.findByBarcode(barcode);
  }

  @Post()
  create(@Body() createDto: CreateLocationDto) {
    return this.locationService.create(createDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateLocationDto) {
    return this.locationService.update(id, updateDto);
  }

  @Post('bulk/grid')
  createBulkGrid(
    @Body()
    body: {
      locations: Array<{
        warehouseId: string;
        layer: number;
        corridor: string;
        side: number;
        section: number;
        level: number;
        active: boolean;
      }>;
    },
  ) {
    return this.locationService.createBulkGrid(body.locations);
  }

  @Post('bulk/sections')
  createBulkSections(
    @Body()
    body: {
      warehouseId: string;
      layer: number;
      corridor: string;
      side: number;
      sectionCount: number;
    },
  ) {
    return this.locationService.createBulkSections(
      body.warehouseId,
      body.layer,
      body.corridor,
      body.side,
      body.sectionCount,
    );
  }

  @Post('bulk/levels')
  createBulkLevels(
    @Body()
    body: {
      warehouseId: string;
      layer: number;
      corridor: string;
      side: number;
      section: number;
      levelCount: number;
    },
  ) {
    return this.locationService.createBulkLevels(
      body.warehouseId,
      body.layer,
      body.corridor,
      body.side,
      body.section,
      body.levelCount,
    );
  }

  @Delete('all/delete-all')
  deleteAll() {
    return this.locationService.deleteAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(id);
  }
}
