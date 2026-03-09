import { BadRequestException, Injectable, Logger } from '@nestjs/common';

/**
 * @deprecated E-Invoice functionality has been disabled (Hızlı Bilişim module removed)
 */
@Injectable()
export class EInvoiceService {
  private readonly logger = new Logger(EInvoiceService.name);

  async sendSalesInvoiceAsEInvoice(invoiceId: string) {
    throw new BadRequestException(
      'E-Invoice gönderimi bu sürümde devre dışı bırakılmıştır.',
    );
  }

  async sendPurchaseInvoiceAsEInvoice(invoiceId: string) {
    throw new BadRequestException(
      'E-Invoice gönderimi bu sürümde devre dışı bırakılmıştır.',
    );
  }

  async sendToHizli(invoiceId: string) {
    throw new BadRequestException(
      'E-Invoice gönderimi bu sürümde devre dışı bırakılmıştır.',
    );
  }
}
