import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto, UpdateTechnicianDto } from './dto';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  async create(@Body() dto: CreateTechnicianDto) {
    return this.technicianService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.technicianService.findAll(page, limit, search, active);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.technicianService.findOne(id);
  }

  @Get(':id/workload')
  async getWorkload(@Param('id') id: string) {
    return this.technicianService.getWorkload(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.technicianService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.technicianService.delete(id);
  }
}

