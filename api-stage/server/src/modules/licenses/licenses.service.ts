import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { LicenseService } from '../../common/services/license.service';
import { InvitationService } from '../../common/services/invitation.service';

@Injectable()
export class LicensesService {
  constructor(
    private prisma: PrismaService,
    private licenseService: LicenseService,
    private invitationService: InvitationService,
  ) {}

  /**
   * Tenant'ın lisans durumunu getir
   */
  async getTenantLicenseStatus(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        plan: true,
        moduleLicenses: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new BadRequestException('Abonelik bulunamadı');
    }

    const totalLimit = await this.licenseService.getTotalUserLimit(tenantId);
    const activeCount = await this.licenseService.getActiveLicensedUserCount(tenantId);

    // Modül lisans durumları
    const moduleStatuses = await Promise.all(
      subscription.moduleLicenses.map(async (ml) => {
        const assigned = await this.licenseService.getAssignedModuleLicenseCount(
          tenantId,
          ml.module.slug,
        );
        return {
          module: ml.module,
          purchased: ml.quantity,
          assigned,
          available: ml.quantity - assigned,
        };
      }),
    );

    return {
      subscription,
      userLimits: {
        total: totalLimit,
        active: activeCount,
        available: totalLimit - activeCount,
      },
      modules: moduleStatuses,
    };
  }

  /**
   * Kullanıcıya ana paket lisansı ata
   */
  async assignBasePlanLicense(userId: string, assignedBy: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.tenantId) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    // Kullanıcı limiti kontrolü
    const canAdd = await this.licenseService.canAddUser(user.tenantId);
    if (!canAdd) {
      throw new ForbiddenException('Kullanıcı limiti aşıldı. Ek kullanıcı satın almanız gerekiyor.');
    }

    await this.licenseService.assignBasePlanLicense(userId, assignedBy);
  }

  /**
   * Kullanıcıya modül lisansı ata
   */
  async assignModuleLicense(
    userId: string,
    moduleSlug: string,
    assignedBy: string,
  ) {
    await this.licenseService.assignModuleLicense(userId, moduleSlug, assignedBy);
  }

  /**
   * Kullanıcıdan lisansı iptal et
   */
  async revokeLicense(licenseId: string, revokedBy: string) {
    await this.licenseService.revokeLicense(licenseId, revokedBy);
  }

  /**
   * Kullanıcının lisanslarını getir
   */
  async getUserLicenses(userId: string) {
    return await this.licenseService.getUserLicenses(userId);
  }

  /**
   * Tenant'ın tüm lisanslı kullanıcılarını getir
   */
  async getTenantLicensedUsers(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        licenses: {
          some: {
            licenseType: 'BASE_PLAN',
            revokedAt: null,
          },
        },
      },
      include: {
        licenses: {
          where: {
            revokedAt: null,
          },
          include: {
            module: true,
          },
        },
      },
    });

    return users;
  }

  /**
   * Tenant'ın tüm kullanıcılarını getir (lisanslı ve lisanssız)
   */
  async getAllTenantUsers(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
      },
      include: {
        licenses: {
          where: {
            revokedAt: null,
          },
          include: {
            module: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  }

  /**
   * Ek kullanıcı satın al
   */
  async purchaseAdditionalUsers(tenantId: string, quantity: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new BadRequestException('Abonelik bulunamadı');
    }

    await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        additionalUsers: {
          increment: quantity,
        },
      },
    });

    return {
      message: `${quantity} ek kullanıcı başarıyla eklendi`,
      newTotal: subscription.additionalUsers + quantity,
    };
  }

  /**
   * Modül lisansı satın al
   */
  async purchaseModuleLicense(
    tenantId: string,
    moduleSlug: string,
    quantity: number,
  ) {
    const module = await this.prisma.module.findUnique({
      where: { slug: moduleSlug },
    });

    if (!module) {
      throw new BadRequestException(`Modül bulunamadı: ${moduleSlug}`);
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new BadRequestException('Abonelik bulunamadı');
    }

    // Mevcut lisans var mı kontrol et
    const existing = await this.prisma.moduleLicense.findFirst({
      where: {
        subscriptionId: subscription.id,
        moduleId: module.id,
      },
    });

    if (existing) {
      // Mevcut lisansı güncelle
      await this.prisma.moduleLicense.update({
        where: { id: existing.id },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });
    } else {
      // Yeni lisans oluştur
      await this.prisma.moduleLicense.create({
        data: {
          subscriptionId: subscription.id,
          moduleId: module.id,
          quantity,
        },
      });
    }

    return {
      message: `${module.name} modülü için ${quantity} lisans başarıyla eklendi`,
    };
  }
}


