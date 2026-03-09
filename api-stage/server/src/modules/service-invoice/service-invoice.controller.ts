import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ServiceInvoiceService } from './service-invoice.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('service-invoice')
export class ServiceInvoiceController {
  constructor(private readonly serviceInvoiceService: ServiceInvoiceService) {}

  @Post('from-work-order/:workOrderId')
  createFromWorkOrder(
    @Param('workOrderId') workOrderId: string,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.serviceInvoiceService.createFromWorkOrder(workOrderId, userId);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('accountId') accountId?: string,
  ) {
    return this.serviceInvoiceService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      search,
      accountId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceInvoiceService.findOne(id);
  }
}
