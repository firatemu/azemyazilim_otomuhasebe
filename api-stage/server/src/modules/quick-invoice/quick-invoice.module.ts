import { Module } from '@nestjs/common';
import { QuickInvoiceController } from './quick-invoice.controller';
import { QuickInvoiceService } from './quick-invoice.service';

@Module({
  controllers: [QuickInvoiceController],
  providers: [QuickInvoiceService],
  exports: [QuickInvoiceService],
})
export class QuickInvoiceModule {}

