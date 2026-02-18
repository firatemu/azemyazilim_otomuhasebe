import { Controller, Get, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  getAvailablePlans() {
    // Public endpoint - no auth required
    return this.plansService.getAvailablePlans();
  }
}

