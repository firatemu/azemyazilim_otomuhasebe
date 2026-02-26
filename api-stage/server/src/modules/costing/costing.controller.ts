import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CostingService } from './costing.service';
import { CalculateBulkCostDto } from './dto/calculate-bulk-cost.dto';
import { CalculateCostDto } from './dto/calculate-cost.dto';
import { GetCostingQueryDto } from './dto/get-costing-query.dto';

@Controller('costing')
export class CostingController {
  constructor(private readonly costingService: CostingService) {}

  @Get('latest')
  getLatest(@Query() query: GetCostingQueryDto) {
    return this.costingService.getLatestCosts(query);
  }

  @Post('calculate')
  calculate(@Body() body: CalculateCostDto) {
    return this.costingService.calculateWeightedAverageCost(body.stokId);
  }

  @Post('calculate-bulk')
  calculateBulk(@Body() body: CalculateBulkCostDto) {
    return this.costingService.calculateWeightedAverageCostBulk(body.stokIds);
  }
}
