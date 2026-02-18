import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { LicensesService } from './licenses.service';
import { InvitationService } from '../../common/services/invitation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import {
  AssignBasePlanLicenseDto,
  AssignModuleLicenseDto,
  RevokeLicenseDto,
  InviteUserDto,
  PurchaseAdditionalUsersDto,
  PurchaseModuleLicenseDto,
} from './dto/assign-license.dto';

@Controller('licenses')
@UseGuards(JwtAuthGuard)
export class LicensesController {
  constructor(
    private licensesService: LicensesService,
    private invitationService: InvitationService,
  ) {}

  /**
   * Tenant'ın lisans durumunu getir
   */
  @Get('status')
  async getLicenseStatus(@GetCurrentUser('tenantId') tenantId: string) {
    return await this.licensesService.getTenantLicenseStatus(tenantId);
  }

  /**
   * Kullanıcıya ana paket lisansı ata
   */
  @Post('assign/base-plan')
  async assignBasePlanLicense(
    @Body() dto: AssignBasePlanLicenseDto,
    @GetCurrentUser('userId') assignedBy: string,
  ) {
    await this.licensesService.assignBasePlanLicense(dto.userId, assignedBy);
    return { message: 'Ana paket lisansı başarıyla atandı' };
  }

  /**
   * Kullanıcıya modül lisansı ata
   */
  @Post('assign/module')
  async assignModuleLicense(
    @Body() dto: AssignModuleLicenseDto,
    @GetCurrentUser('userId') assignedBy: string,
  ) {
    await this.licensesService.assignModuleLicense(
      dto.userId,
      dto.moduleSlug,
      assignedBy,
    );
    return { message: 'Modül lisansı başarıyla atandı' };
  }

  /**
   * Kullanıcıdan lisansı iptal et
   */
  @Delete('revoke/:licenseId')
  async revokeLicense(
    @Param('licenseId') licenseId: string,
    @GetCurrentUser('userId') revokedBy: string,
  ) {
    await this.licensesService.revokeLicense(licenseId, revokedBy);
    return { message: 'Lisans başarıyla iptal edildi' };
  }

  /**
   * Kullanıcının lisanslarını getir
   */
  @Get('user/:userId')
  async getUserLicenses(@Param('userId') userId: string) {
    return await this.licensesService.getUserLicenses(userId);
  }

  /**
   * Tenant'ın tüm lisanslı kullanıcılarını getir
   */
  @Get('users')
  async getTenantLicensedUsers(@GetCurrentUser('tenantId') tenantId: string) {
    return await this.licensesService.getTenantLicensedUsers(tenantId);
  }

  /**
   * Tenant'ın tüm kullanıcılarını getir (lisanslı ve lisanssız)
   */
  @Get('users/all')
  async getAllTenantUsers(@GetCurrentUser('tenantId') tenantId: string) {
    return await this.licensesService.getAllTenantUsers(tenantId);
  }

  /**
   * Kullanıcı davet et
   */
  @Post('invite')
  async inviteUser(
    @Body() dto: InviteUserDto,
    @GetCurrentUser('tenantId') tenantId: string,
    @GetCurrentUser('userId') invitedBy: string,
  ) {
    return await this.invitationService.inviteUser(dto.email, tenantId, invitedBy);
  }

  /**
   * Tenant'ın davetlerini listele
   */
  @Get('invitations')
  async getInvitations(@GetCurrentUser('tenantId') tenantId: string) {
    return await this.invitationService.getTenantInvitations(tenantId);
  }

  /**
   * Ek kullanıcı satın al
   */
  @Post('purchase/additional-users')
  async purchaseAdditionalUsers(
    @Body() dto: PurchaseAdditionalUsersDto,
    @GetCurrentUser('tenantId') tenantId: string,
  ) {
    const quantity = parseInt(dto.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error('Geçersiz miktar');
    }
    return await this.licensesService.purchaseAdditionalUsers(tenantId, quantity);
  }

  /**
   * Modül lisansı satın al
   */
  @Post('purchase/module')
  async purchaseModuleLicense(
    @Body() dto: PurchaseModuleLicenseDto,
    @GetCurrentUser('tenantId') tenantId: string,
  ) {
    const quantity = parseInt(dto.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error('Geçersiz miktar');
    }
    return await this.licensesService.purchaseModuleLicense(
      tenantId,
      dto.moduleSlug,
      quantity,
    );
  }
}


