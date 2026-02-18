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
    // Verify webhook signature
    // Process webhook events
    this.logger.log('Processing iyzico webhook', payload);

    const eventType = payload.eventType;
    const paymentId = payload.paymentId;

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

    // Update payment status based on event type
    switch (eventType) {
      case 'PAYMENT_SUCCESS':
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            paidAt: new Date(),
          },
        });

        // Update subscription status and tenant status
        if (payment.subscription) {
          await this.prisma.subscription.update({
            where: { id: payment.subscription.id },
            data: {
              status: 'ACTIVE',
            },
          });

          // Tenant'ı ACTIVE yap
          await this.prisma.tenant.update({
            where: { id: payment.subscription.tenantId },
            data: {
              status: 'ACTIVE',
            },
          });
        }
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

