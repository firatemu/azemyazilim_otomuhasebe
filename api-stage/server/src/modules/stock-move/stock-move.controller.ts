import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { StockMoveService } from './stock-move.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PutAwayDto } from './dto/put-away.dto';
import { BulkPutAwayDto } from './dto/bulk-put-away.dto';
import { TransferDto } from './dto/transfer.dto';
import { AssignLocationDto } from './dto/assign-location.dto';
import { StockMoveType } from './dto/create-stock-move.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('stock-move')
@UseGuards(JwtAuthGuard)
@Controller('stock-move')
export class StockMoveController {
  constructor(private readonly stockMoveService: StockMoveService) { }

  @Get()
  @ApiQuery({ name: 'moveType', enum: StockMoveType, required: false })
  findAll(
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('locationId') locationId?: string,
    @Query('moveType') moveType?: StockMoveType,
    @Query('limit') limit?: number,
  ) {
    const limitValue = limit ? parseInt(limit.toString(), 10) : undefined;
    return this.stockMoveService.findAll(
      productId,
      warehouseId,
      locationId,
      moveType,
      limitValue,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockMoveService.findOne(id);
  }

  @Post('assign-location')
  assignLocation(
    @Body() assignLocationDto: AssignLocationDto,
    @CurrentUser() user: any,
  ) {
    return this.stockMoveService.assignLocation(
      assignLocationDto,
      user?.userId,
    );
  }

  @Post('put-away')
  putAway(@Body() putAwayDto: PutAwayDto, @CurrentUser() user: any) {
    return this.stockMoveService.putAway(putAwayDto, user?.userId);
  }

  @Post('put-away/bulk')
  bulkPutAway(
    @Body() bulkPutAwayDto: BulkPutAwayDto,
    @CurrentUser() user: any,
  ) {
    return this.stockMoveService.bulkPutAway(bulkPutAwayDto, user?.userId);
  }

  @Post('transfer')
  transfer(@Body() transferDto: TransferDto, @CurrentUser() user: any) {
    return this.stockMoveService.transfer(transferDto, user?.userId);
  }
}
