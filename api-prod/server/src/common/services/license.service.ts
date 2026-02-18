import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LicenseType } from '@prisma/client';

@Injectable()
export class LicenseService {
  constructor(private prisma: PrismaService) {}

  /**
   * Kullanıcının ana paket lisansına sahip olup olmadığını kontrol eder
   */
  async hasBasePlanLicense(userId: string): Promise<boolean> {
    const license = await this.prisma.userLicense.findFirst({
      where: {
        userId,
        licenseType: LicenseType.BASE_PLAN,
        revokedAt: null,
      },
    });

    return !!license;
  }

  /**
   * Kullanıcının belirli bir modül lisansına sahip olup olmadığını kontrol eder
   */
  async hasModuleLicense(userId: string, moduleSlug: string): Promise<boolean> {
    const module = await this.prisma.module.findUnique({
      where: { slug: moduleSlug },
    });

    if (!module) {
      return false;
    }

    const license = await this.prisma.userLicense.findFirst({
      where: {
        userId,
        licenseType: LicenseType.MODULE,
        moduleId: module.id,
        revokedAt: null,
      },
    });

    return !!license;
  }

  /**
   * Tenant'ın toplam kullanıcı limitini hesaplar (ana paket + ek kullanıcılar)
   */
  async getTotalUserLimit(tenantId: string): Promise<number> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      return 0;
    }

    const baseLimit = subscription.plan.baseUserLimit || 0;
    const additionalUsers = subscription.additionalUsers || 0;

    return baseLimit + additionalUsers;
  }

  /**
   * Tenant'ta aktif lisanslı kullanıcı sayısını hesaplar
   */
  async getActiveLicensedUserCount(tenantId: string): Promise<number> {
    return await this.prisma.userLicense.count({
      where: {
        user: {
          tenantId,
        },
        licenseType: LicenseType.BASE_PLAN,
        revokedAt: null,
      },
    });
  }

  /**
   * Tenant'ın kullanıcı limitini aşıp aşmadığını kontrol eder
   */
  async canAddUser(tenantId: string): Promise<boolean> {
    const totalLimit = await this.getTotalUserLimit(tenantId);
    const activeCount = await this.getActiveLicensedUserCount(tenantId);

    return activeCount < totalLimit;
  }

  /**
   * Modül için satın alınan lisans sayısını döndürür
   */
  async getModuleLicenseCount(tenantId: string, moduleSlug: string): Promise<number> {
    const module = await this.prisma.module.findUnique({
      where: { slug: moduleSlug },
    });

    if (!module) {
      return 0;
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        moduleLicenses: {
          where: { moduleId: module.id },
        },
      },
    });

    if (!subscription) {
      return 0;
    }

    return subscription.moduleLicenses.reduce((sum, ml) => sum + ml.quantity, 0);
  }

  /**
   * Modül için atanmış lisans sayısını döndürür
   */
  async getAssignedModuleLicenseCount(tenantId: string, moduleSlug: string): Promise<number> {
    const module = await this.prisma.module.findUnique({
      where: { slug: moduleSlug },
    });

    if (!module) {
      return 0;
    }

    return await this.prisma.userLicense.count({
      where: {
        user: {
          tenantId,
        },
        licenseType: LicenseType.MODULE,
        moduleId: module.id,
        revokedAt: null,
      },
    });
  }

  /**
   * Modül için yeni lisans atanabilir mi kontrol eder
   */
  async canAssignModuleLicense(tenantId: string, moduleSlug: string): Promise<boolean> {
    const purchased = await this.getModuleLicenseCount(tenantId, moduleSlug);
    const assigned = await this.getAssignedModuleLicenseCount(tenantId, moduleSlug);

    return assigned < purchased;
  }

  /**
   * Kullanıcıya ana paket lisansı atar
   */
  async assignBasePlanLicense(
    userId: string,
    assignedBy: string,
  ): Promise<void> {
    // Zaten lisansı var mı kontrol et
    const existing = await this.prisma.userLicense.findFirst({
      where: {
        userId,
        licenseType: LicenseType.BASE_PLAN,
        revokedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException('Kullanıcının zaten ana paket lisansı var');
    }

    await this.prisma.userLicense.create({
      data: {
        userId,
        licenseType: LicenseType.BASE_PLAN,
        assignedBy,
      },
    });
  }

  /**
   * Kullanıcıya modül lisansı atar
   */
  async assignModuleLicense(
    userId: string,
    moduleSlug: string,
    assignedBy: string,
  ): Promise<void> {
    const module = await this.prisma.module.findUnique({
      where: { slug: moduleSlug },
    });

    if (!module) {
      throw new BadRequestException(`Modül bulunamadı: ${moduleSlug}`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.tenantId) {
      throw new BadRequestException('Kullanıcı bulunamadı veya tenant\'a ait değil');
    }

    // Lisans atanabilir mi kontrol et
    const canAssign = await this.canAssignModuleLicense(user.tenantId, moduleSlug);
    if (!canAssign) {
      throw new ForbiddenException('Bu modül için yeterli lisans yok');
    }

    // Zaten lisansı var mı kontrol et
    const existing = await this.prisma.userLicense.findFirst({
      where: {
        userId,
        licenseType: LicenseType.MODULE,
        moduleId: module.id,
        revokedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException('Kullanıcının zaten bu modül lisansı var');
    }

    await this.prisma.userLicense.create({
      data: {
        userId,
        licenseType: LicenseType.MODULE,
        moduleId: module.id,
        assignedBy,
      },
    });
  }

  /**
   * Kullanıcıdan lisansı iptal eder
   */
  async revokeLicense(
    licenseId: string,
    revokedBy: string,
  ): Promise<void> {
    const license = await this.prisma.userLicense.findUnique({
      where: { id: licenseId },
    });

    if (!license) {
      throw new BadRequestException('Lisans bulunamadı');
    }

    if (license.revokedAt) {
      throw new BadRequestException('Lisans zaten iptal edilmiş');
    }

    await this.prisma.userLicense.update({
      where: { id: licenseId },
      data: {
        revokedAt: new Date(),
        revokedBy,
      },
    });
  }

  /**
   * Kullanıcının tüm aktif lisanslarını döndürür
   */
  async getUserLicenses(userId: string) {
    return await this.prisma.userLicense.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      include: {
        module: true,
      },
    });
  }
}


