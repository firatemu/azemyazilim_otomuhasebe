import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma.module';
import { OutboxRelayService } from './outbox-relay.service';
import { DlqWorker } from './dlq.worker';

/**
 * EventsModule — Faz 2 Event-Driven Architecture altyapısı
 *
 * Queue'lar:
 *  - work-order-events: WorkOrder domain event'leri
 *  - accounting-events: Muhasebe domain event'leri
 *  - dead-letter-queue: Max deneme aşılan başarısız job'lar
 *
 * MASTER_PROMPT: Her job payload'u tenantId içermek ZORUNDA.
 */
@Module({
    imports: [
        PrismaModule,
        BullModule.registerQueue(
            {
                name: 'work-order-events',
                defaultJobOptions: {
                    attempts: 5,
                    backoff: { type: 'exponential', delay: 2000 }, // 2s, 4s, 8s, 16s, 32s
                    removeOnComplete: { count: 500, age: 7 * 24 * 3600 }, // 7 gün sakla
                    removeOnFail: false, // DLQ analizi için sakla
                },
            },
            {
                name: 'accounting-events',
                defaultJobOptions: {
                    attempts: 5,
                    backoff: { type: 'exponential', delay: 2000 },
                    removeOnComplete: { count: 200 },
                    removeOnFail: false,
                },
            },
            {
                name: 'dead-letter-queue',
                defaultJobOptions: {
                    removeOnComplete: false, // DLQ'da sürekli sakla
                    removeOnFail: false,
                },
            },
        ),
    ],
    providers: [OutboxRelayService, DlqWorker],
    exports: [BullModule, OutboxRelayService],
})
export class EventsModule { }
