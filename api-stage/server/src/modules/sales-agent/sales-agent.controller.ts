import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
} from '@nestjs/common';
import { SalesAgentService } from './sales-agent.service';
import { CreateSalesAgentDto } from './dto/create-sales-agent.dto';
import { UpdateSalesAgentDto } from './dto/update-sales-agent.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('sales-agent')
@UseGuards(JwtAuthGuard)
export class SalesAgentController {
    constructor(private readonly salesAgentService: SalesAgentService) { }

    @Post()
    create(@Body() createDto: CreateSalesAgentDto, @Req() req: any) {
        return this.salesAgentService.create(createDto, req.user?.id);
    }

    @Get()
    findAll() {
        return this.salesAgentService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesAgentService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateSalesAgentDto) {
        return this.salesAgentService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.salesAgentService.remove(id);
    }
}
