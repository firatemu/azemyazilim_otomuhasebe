import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateEmployeeOdemeDto } from './dto/create-employee-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';


@Controller('employee')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Özel route'lar önce tanımlanmalı

  @Get('stats')
  async getStats(
    @Query('department') department?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBoolean =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.employeeService.getStats(department, isActiveBoolean);
  }

  @Get('departmentlar')
  async getDepartmanlar() {
    return this.employeeService.getDepartmanlar();
  }

  // Genel listele endpoint'i
  @Get()
  async findAll(
    @Query('isActive') isActive?: string,
    @Query('department') department?: string,
  ) {
    const isActiveBoolean =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.employeeService.findAll(isActiveBoolean, department);
  }

  @Post()
  async create(@Body() createDto: CreateEmployeeDto, @Request() req) {
    return this.employeeService.create(createDto, req.user.userId);
  }

  // Parametrik route'lar en sona konmalı
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeDto,
    @Request() req,
  ) {
    return this.employeeService.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }

  // Ödeme işlemleri
  @Post('odeme')
  async createOdeme(
    @Body() createOdemeDto: CreateEmployeeOdemeDto,
    @Request() req,
  ) {
    return this.employeeService.createOdeme(createOdemeDto, req.user.userId);
  }

  @Get(':id/payments')
  async getOdemeler(@Param('id') employeeId: string) {
    return this.employeeService.getOdemeler(employeeId);
  }
}
