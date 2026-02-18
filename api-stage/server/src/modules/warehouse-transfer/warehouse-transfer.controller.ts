import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WarehouseTransferService } from './warehouse-transfer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateWarehouseTransferDto } from './dto/create-warehouse-transfer.dto';
import { UpdateWarehouseTransferDto } from './dto/update-warehouse-transfer.dto';

@UseGuards(JwtAuthGuard)
@Controller('warehouse-transfer')
export class WarehouseTransferController {
  constructor(
    private readonly warehouseTransferService: WarehouseTransferService,
  ) {}

  @Get()
  findAll(@Query('durum') durum?: string) {
    return this.warehouseTransferService.findAll(durum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseTransferService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWarehouseTransferDto, @Req() req: any) {
    dto.userId = req.user?.id;
    return this.warehouseTransferService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseTransferDto,
    @Req() req: any,
  ) {
    dto.userId = req.user?.id;
    return this.warehouseTransferService.update(id, dto);
  }

  @Put(':id/approve')
  approve(@Param('id') id: string, @Req() req: any) {
    return this.warehouseTransferService.approve(id, req.user?.id);
  }

  @Put(':id/complete')
  complete(@Param('id') id: string, @Req() req: any) {
    return this.warehouseTransferService.complete(id, req.user?.id);
  }

  @Put(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.warehouseTransferService.cancel(id, req.user?.id, reason);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseTransferService.remove(id);
  }
}
