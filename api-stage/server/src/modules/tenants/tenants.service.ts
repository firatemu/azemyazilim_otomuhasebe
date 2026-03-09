import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';

import { CipherService } from '../../common/services/cipher.service';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    private cipherService: CipherService,
  ) { }

  async create(createTenantDto: CreateTenantDto) {
    return this.prisma.extended.tenant.create({
      data: createTenantDto,
    });
  }

  async findAll() {
    return this.prisma.extended.tenant.findMany({
      include: {
        users: true,
        subscription: true,
      },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.extended.tenant.findUnique({
      where: { id },
      include: {
        users: true,
        subscription: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    return this.prisma.extended.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string) {
    return this.prisma.extended.tenant.delete({
      where: { id },
    });
  }

  async getCurrent(id: string) {
    if (!id) return null;

    const tenant = await this.prisma.extended.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async approveTrial(tenantId: string) {
    // Önce tenant'ı plan olmadan çek (Prisma null plan hatası vermesin)
    const tenant = await this.prisma.extended.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscription: true, // Plan olmadan subscription'ı çek
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // Sadece PENDING veya TRIAL statusundaki deneme paketlerini onayla
    if (tenant.status !== 'PENDING' && tenant.status !== 'TRIAL') {
      throw new BadRequestException('Tenant zaten onaylanmış veya farklı bir statusda');
    }

    if (!tenant.subscription) {
      throw new BadRequestException('Subscription not found for tenant');
    }

    // Plan'ı ayrı bir sorgu ile çek (null olabilir)
    const plan = tenant.subscription.planId
      ? await this.prisma.extended.plan.findUnique({
        where: { id: tenant.subscription.planId },
      })
      : null;

    // Eğer plan varsa, deneme paketi kontrolü yap
    if (plan) {
      const isTrialPlan = plan.slug === 'trial' || Number(plan.price) === 0;
      if (!isTrialPlan) {
        throw new BadRequestException('Bu tenant deneme paketi değil, ödeme bekliyor');
      }
    } else {
      // Plan yoksa, sadece subscription status'ü PENDING ise onayla (geçmiş veri uyumluluğu için)
      if (tenant.subscription.status !== 'PENDING' && tenant.subscription.status !== 'TRIAL') {
        throw new BadRequestException('Subscription statusu onaylamaya uygun değil');
      }
    }

    // Tenant ve subscription'ı aktif yap
    // Plan'ı include etmeyelim (null olabilir, Prisma hatası verir)
    const updatedTenant = await this.prisma.extended.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'ACTIVE',
        subscription: {
          update: {
            status: 'ACTIVE',
          },
        },
      },
      include: {
        subscription: true, // Plan olmadan subscription'ı çek
        users: true,
      },
    });

    // Plan'ı ayrı çekip ekleyelim (eğer varsa)
    if (updatedTenant.subscription?.planId) {
      const updatedPlan = await this.prisma.extended.plan.findUnique({
        where: { id: updatedTenant.subscription.planId },
      });
      if (updatedPlan && updatedTenant.subscription) {
        (updatedTenant.subscription as any).plan = updatedPlan;
      }
    }

    return updatedTenant;
  }

  async getSettings(tenantId: string) {
    if (!tenantId) {
      return null;
    }

    let settings = await this.prisma.extended.tenantSettings.findUnique({
      where: { tenantId },
    });

    // Eğer settings yoksa, boş bir kayıt oluştur
    if (!settings) {
      settings = await this.prisma.extended.tenantSettings.create({
        data: {
          tenantId,
        },
      });
    }

    return settings;
  }

  async updateSettings(tenantId: string, updateSettingsDto: UpdateTenantSettingsDto) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }

    // Encrypt sensitive fields if present
    const data = { ...updateSettingsDto };
    const sensitiveFields = ['smtpPassword', 'iyzicoSecretKey', 'gibPassword'];

    for (const field of sensitiveFields) {
      if ((data as any)[field]) {
        (data as any)[field] = await this.cipherService.encrypt((data as any)[field]);
      }
    }

    // Önce mevcut settings'i kontrol et
    let settings = await this.prisma.extended.tenantSettings.findUnique({
      where: { tenantId },
    });

    // Eğer yoksa oluştur
    if (!settings) {
      settings = await this.prisma.extended.tenantSettings.create({
        data: {
          tenantId,
          ...(data as any),
        },
      });
    } else {
      // Varsa güncelle
      settings = await this.prisma.extended.tenantSettings.update({
        where: { tenantId },
        data: (data as any),
      });
    }

    return settings;
  }

  async updateLogo(tenantId: string, logoUrl: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }

    // Settings var mı kontrol et
    let settings = await this.prisma.extended.tenantSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      settings = await this.prisma.extended.tenantSettings.create({
        data: {
          tenantId,
          logoUrl,
        },
      });
    } else {
      settings = await this.prisma.extended.tenantSettings.update({
        where: { tenantId },
        data: {
          logoUrl,
        },
      });
    }

    return settings;
  }
}

