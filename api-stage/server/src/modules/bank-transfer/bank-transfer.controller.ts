import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TransferType } from './dto/create-bank-transfer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BankTransferService } from './bank-transfer.service';
import { CreateBankTransferDto } from './dto/create-bank-transfer.dto';
import { FilterBankTransferDto } from './dto/filter-bank-transfer.dto';
import { UpdateBankTransferDto } from './dto/update-bank-transfer.dto';

@ApiTags('bank-transfer')
@UseGuards(JwtAuthGuard)
@Controller('bank-transfer')
export class BankTransferController {
  constructor(private readonly bankTransferService: BankTransferService) { }

  // Özel route'lar önce tanımlanmalı (stats, deleted vb.)
  @Get('stats')
  @ApiQuery({ name: 'transferType', enum: TransferType, required: false })
  getStats(
    @Query('cashboxId') cashboxId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('transferType') transferType?: TransferType,
  ) {
    return this.bankTransferService.getStats(
      cashboxId,
      startDate,
      endDate,
      transferType,
    );
  }

  @Get('deleted')
  findDeleted() {
    return this.bankTransferService.findDeleted();
  }

  // Genel listele endpoint'i
  @Get()
  findAll(@Query() filterDto: FilterBankTransferDto) {
    return this.bankTransferService.findAll(filterDto);
  }

  // Parametrik route'lar en sona konmalı
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankTransferService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateBankTransferDto, @CurrentUser() user: any) {
    return this.bankTransferService.create(createDto, user?.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBankTransferDto,
    @CurrentUser() user: any,
  ) {
    return this.bankTransferService.update(id, updateDto, user?.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('reason') reason?: string,
  ) {
    return this.bankTransferService.remove(id, user?.userId, reason);
  }
}
