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
import { SatınAlmaIrsaliyesiService } from './satin-alma-irsaliyesi.service';
import { CreateSatınAlmaIrsaliyesiDto } from './dto/create-satin-alma-irsaliyesi.dto';
import { UpdateSatınAlmaIrsaliyesiDto } from './dto/update-satin-alma-irsaliyesi.dto';
import { FilterSatınAlmaIrsaliyesiDto } from './dto/filter-satin-alma-irsaliyesi.dto';

@UseGuards(JwtAuthGuard)
@Controller('satin-alma-irsaliyesi')
export class SatınAlmaIrsaliyesiController {
  constructor(
    private readonly satınAlmaIrsaliyesiService: SatınAlmaIrsaliyesiService,
  ) {}

  @Get()
  async findAll(@Query() filterDto: FilterSatınAlmaIrsaliyesiDto) {
    const result = await this.satınAlmaIrsaliyesiService.findAll(filterDto);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.satınAlmaIrsaliyesiService.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreateSatınAlmaIrsaliyesiDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.satınAlmaIrsaliyesiService.create(createDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSatınAlmaIrsaliyesiDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.satınAlmaIrsaliyesiService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.satınAlmaIrsaliyesiService.remove(id, userId);
  }
}

