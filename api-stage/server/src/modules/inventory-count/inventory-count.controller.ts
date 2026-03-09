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
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiQuery } from '@nestjs/swagger';
import { InventoryCountService } from './inventory-count.service';
import { InventoryCountExportService } from './inventory-count-export.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateInventoryCountDto } from './dto/create-inventory-count.dto';
import { UpdateInventoryCountDto } from './dto/update-inventory-count.dto';
import { AddItemDto } from './dto/add-item.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InventoryCountType, InventoryCountStatus } from './dto/create-inventory-count.dto';

const INVENTORY_COUNT_TYPE_QUERY = ['PRODUCT_BASED', 'SHELF_BASED'] as const;
const INVENTORY_COUNT_STATUS_QUERY = ['DRAFT', 'COMPLETED', 'APPROVED', 'CANCELLED'] as const;

@UseGuards(JwtAuthGuard)
@Controller('inventory-count')
export class InventoryCountController {
    constructor(
        private readonly inventoryCountService: InventoryCountService,
        private readonly inventoryCountExportService: InventoryCountExportService,
    ) { }

    @Get()
    @ApiQuery({ name: 'countType', required: false, enum: INVENTORY_COUNT_TYPE_QUERY })
    @ApiQuery({ name: 'status', required: false, enum: INVENTORY_COUNT_STATUS_QUERY })
    findAll(
        @Query('countType') countType?: string,
        @Query('status') status?: string,
    ) {
        return this.inventoryCountService.findAll(countType as InventoryCountType | undefined, status as InventoryCountStatus | undefined);
    }

    @Get('barcode/product/:barcode')
    findProductByBarcode(@Param('barcode') barcode: string) {
        return this.inventoryCountService.findProductByBarcode(barcode);
    }

    @Get('barcode/location/:barcode')
    findLocationByBarcode(@Param('barcode') barcode: string) {
        return this.inventoryCountService.findLocationByBarcode(barcode);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.inventoryCountService.findOne(id);
    }

    @Post()
    create(@Body() createInventoryCountDto: CreateInventoryCountDto, @CurrentUser() user: any) {
        return this.inventoryCountService.create(createInventoryCountDto, user?.userId);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateInventoryCountDto: UpdateInventoryCountDto,
        @CurrentUser() user: any,
    ) {
        return this.inventoryCountService.update(id, updateInventoryCountDto, user?.userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.inventoryCountService.remove(id);
    }

    @Put(':id/complete')
    complete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.inventoryCountService.complete(id, user?.userId);
    }

    @Put(':id/approve')
    approve(@Param('id') id: string, @CurrentUser() user: any) {
        return this.inventoryCountService.approve(id, user?.userId);
    }

    @Post(':id/item')
    addItem(@Param('id') id: string, @Body() addItemDto: AddItemDto) {
        return this.inventoryCountService.addItem(id, addItemDto);
    }

    @Get(':id/export/excel')
    async exportExcel(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.inventoryCountExportService.generateExcel(id);
        const inventoryCount = await this.inventoryCountService.findOne(id);

        res.set({
            'Content-Type':
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="Inventory_Count_${inventoryCount.stocktakeNo}_${new Date().getTime()}.xlsx"`,
            'Content-Length': buffer.length,
        });

        res.send(buffer);
    }

    @Get(':id/export/pdf')
    async exportPdf(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.inventoryCountExportService.generatePdf(id);
        const inventoryCount = await this.inventoryCountService.findOne(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Inventory_Count_${inventoryCount.stocktakeNo}_${new Date().getTime()}.pdf"`,
            'Content-Length': buffer.length,
        });

        res.send(buffer);
    }
}
