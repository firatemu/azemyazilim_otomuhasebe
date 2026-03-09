import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma.service';

/**
 * OutboxRelayService — Transactional Outbox Pattern
 *
 * Yapılış amacı:
 *   WorkOrder gibi aggregate'lerin status değişikliği ile event publish'i
 *   tek bir DB transaction'ında atomik olarak kaydedilir.
 *   Bu servis PENDING event'leri bulup BullMQ'ya iletir.
 *
 * Güvenlik:
 *   Redis çökmüş olsa bile outbox_events tablosundaki PENDING kayıtlar
 *   Redis ayağa kalkınca otomatik publish edilir. Sıfır veri kaybı.
 *
 * RLS:
 *   Bu servis CROSS-TENANT çalışır (tüm tenantların event'lerini process eder).
 *   Bu yüzden prisma.extended DEĞİL, normal prisma kullanılır.
 *   Bu tasarım gereklidir - outbox pattern için çapraz tenant erişim gerekir.
 */
@Injectable()
export class OutboxRelayService {
    private readonly logger = new Logger(OutboxRelayService.name);
    private isRunning = false; // Concurrent execution guard

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('work-order-events') private readonly workOrderQueue: Queue,
    ) { }

    /**
     * Her 5 saniyede PENDING event'leri BullMQ'ya relay et.
     * @nestjs/schedule ScheduleModule.forRoot() gerektirir (app.module.ts'de mevcut).
     */
    @Cron(CronExpression.EVERY_5_SECONDS)
    async relayPendingEvents() {
        // Aynı anda iki relay çalışmasını önle
        if (this.isRunning) return;
        this.isRunning = true;

        try {
            const events: any[] = await (this.prisma as any).outboxEvent?.findMany({
                where: {
                    status: 'PENDING',
                    attempts: { lt: 5 }, // 5 denemeden fazla olanlar DLQ'ya düştü
                },
                orderBy: { createdAt: 'asc' },
                take: 100, // Her batch'te max 100 olay
            });

            if (events.length === 0) return;

            this.logger.debug(`${events.length} PENDING outbox event relay ediliyor...`);

            for (const event of events) {
                await this.relayEvent(event);
            }
        } catch (err) {
            this.logger.error('OutboxRelayService genel hata:', err);
        } finally {
            this.isRunning = false;
        }
    }

    private async relayEvent(event: {
        id: string;
        eventType: string;
        idempotencyKey: string;
        payload: any;
        attempts: number;
    }) {
        try {
            // BullMQ'ya job ekle
            // jobId = idempotencyKey → Aynı event iki kez queue'ya giremez
            await this.workOrderQueue.add(
                event.eventType,
                {
                    outboxEventId: event.id,
                    idempotencyKey: event.idempotencyKey,
                    ...event.payload,
                },
                {
                    jobId: event.idempotencyKey, // BullMQ aynı jobId'yi reddeder
                },
            );

            // Başarıyla publish edildi
            await (this.prisma as any).outboxEvent?.update({
                where: { id: event.id },
                data: {
                    status: 'PUBLISHED',
                    publishedAt: new Date(),
                },
            });

            this.logger.log(
                `[${event.payload?.tenantId}] ${event.eventType} publish edildi (aggId: ${event.payload?.workOrderId ?? event.id})`,
            );
        } catch (err: any) {
            const newAttempts = event.attempts + 1;
            const isFinalFailure = newAttempts >= 5;

            await (this.prisma as any).outboxEvent?.update({
                where: { id: event.id },
                data: {
                    attempts: { increment: 1 },
                    status: isFinalFailure ? 'FAILED' : 'PENDING',
                    errorMessage: err?.message ?? 'Bilinmeyen hata',
                },
            });

            this.logger.error(
                `Outbox relay başarısız (attempt ${newAttempts}/5): ${event.eventType} [${event.id}]`,
                err?.message,
            );
        }
    }
}
