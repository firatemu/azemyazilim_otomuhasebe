import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                connection: {
                    url: configService.get('REDIS_URL'), // Ensure REDIS_URL matches implementation
                    host: configService.get('REDIS_HOST') || 'redis',
                    port: configService.get('REDIS_PORT') || 6379,
                },
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                    removeOnComplete: true,
                    removeOnFail: 100, // Keep last 100 failed jobs
                },
            }),
            inject: [ConfigService],
        }),
        // Register specific queues here
        BullModule.registerQueue({
            name: 'default',
        }),
    ],
    exports: [BullModule],
})
export class QueueModule { }
