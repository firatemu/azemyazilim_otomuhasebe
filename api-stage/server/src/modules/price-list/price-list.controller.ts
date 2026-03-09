import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PriceListService } from './price-list.service';
import { CreatePriceListDto } from './dto/create-price-list.dto';

@Controller('price-list')
export class PriceListController {
    constructor(private readonly priceListService: PriceListService) { }

    @Post()
    create(@Body() createDto: CreatePriceListDto) {
        return this.priceListService.create(createDto);
    }

    @Get('product/:productId')
    findStokPrice(
        @Param('productId') productId: string,
        @Query('accountId') accountId?: string,
    ) {
        return this.priceListService.findStokPrice(productId, accountId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.priceListService.findOne(id);
    }
}
