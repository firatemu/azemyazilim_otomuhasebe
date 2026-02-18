import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    // Check if subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: createPaymentDto.subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${createPaymentDto.subscriptionId} not found`);
    }

    return this.prisma.payment.create({
      data: {
        subscriptionId: createPaymentDto.subscriptionId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'TRY',
        status: createPaymentDto.status || 'PENDING',
        ...(createPaymentDto.iyzicoPaymentId && { iyzicoPaymentId: createPaymentDto.iyzicoPaymentId }),
        ...(createPaymentDto.iyzicoToken && { iyzicoToken: createPaymentDto.iyzicoToken }),
        ...(createPaymentDto.conversationId && { conversationId: createPaymentDto.conversationId }),
      },
      include: {
        subscription: {
          include: {
            tenant: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: {
        subscription: {
          include: {
            tenant: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findBySubscriptionId(subscriptionId: string) {
    return this.prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const updateData: any = {};
    
    if (updatePaymentDto.status) updateData.status = updatePaymentDto.status;
    if (updatePaymentDto.iyzicoPaymentId) updateData.iyzicoPaymentId = updatePaymentDto.iyzicoPaymentId;
    if (updatePaymentDto.iyzicoToken) updateData.iyzicoToken = updatePaymentDto.iyzicoToken;
    if (updatePaymentDto.conversationId) updateData.conversationId = updatePaymentDto.conversationId;
    if (updatePaymentDto.invoiceNumber) updateData.invoiceNumber = updatePaymentDto.invoiceNumber;
    if (updatePaymentDto.invoiceUrl) updateData.invoiceUrl = updatePaymentDto.invoiceUrl;
    if (updatePaymentDto.paidAt) updateData.paidAt = updatePaymentDto.paidAt;
    if (updatePaymentDto.failedAt) updateData.failedAt = updatePaymentDto.failedAt;
    if (updatePaymentDto.refundedAt) updateData.refundedAt = updatePaymentDto.refundedAt;
    if (updatePaymentDto.errorCode) updateData.errorCode = updatePaymentDto.errorCode;
    if (updatePaymentDto.errorMessage) updateData.errorMessage = updatePaymentDto.errorMessage;
    if (updatePaymentDto.paymentMethod) updateData.paymentMethod = updatePaymentDto.paymentMethod;

    return this.prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        subscription: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}

