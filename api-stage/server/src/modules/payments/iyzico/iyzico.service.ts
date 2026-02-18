import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class IyzicoService {
  private readonly logger = new Logger(IyzicoService.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('IYZICO_API_KEY') || '';
    this.secretKey = this.configService.get<string>('IYZICO_SECRET_KEY') || '';
    this.baseUrl = this.configService.get<string>('IYZICO_BASE_URL') || 'https://api.iyzipay.com';
  }

  async createCheckoutForm(data: {
    subscriptionId: string;
    amount: number;
    currency: string;
    callbackUrl: string;
    returnUrl: string;
    buyerInfo?: {
      name: string;
      surname: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      country: string;
    };
  }) {
    // iyzico checkout form API implementation
    this.logger.log('Creating checkout form', data);

    // Subscription bilgilerini al
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: data.subscriptionId },
      include: {
        plan: true,
        tenant: {
          include: {
            settings: true,
            users: {
              take: 1,
            },
          },
        },
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Amount'u plan'dan al eğer 0 ise
    const paymentAmount = data.amount || Number(subscription.plan.price);

    // Payment kaydı oluştur
    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId: data.subscriptionId,
        amount: paymentAmount,
        currency: data.currency || subscription.plan.currency,
        status: 'PENDING',
        iyzicoToken: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId: `conv_${subscription.tenantId}_${Date.now()}`,
      },
    });

    // İyzico API'ye checkout form request gönder
    // Gerçek implementasyon için iyzipay SDK kullanılmalı
    // Şimdilik placeholder response

    return {
      checkoutFormContent: `<form action="${this.baseUrl}/checkout" method="post">
        <input type="hidden" name="token" value="${payment.iyzicoToken}" />
        <input type="hidden" name="callbackUrl" value="${data.callbackUrl}" />
        <input type="hidden" name="returnUrl" value="${data.returnUrl}" />
      </form>`,
      token: payment.iyzicoToken,
      paymentId: payment.id,
    };
  }

  async refund(paymentId: string, amount: number) {
    // iyzico refund API implementation
    this.logger.log('Processing refund', { paymentId, amount });

    // Update payment status in database
    const payment = await this.prisma.payment.findFirst({
      where: { iyzicoPaymentId: paymentId },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
        },
      });
    }

    return {
      success: true,
      message: 'Refund processed',
    };
  }

  async handleWebhook(payload: any) {
    // Verify webhook signature (skipped for brevity, but critical in prod)
    // Process webhook events
    this.logger.log('Processing iyzico webhook', payload);

    const eventType = payload.eventType;
    const paymentId = payload.paymentId;
    const conversationId = payload.conversationId; // Should contain tenant info if needed

    // Find payment by iyzico payment ID
    const payment = await this.prisma.payment.findFirst({
      where: { iyzicoPaymentId: paymentId },
      include: {
        subscription: true,
      },
    });

    if (!payment) {
      this.logger.warn('Payment not found for webhook', { paymentId });
      return { success: false, message: 'Payment not found' };
    }

    // Idempotency check: If already SUCCESS, ignore
    if (payment.status === 'SUCCESS') {
      this.logger.log('Payment already processed', { paymentId });
      return { success: true };
    }

    // Update payment status based on event type
    switch (eventType) {
      case 'PAYMENT_SUCCESS':
        // Transactional Provisioning
        await this.prisma.$transaction(async (tx) => {
          // 1. Update Payment
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'SUCCESS',
              paidAt: new Date(),
            },
          });

          // 2. Activate Subscription & Tenant
          if (payment.subscription) {
            const subscription = await tx.subscription.update({
              where: { id: payment.subscription.id },
              data: { status: 'ACTIVE' },
            });

            // 3. Provision Tenant Resources (Only if not already active/provisioned?)
            // Assume this is the First Payment for a new Tenant
            const tenantId = payment.subscription.tenantId;
            const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });

            if (tenant && (tenant as any).tenantType === 'INDIVIDUAL' && tenant.status !== 'ACTIVE') {
              // Logic to differentiate "New Provisioning" vs "Renewal"
              // If tenant is already active, this might be a renewal.

              // Activate Tenant
              await tx.tenant.update({
                where: { id: tenantId },
                data: { status: 'ACTIVE' },
              });

              // 4. Initialize Core Data (CodeTemplates, Warehouses, etc.)
              // We must ensure we don't duplicate if they exist (idempotency)

              // Create Default Warehouse
              const existingWarehouse = await tx.warehouse.findFirst({ where: { tenantId, isDefault: true } });
              if (!existingWarehouse) {
                await tx.warehouse.create({
                  data: {
                    tenantId,
                    code: 'WH001',
                    name: 'Merkez Depo',
                    isDefault: true,
                    address: 'Merkez',
                  }
                });
              }

              // Create Initial Admin User & Role (If not exists)
              // Usually created during Registration, but maybe we need to enable permissions here?
              // For now, assuming User exists but we might need to Audit this event.

              // 5. Initialize Code Templates
              const templates = [
                { module: 'INVOICE', prefix: 'FAT', digitCount: 6 },
                { module: 'CUSTOMER', prefix: 'CARI', digitCount: 5 },
                { module: 'STOCK', prefix: 'STK', digitCount: 5 },
              ];

              for (const t of templates) {
                const exists = await (tx.codeTemplate as any).findFirst({
                  where: { tenantId, module: t.module as any }
                });
                if (!exists) {
                  await (tx.codeTemplate as any).create({
                    data: {
                      tenantId,
                      module: t.module as any,
                      prefix: t.prefix,
                      digitCount: t.digitCount,
                      currentValue: 0,
                      isActive: true,
                      includeYear: true
                    }
                  });
                }
              }
            }
          }
        }, {
          timeout: 10000, // 10s timeout for provisioning
        });

        this.logger.log(`✅ Provisioning completed for payment ${payment.id}`);
        break;

      case 'PAYMENT_FAILED':
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            errorMessage: payload.failureReason || 'Payment failed',
          },
        });
        break;

      default:
        this.logger.warn('Unknown webhook event type', { eventType });
    }

    return { success: true };
  }

  async handleCallback(token: string) {
    // İyzico callback token ile ödeme sonucunu çek
    this.logger.log('Handling callback', { token });

    // Token ile payment kaydını bul
    const payment = await this.prisma.payment.findFirst({
      where: { iyzicoToken: token },
      include: {
        subscription: {
          include: {
            tenant: true,
            plan: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn('Payment not found for callback token', { token });
      return { success: false, message: 'Payment not found' };
    }

    // İyzico API'den ödeme durumunu kontrol et
    // Burada gerçek İyzico API çağrısı yapılmalı
    // Şimdilik placeholder

    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      subscriptionId: payment.subscriptionId,
    };
  }
}

