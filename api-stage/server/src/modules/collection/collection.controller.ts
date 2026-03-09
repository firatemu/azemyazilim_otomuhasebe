import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { CollectionService } from './collection.service';
import { CollectionExportService } from './collection-export.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CreateCrossPaymentDto } from './dto/create-cross-payment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CollectionType, PaymentMethod } from './collection.enums';

const COLLECTION_TYPE_QUERY = ['COLLECTION', 'PAYMENT'] as const;
const PAYMENT_METHOD_QUERY = ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHECK', 'PROMISSORY_NOTE'] as const;

@UseGuards(JwtAuthGuard)
@Controller('collection')
export class CollectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly collectionExportService: CollectionExportService,
  ) { }

  @Post()
  create(@Body() dto: CreateCollectionDto, @CurrentUser() user: any) {
    return this.collectionService.create(dto, user.userId);
  }

  @Post('capraz-odeme')
  createCrossPayment(
    @Body() dto: CreateCrossPaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.collectionService.createCrossPayment(dto, user.userId);
  }

  @Get()
  @ApiQuery({ name: 'type', required: false, enum: COLLECTION_TYPE_QUERY })
  @ApiQuery({ name: 'paymentMethod', required: false, enum: PAYMENT_METHOD_QUERY })
  findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 50,
    @Query('type') type?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('accountId') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cashboxId') cashboxId?: string,
    @Query('bankAccountId') bankAccountId?: string,
    @Query('companyCreditCardId') companyCreditCardId?: string,
  ) {
    return this.collectionService.findAll(
      page,
      limit,
      type as CollectionType | undefined,
      paymentMethod as PaymentMethod | undefined,
      accountId,
      startDate,
      endDate,
      cashboxId,
      bankAccountId,
      companyCreditCardId,
    );
  }

  @Get('stats')
  getStats() {
    return this.collectionService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.collectionService.delete(id);
  }
}
