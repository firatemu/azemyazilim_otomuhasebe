import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContextService } from '../services/tenant-context.service';

/**
 * DlqWorker — Dead Letter Queue Consumer
 *
 * Max deneme sayısını aşan başarısız job'ları yakalar.
 * Admin bildirimi gönderir, veritabanına FAILED statusu yazar.
 *
 * MASTER_PROMPT: tenantId her zaman payload'da zorunludur.
 * 
 * RLS: Bu worker tenant context'i manuel olarak set eder.
 * Background job olduğu için HTTP middleware çalışmaz, bu yüzden
 * runWithTenantContext() kullanılır.
 */
@Processor('dead-letter-queue')
export class DlqWorker extends WorkerHost {
    private readonly logger = new Logger(DlqWorker.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) {
        super();
    }

    async process(job: Job) {
        const { tenantId, originalQueue, eventType, failedReason } = job.data;

        if (!tenantId) {
            this.logger.error('[DLQ] Missing tenantId in job data');
            throw new Error('Tenant ID is required for DLQ worker');
        }

        this.logger.error(
            `[DLQ][${tenantId}] Job kalıcı olarak başarısız: eventType=${eventType}, queue=${originalQueue}`,
            failedReason,
        );

        // Tenant context set et ve RLS ile çalıştır
        return this.tenantContext.runWithTenantContext(tenantId, undefined, async () => {
            // OutboxEvent'i FAILED olarak işaretle
            if (job.data.outboxEventId) {
                await this.prisma.extended.outboxEvent.update({
                    where: { id: job.data.outboxEventId },
                    data: {
                        status: 'FAILED',
                        attempts: { increment: 1 },
                        errorMessage: failedReason ?? 'DLQ: Max deneme aşıldı',
                    },
                });
            }

            // TODO: Gerçek bildirim entegrasyonu:
            // - Slack webhook: POST https://hooks.slack.com/services/...
            // - E-posta: nodemailer ile sistem admin ve tenant admin'e
            // - PagerDuty / OpsGenie API çağrısı
            //
            // Örnek log format (monitoring araçları için parse edilebilir):
            this.logger.error(
                JSON.stringify({
                    level: 'CRITICAL',
                    type: 'DLQ_JOB',
                    tenantId,
                    jobId: job.id,
                    eventType,
                    originalQueue,
                    failedReason,
                    timestamp: new Date().toISOString(),
                }),
            );

            return { handled: true };
        });
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        // DLQ worker'ı bile başarısız olursa logla
        this.logger.error(`[DLQ] DLQ worker başarısız: ${job.id}`, error.message);
    }
}