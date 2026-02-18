import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BaseProcessor, BaseJobData } from '../../common/processors/base.processor';
import { TenantContextService } from '../../common/services/tenant-context.service';

interface NotificationJobData extends BaseJobData {
    action: 'SEND_EMAIL' | 'SEND_SMS';
    payload: {
        to: string;
        subject?: string;
        body: string;
    };
}

@Processor('notifications')
export class NotificationProcessor extends BaseProcessor {
    protected readonly logger = new Logger(NotificationProcessor.name);

    constructor(tenantContext: TenantContextService) {
        super(tenantContext);
    }

    async handle(job: Job<NotificationJobData>): Promise<any> {
        const { action, payload } = job.data;

        // Here we can use Prisma or other services
        // The tenant context is already set by BaseProcessor

        switch (action) {
            case 'SEND_EMAIL':
                this.logger.log(`Sending email to ${payload.to}`);
                // await this.emailService.send(...)
                break;
            case 'SEND_SMS':
                this.logger.log(`Sending SMS to ${payload.to}`);
                break;
        }

        return { sent: true };
    }
}
