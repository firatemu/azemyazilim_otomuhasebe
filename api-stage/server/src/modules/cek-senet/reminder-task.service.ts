import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { EmailService } from '../../common/services/email.service';
import { CekSenetDurum } from '@prisma/client';

@Injectable()
export class ReminderTaskService {
    private readonly logger = new Logger(ReminderTaskService.name);

    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async handleCron() {
        this.logger.log('Vade hatırlatma kontrolü başlıyor...');

        try {
            // 1. Aktif tenant'ları bul
            const tenants = await this.prisma.tenant.findMany({
                where: { status: 'ACTIVE' },
                include: { settings: true }
            });

            for (const tenant of tenants) {
                await this.processTenantReminders(tenant);
            }
        } catch (error: any) {
            this.logger.error(`Vade hatırlatma işlemi sırasında hata: ${error.message}`);
        }
    }

    private async processTenantReminders(tenant: any) {
        // 3 gün sonraki vadeyi hedefle
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Vadeleri yaklaşan çekleri bul
        const upcomingChecks = await this.prisma.cekSenet.findMany({
            where: {
                tenantId: tenant.id,
                vade: {
                    gte: targetDate,
                    lt: nextDay,
                },
                durum: {
                    in: [
                        CekSenetDurum.PORTFOYDE,
                        CekSenetDurum.BANKA_TAHSILDE,
                        CekSenetDurum.BANKA_TEMINATTA,
                    ],
                },
                kalanTutar: {
                    gt: 0,
                },
            },
            include: {
                cari: true,
            },
        });

        if (upcomingChecks.length === 0) return;

        // Tenant'ın adminlerini bul
        const admins = await this.prisma.user.findMany({
            where: {
                tenantId: tenant.id,
                role: { in: ['ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN'] },
                isActive: true,
            },
        });

        for (const admin of admins) {
            await this.emailService.sendMaturityReminderEmail(
                admin.email,
                admin.fullName || admin.firstName || 'Sayın Kullanıcı',
                upcomingChecks
            );
        }

        this.logger.log(`Tenant ${tenant.id} için ${upcomingChecks.length} adet evrak hatırlatması ${admins.length} kişiye gönderildi.`);
    }
}
