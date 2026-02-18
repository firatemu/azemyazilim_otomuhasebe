import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

/**
 * REDIS CACHING SERVICE TEMPLATE
 * Place this in: src/common/services/redis.service.ts
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;

    async onModuleInit() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://redis:6379',
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));

        await this.client.connect();
        console.log('✅ Redis connection established.');
    }

    async onModuleDestroy() {
        await this.client.disconnect();
    }

    /**
     * Get a cached value
     */
    async get(key: string): Promise<any> {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Set a cached value with TTL (Time to Live)
     */
    async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
        await this.client.set(key, JSON.stringify(value), {
            EX: ttlSeconds,
        });
    }

    /**
     * Delete a cache key
     */
    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    /**
     * Pattern based delete (useful for cache invalidation)
     */
    async delByPattern(pattern: string): Promise<void> {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
            await this.client.del(keys);
        }
    }
}
