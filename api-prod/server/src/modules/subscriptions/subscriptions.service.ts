import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionStatus, TenantStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto & { planName?: string; billingType?: string }) {
    const { tenantId, planId, planName, startDate, endDate, billingType, paymentMethod = 'credit_card' } = createSubscriptionDto;
    
    // Check if tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // Check if subscription already exists
    const existing = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (existing) {
      throw new BadRequestException('Tenant already has a subscription');
    }

    // Eğer planName verilmişse, planId'yi bul
    let finalPlanId = planId;
    if (planName && !planId) {
      const planSlug = planName.toLowerCase();
      const plan = await this.prisma.plan.findFirst({
        where: { slug: planSlug },
      });
      if (!plan) {
        throw new NotFoundException(`Plan '${planName}' bulunamadı`);
      }
      finalPlanId = plan.id;
    }

    if (!finalPlanId) {
      throw new BadRequestException('Plan ID veya Plan Name gerekli');
    }

    // Calculate dates - yıllık abonelik için 1 yıl
    const now = new Date();
    const subscriptionStartDate = startDate ? new Date(startDate) : now;
    let subscriptionEndDate: Date;
    
    if (endDate) {
      subscriptionEndDate = new Date(endDate);
    } else if (billingType === 'annual' || billingType === 'yearly') {
      subscriptionEndDate = new Date(now);
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // 1 yıl
    } else {
      subscriptionEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
    }

    // Banka havalesi seçildiyse PENDING, kredi kartı ise ACTIVE
    const subscriptionStatus = paymentMethod === 'bank_transfer' ? SubscriptionStatus.PENDING : SubscriptionStatus.ACTIVE;

    const subscription = await this.prisma.subscription.create({
      data: {
        id: require('uuid').v4(),
        tenantId,
        planId: finalPlanId,
        status: subscriptionStatus,
        startDate: subscriptionStartDate,
        endDate: subscriptionEndDate,
        trialEndsAt: null,
        autoRenew: paymentMethod === 'credit_card', // Banka havalesinde otomatik yenileme yok
        nextBillingDate: subscriptionEndDate,
      },
      include: {
        plan: true,
        tenant: true,
      },
    });

    // Payment kaydı oluştur (banka havalesi için)
    if (paymentMethod === 'bank_transfer') {
      const plan = await this.prisma.plan.findUnique({
        where: { id: finalPlanId },
      });
      
      if (plan) {
        await this.prisma.payment.create({
          data: {
            subscriptionId: subscription.id,
            amount: plan.price,
            currency: plan.currency || 'TRY',
            status: 'PENDING',
            paymentMethod: 'bank_transfer',
          },
        });
      }
    }

    return subscription;
  }

  async findAll() {
    return this.prisma.subscription.findMany({
      include: {
        tenant: {
          include: {
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        tenant: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async findByTenantId(tenantId: string) {
    return this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        tenant: true,
      },
    });
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
      include: {
        tenant: true,
      },
    });
  }

  async cancel(id: string) {
    return this.prisma.subscription.update({
      where: { id },
      data: {
        autoRenew: false,
        canceledAt: new Date(),
        status: SubscriptionStatus.CANCELED,
      },
    });
  }

  async reactivate(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Abonelik bulunamadı');
    }

    if (subscription.status !== SubscriptionStatus.CANCELED) {
      throw new BadRequestException('Sadece iptal edilmiş abonelikler tekrar aktif edilebilir');
    }

    const now = new Date();
    // Eğer endDate geçmişteyse, yeni bir endDate hesapla (1 yıl sonra)
    let endDate = subscription.endDate;
    if (endDate < now) {
      endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Aboneliği tekrar aktif et
    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        autoRenew: true,
        canceledAt: null,
        startDate: now,
        endDate: endDate,
        nextBillingDate: endDate,
      },
      include: {
        plan: true,
        tenant: true,
      },
    });

    // Tenant'ı da aktif et (eğer varsa)
    if (subscription.tenantId) {
      await this.prisma.tenant.update({
        where: { id: subscription.tenantId },
        data: { status: TenantStatus.ACTIVE },
      });
    }

    return updatedSubscription;
  }

  async remove(id: string) {
    return this.prisma.subscription.delete({
      where: { id },
    });
  }

  async startTrial(userId?: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Kullanıcıyı bul
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Tenant yoksa oluştur
    let tenant = user.tenant;
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name: user.fullName || user.email,
          status: TenantStatus.TRIAL,
        },
      });

      // User'ın tenantId'sini güncelle
      await this.prisma.user.update({
        where: { id: userId },
        data: { tenantId: tenant.id },
      });
    }

    // Mevcut abonelik var mı kontrol et
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
    });

    if (existingSubscription) {
      // Eğer deneme aboneliği varsa, hata ver
      if (existingSubscription.status === SubscriptionStatus.TRIAL) {
        throw new BadRequestException('Zaten bir deneme aboneliğiniz var');
      }
      // Eğer aktif abonelik varsa, hata ver
      if (existingSubscription.status === SubscriptionStatus.ACTIVE) {
        throw new BadRequestException('Zaten aktif bir aboneliğiniz var');
      }
    }

    // Deneme paketini bul (slug: 'trial')
    const trialPlan = await this.prisma.plan.findFirst({
      where: { slug: 'trial' },
    });

    if (!trialPlan) {
      throw new NotFoundException('Deneme paketi bulunamadı');
    }

    // Deneme aboneliği oluştur
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 gün

    const subscription = await this.prisma.subscription.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        planId: trialPlan.id,
        status: SubscriptionStatus.TRIAL,
        startDate: now,
        endDate: trialEnd,
        trialEndsAt: trialEnd,
        autoRenew: false,
      },
      include: {
        plan: true,
        tenant: true,
      },
    });

    // Tenant status'unu güncelle
    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: { status: TenantStatus.TRIAL },
    });

    return subscription;
  }

  async upgradeFromTrial(userId: string, planName: string) {
    // Kullanıcıyı bul
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: { include: { subscription: { include: { plan: true } } } } },
    });

    if (!user || !user.tenant) {
      throw new NotFoundException('Kullanıcı veya tenant bulunamadı');
    }

    const tenant = user.tenant;
    const existingSubscription = tenant.subscription;

    // Eğer abonelik yoksa veya deneme değilse hata ver
    if (!existingSubscription) {
      throw new BadRequestException('Deneme aboneliği bulunamadı');
    }

    if (existingSubscription.status !== SubscriptionStatus.TRIAL) {
      throw new BadRequestException('Sadece deneme aboneliği yükseltilebilir');
    }

    // Plan adını slug'a çevir
    const planSlug = planName.toLowerCase();
    const plan = await this.prisma.plan.findFirst({
      where: { slug: planSlug },
    });

    if (!plan) {
      throw new NotFoundException(`Plan '${planName}' bulunamadı`);
    }

    // Yıllık abonelik için tarihleri hesapla
    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 yıl

    // Mevcut aboneliği güncelle
    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        endDate: endDate,
        trialEndsAt: null,
        autoRenew: true,
        nextBillingDate: endDate,
      },
      include: {
        plan: true,
        tenant: true,
      },
    });

    // Tenant status'unu güncelle
    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: { status: TenantStatus.ACTIVE },
    });

    return updatedSubscription;
  }
}

