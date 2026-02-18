import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TenantContextService } from '../services/tenant-context.service';

export interface BaseJobData {
    tenantId: string;
    userId?: string;
    action: string;
    payload: any;
}

/**
 * Base Processor that handles Tenant Context hydration.
 * All Queue Processors MUST extend this class.
 */
export abstract class BaseProcessor extends WorkerHost {
    protected abstract readonly logger: Logger;

    constructor(protected readonly tenantContext: TenantContextService) {
        super();
    }

    async process(job: Job<BaseJobData, any, string>): Promise<any> {
        const { tenantId, userId, action } = job.data;

        if (!tenantId) {
            this.logger.error(`[Job ${job.id}] Missing tenantId in job data`);
            throw new Error('Tenant ID is required for background jobs');
        }

        return this.tenantContext.runWithTenantContext(tenantId, userId, async () => {
            this.logger.log(`[Job ${job.id}] Processing ${action} for tenant ${tenantId}`);
            try {
                return await this.handle(job);
            } catch (error) {
                this.logger.error(`[Job ${job.id}] Failed: ${error.message}`, error.stack);
                throw error;
            }
        });
    }

    /**
     * Implement business logic here.
     * Context is already set.
     */
    abstract handle(job: Job<BaseJobData>): Promise<any>;

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`[Job ${job.id}] Completed`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: any) {
        this.logger.error(`[Job ${job.id}] Failed: ${error.message}`);
    }
}
