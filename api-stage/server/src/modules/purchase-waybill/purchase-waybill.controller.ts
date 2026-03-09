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
import { PurchaseWaybillService } from './purchase-waybill.service';
import { CreatePurchaseWaybillDto } from './dto/create-purchase-waybill.dto';
import { UpdatePurchaseWaybillDto } from './dto/update-purchase-waybill.dto';
import { FilterPurchaseWaybillDto } from './dto/filter-purchase-waybill.dto';

@UseGuards(JwtAuthGuard)
@Controller('purchase-waybill')
export class PurchaseWaybillController {
  constructor(
    private readonly purchaseWaybillService: PurchaseWaybillService,
  ) { }

  @Get()
  async findAll(@Query() filterDto: FilterPurchaseWaybillDto) {
    const result = await this.purchaseWaybillService.findAll(filterDto);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.purchaseWaybillService.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreatePurchaseWaybillDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.purchaseWaybillService.create(createDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseWaybillDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.purchaseWaybillService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.purchaseWaybillService.remove(id, userId);
  }
}

