import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateVehicleDto, UpdateVehicleDto } from './dto';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) { }

  // ============= MAINTENANCE REMINDER ENDPOINTS =============
  // Note: These must be defined BEFORE :id routes to avoid route conflicts

  /**
   * Yaklaşan bakım hatırlatmalarını getir
   */
  @Get('reminders/upcoming')
  async getUpcomingReminders(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) daysAhead: number,
  ) {
    return this.vehicleService.getUpcomingReminders(daysAhead);
  }

  /**
   * Geçmiş (geçen) bakım hatırlatmalarını getir
   */
  @Get('reminders/overdue')
  async getOverdueReminders() {
    return this.vehicleService.getOverdueReminders();
  }

  /**
   * Tüm bakım hatırlatmalarını listele
   */
  @Get('reminders/all')
  async getAllReminders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('filter') filter?: 'upcoming' | 'overdue' | 'sent' | 'all',
  ) {
    return this.vehicleService.getAllReminders(page, limit, filter);
  }

  /**
   * Hatırlatma gönderildi olarak işaretle
   */
  @Post('reminders/:reminderId/mark-sent')
  async markReminderAsSent(@Param('reminderId') reminderId: string) {
    return this.vehicleService.markReminderAsSent(reminderId);
  }

  // ============= CRUD ENDPOINTS =============

  @Post()
  async create(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('customerId') customerId?: string,
    @Query('brand') brand?: string,
  ) {
    return this.vehicleService.findAll(page, limit, search, customerId, brand);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehicleService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicleService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.vehicleService.delete(id);
  }

  // ============= VEHICLE HISTORY ENDPOINT =============

  /**
   * Araç geçmişini getir
   * Tüm iş emirleri, işçilikler, kullanılan parçalar, teknisyenler ve faturalar
   */
  @Get(':id/history')
  async getVehicleHistory(@Param('id') id: string) {
    return this.vehicleService.getVehicleHistory(id);
  }
}

