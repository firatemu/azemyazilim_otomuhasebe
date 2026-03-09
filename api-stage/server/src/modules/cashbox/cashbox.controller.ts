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
} from '@nestjs/common';
import { CashboxService } from './cashbox.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCashboxDto } from './dto/create-cashbox.dto';
import { UpdateCashboxDto } from './dto/update-cashbox.dto';
import { CreateCashboxMovementDto } from './dto/create-cashbox-movement.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CashboxType } from './cashbox.enums';

@UseGuards(JwtAuthGuard)
@Controller('cashbox')
export class CashboxController {
    constructor(private readonly cashboxService: CashboxService) { }

    @Get()
    findAll(
        @Query('type') type?: CashboxType,
        @Query('isActive') isActive?: string,
    ) {
        const isActiveValue = isActive === undefined ? undefined : isActive === 'true';
        return this.cashboxService.findAll(type, isActiveValue);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cashboxService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateCashboxDto, @CurrentUser() user: any) {
        return this.cashboxService.create(dto, user?.userId);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateCashboxDto,
        @CurrentUser() user: any,
    ) {
        return this.cashboxService.update(id, dto, user?.userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cashboxService.remove(id);
    }

    @Post('movement')
    createMovement(
        @Body() dto: CreateCashboxMovementDto,
        @CurrentUser() user: any,
    ) {
        return this.cashboxService.createMovement(dto, user?.userId);
    }

    @Delete('movement/:id')
    deleteMovement(@Param('id') id: string) {
        return this.cashboxService.deleteMovement(id);
    }

    @Get(':id/pending-transfers')
    getPendingTransfers(@Param('id') id: string) {
        return this.cashboxService.getPendingPOSTransfers(id);
    }
}
