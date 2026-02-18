import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Plan } from '@prisma/client';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async getAvailablePlans() {
    // Return hardcoded plans for now
    // In production, this could be stored in database
    return [
      {
        id: 'FREE',
        name: 'FREE',
        price: 0,
        maxCompanies: 1,
        maxInvoices: 100,
        features: ['1 Şirket', '100 Fatura/ay', 'Temel raporlar', 'Email destek'],
      },
      {
        id: 'BASIC',
        name: 'BASIC',
        price: 299,
        maxCompanies: 1,
        maxInvoices: 100,
        features: ['1 Şirket', '100 Fatura/ay', 'Temel raporlar', 'Email destek'],
      },
      {
        id: 'PROFESSIONAL',
        name: 'PROFESSIONAL',
        price: 599,
        maxCompanies: 3,
        maxInvoices: -1, // Unlimited
        features: ['3 Şirket', 'Sınırsız fatura', 'Gelişmiş raporlar', 'E-arşiv entegrasyonu', 'Öncelikli destek'],
      },
      {
        id: 'ENTERPRISE',
        name: 'ENTERPRISE',
        price: -1, // Custom pricing
        maxCompanies: -1, // Unlimited
        maxInvoices: -1, // Unlimited
        features: ['Sınırsız şirket', 'API erişimi', 'Özel entegrasyonlar', 'Dedicated hesap yöneticisi', 'SLA garantisi'],
      },
    ];
  }

  async getPlanLimits(planSlug: string) {
    // Database'den plan bilgisini al
    const plan = await this.prisma.plan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      throw new NotFoundException(`Plan ${planSlug} not found`);
    }

    const limits = plan.limits as any;
    return {
      maxCompanies: limits?.maxCompanies || 1,
      maxInvoices: limits?.maxInvoices || 100,
    };
  }
}

