import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('current')
  findCurrent(@Query('tenantId') tenantId: string) {
    if (!tenantId) {
      throw new Error('tenantId is required');
    }
    return this.subscriptionsService.findByTenantId(tenantId);
  }

  // Özel route'lar dinamik route'lardan ÖNCE olmalı
  @Post('start-trial')
  startTrial(@GetCurrentUser('userId') userId: string) {
    return this.subscriptionsService.startTrial(userId);
  }

  @Post('upgrade')
  upgrade(@GetCurrentUser('userId') userId: string, @Body() body: { planName: string }) {
    return this.subscriptionsService.upgradeFromTrial(userId, body.planName);
  }

  // Özel POST route'ları (cancel, reactivate gibi) dinamik route'lardan ÖNCE olmalı
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }

  @Post(':id/reactivate')
  reactivate(@Param('id') id: string) {
    return this.subscriptionsService.reactivate(id);
  }

  // Dinamik route'lar en sonda
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}

