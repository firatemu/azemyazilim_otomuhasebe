import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';
import { WarehouseService } from '../warehouse/warehouse.service';

@Injectable()
export class TenantsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => WarehouseService))
    private warehouseService: WarehouseService,
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    const tenant = await this.prisma.tenant.create({
      data: createTenantDto,
    });

    // Yeni tenant için varsayılan ambar oluştur
    try {
      await this.warehouseService.createDefaultWarehouse(tenant.id);
    } catch (error) {
      console.error('Varsayılan ambar oluşturulamadı:', error);
      // Hata olsa bile tenant oluşturulmuş olsun
    }

    return tenant;
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        users: true,
        subscription: true,
      },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
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
    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string) {
    return this.prisma.tenant.delete({
      where: { id },
    });
  }

  async approveTrial(tenantId: string) {
    // Önce tenant'ı plan olmadan çek (Prisma null plan hatası vermesin)
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscription: true, // Plan olmadan subscription'ı çek
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // Sadece PENDING veya TRIAL durumundaki deneme paketlerini onayla
    if (tenant.status !== 'PENDING' && tenant.status !== 'TRIAL') {
      throw new BadRequestException('Tenant zaten onaylanmış veya farklı bir durumda');
    }

    if (!tenant.subscription) {
      throw new BadRequestException('Tenant için subscription bulunamadı');
    }

    // Plan'ı ayrı bir sorgu ile çek (null olabilir)
    const plan = tenant.subscription.planId
      ? await this.prisma.plan.findUnique({
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
        throw new BadRequestException('Subscription durumu onaylamaya uygun değil');
      }
    }

    // Tenant ve subscription'ı aktif yap
    // Plan'ı include etmeyelim (null olabilir, Prisma hatası verir)
    const updatedTenant = await this.prisma.tenant.update({
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
      const updatedPlan = await this.prisma.plan.findUnique({
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
      throw new BadRequestException('Tenant ID bulunamadı');
    }

    let settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    // Eğer settings yoksa, boş bir kayıt oluştur
    if (!settings) {
      settings = await this.prisma.tenantSettings.create({
        data: {
          tenantId,
        },
      });
    }

    return settings;
  }

  async updateSettings(tenantId: string, updateSettingsDto: UpdateTenantSettingsDto) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID bulunamadı');
    }

    // Önce mevcut settings'i kontrol et
    let settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    // Eğer yoksa oluştur
    if (!settings) {
      settings = await this.prisma.tenantSettings.create({
        data: {
          tenantId,
          ...updateSettingsDto,
        },
      });
    } else {
      // Varsa güncelle
      settings = await this.prisma.tenantSettings.update({
        where: { tenantId },
        data: updateSettingsDto,
      });
    }

    return settings;
  }
}

