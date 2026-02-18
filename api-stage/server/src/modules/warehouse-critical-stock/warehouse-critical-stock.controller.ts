import { Controller, Get, Put, Body, Param, Query } from '@nestjs/common';
import { WarehouseCriticalStockService } from './warehouse-critical-stock.service';

@Controller('warehouse-critical-stock')
export class WarehouseCriticalStockController {
    constructor(private readonly service: WarehouseCriticalStockService) { }

    @Put(':warehouseId/:productId')
    updateCriticalStock(
        @Param('warehouseId') warehouseId: string,
        @Param('productId') productId: string,
        @Body('criticalQty') criticalQty: number,
    ) {
        return this.service.updateCriticalStock(warehouseId, productId, criticalQty);
    }

    @Get('report')
    getCriticalStockReport() {
        return this.service.getCriticalStockReport();
    }

    @Put('bulk-update')
    bulkUpdate(@Body() data: { stokKodu: string; ambarKodu: string; criticalQty: number }[]) {
        return this.service.bulkUpdateFromExcel(data);
    }
}
