import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { CheckBillStatus, CheckBillType } from '@prisma/client';

@Injectable()
export class ReminderTaskService {
    private readonly logger = new Logger(ReminderTaskService.name);

    constructor(
        private prisma: PrismaService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async handleCron() {
        this.logger.log('Vade hatırlatma kontrolü başlıyor...');

        try {
            // 1. Aktif tenant'ları bul
            const tenants = await this.prisma.extended.tenant.findMany({
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
        const upcomingChecks = await this.prisma.extended.checkBill.findMany({
            where: {
                tenantId: tenant.id,
                dueDate: {
                    gte: targetDate,
                    lt: nextDay,
                },
                status: {
                    in: [
                        CheckBillStatus.IN_PORTFOLIO,
                        CheckBillStatus.IN_BANK_COLLECTION,
                        CheckBillStatus.IN_BANK_GUARANTEE,
                    ],
                },
                remainingAmount: {
                    gt: 0,
                },
            },
            include: {
                account: true,
            },
        });

        if (upcomingChecks.length === 0) return;

        // TODO: Email gönderimi yapılandırıldığında aktif edilecek
        // Tenant'ın adminlerini bul
        // const admins = await this.prisma.extended.user.findMany({
        //     where: {
        //         tenantId: tenant.id,
        //         role: { in: ['ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN'] },
        //         isActive: true,
        //     },
        // });

        // for (const admin of admins) {
        //     await this.emailService.sendMaturityReminderEmail(
        //         admin.email,
        //         admin.fullName || admin.firstName || 'Sayın Kullanıcı',
        //         upcomingChecks
        //     );
        // }

        this.logger.log(`Tenant ${tenant.id} için ${upcomingChecks.length} adet evrak hatırlatması yapılacak.`);
    }
}