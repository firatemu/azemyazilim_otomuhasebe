import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SatisIrsaliyesiService } from './satis-irsaliyesi.service';
import { CreateSatisIrsaliyesiDto } from './dto/create-satis-irsaliyesi.dto';
import { UpdateSatisIrsaliyesiDto } from './dto/update-satis-irsaliyesi.dto';
import { FilterSatisIrsaliyesiDto } from './dto/filter-satis-irsaliyesi.dto';

@UseGuards(JwtAuthGuard)
@Controller('satis-irsaliyesi')
export class SatisIrsaliyesiController {
  constructor(
    private readonly satisIrsaliyesiService: SatisIrsaliyesiService,
  ) { }

  @Get()
  async findAll(@Query() filterDto: FilterSatisIrsaliyesiDto) {
    const result = await this.satisIrsaliyesiService.findAll(filterDto);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('pending/:cariId')
  async getPendingByCari(@Param('cariId') cariId: string) {
    return this.satisIrsaliyesiService.getPendingByCari(cariId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.satisIrsaliyesiService.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreateSatisIrsaliyesiDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.satisIrsaliyesiService.create(createDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSatisIrsaliyesiDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.satisIrsaliyesiService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.satisIrsaliyesiService.remove(id, userId);
  }
}
