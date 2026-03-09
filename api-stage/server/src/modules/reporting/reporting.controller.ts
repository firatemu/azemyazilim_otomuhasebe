import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReportingService } from './reporting.service';
import { OverviewQueryDto } from './dto/overview-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) { }

  @Get('overview')
  getOverview(@Query() query: OverviewQueryDto) {
    return this.reportingService.getOverview(query);
  }

  @Get('salesperson-performance')
  getSalespersonPerformance(@Query() query: OverviewQueryDto) {
    return this.reportingService.getSalespersonPerformance(query);
  }
}
