import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InvitationStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class InvitationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  /**
   * Kullanıcı davet et
   */
  async inviteUser(
    email: string,
    tenantId: string,
    invitedBy: string,
  ): Promise<{ invitation: any; message: string }> {
    // Kullanıcı zaten tenant'a üye mi kontrol et
    const existingUser = await this.prisma.extended.user.findFirst({
      where: {
        email,
        tenantId,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Bu kullanıcı zaten tenant\'a üye');
    }

    // Aktif davet var mı kontrol et
    const existingInvitation = await this.prisma.extended.invitation.findFirst({
      where: {
        email,
        tenantId,
        status: InvitationStatus.PENDING,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      throw new BadRequestException('Bu kullanıcı için zaten aktif bir davet var');
    }

    // Davet token'ı oluştur
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 gün geçerli

    // Davet oluştur
    const invitation = await this.prisma.extended.invitation.create({
      data: {
        email,
        tenantId,
        invitedBy,
        token,
        expiresAt,
        status: InvitationStatus.PENDING,
      },
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
      },
    });

    // Email gönder
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/accept?token=${token}`;

    try {
      await this.emailService.sendInvitationEmail(
        email,
        invitation.tenant.name,
        inviteUrl,
      );
    } catch (error) {
      console.error('Davet emaili gönderilemedi:', error);
      // Email gönderilemese bile davet oluşturuldu
    }

    return {
      invitation,
      message: 'Davet başarıyla gönderildi',
    };
  }

  /**
   * Daveti kabul et
   */
  async acceptInvitation(
    token: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<{ user: any; message: string }> {
    const invitation = await this.prisma.extended.invitation.findUnique({
      where: { token },
      include: {
        tenant: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Davet bulunamadı');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Bu davet zaten kullanılmış veya iptal edilmiş');
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.extended.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Davet süresi dolmuş');
    }

    // Kullanıcı zaten var mı kontrol et
    let user = await this.prisma.extended.user.findFirst({
      where: {
        email: invitation.email,
        tenantId: invitation.tenantId
      },
    });

    if (user) {
      // Kullanıcı zaten varsa, tenant'a ekle
      if (user.tenantId !== invitation.tenantId) {
        await this.prisma.extended.user.update({
          where: { id: user.id },
          data: { tenantId: invitation.tenantId },
        });
      }
    } else {
      // Yeni kullanıcı oluştur
      const username = invitation.email.split('@')[0];
      const fullName = firstName && lastName
        ? `${firstName} ${lastName}`
        : username;

      user = await this.prisma.extended.user.create({
        data: {
          email: invitation.email,
          username,
          password: password, // Auth service'de hash'lenecek
          fullName,
          firstName,
          lastName,
          tenantId: invitation.tenantId,
          role: 'USER',
        },
      });
    }

    // Daveti kabul edildi olarak işaretle
    await this.prisma.extended.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
        acceptedBy: user.id,
      },
    });

    return {
      user,
      message: 'Davet başarıyla kabul edildi',
    };
  }

  /**
   * Daveti iptal et
   */
  async cancelInvitation(invitationId: string): Promise<void> {
    await this.prisma.extended.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.CANCELLED },
    });
  }

  /**
   * Tenant'ın davetlerini listele
   */
  async getTenantInvitations(tenantId: string) {
    return await this.prisma.extended.invitation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}


