import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RaporlamaService } from './raporlama.service';
import { OverviewQueryDto } from './dto/overview-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('raporlama')
export class RaporlamaController {
  constructor(private readonly raporlamaService: RaporlamaService) { }

  @Get('overview')
  getOverview(@Query() query: OverviewQueryDto) {
    return this.raporlamaService.getOverview(query);
  }

  @Get('salesperson-performance')
  getSalespersonPerformance(@Query() query: OverviewQueryDto) {
    return this.raporlamaService.getSalespersonPerformance(query);
  }
}
