import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from './redis.service';

/**
 * GENERIC CACHE INTERCEPTOR TEMPLATE
 * Automatically caches GET requests based on URL
 * Place in: src/common/interceptors/cache.interceptor.ts
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
    constructor(private readonly redisService: RedisService) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        // Only cache GET requests
        if (request.method !== 'GET') {
            return next.handle();
        }

        const tenantId = request.headers['x-tenant-id'];
        const key = `cache:${tenantId}:${request.url}`;

        const cachedResponse = await this.redisService.get(key);
        if (cachedResponse) {
            console.log(`⚡ Cache Hit: ${key}`);
            return of(cachedResponse);
        }

        return next.handle().pipe(
            tap(async (data) => {
                await this.redisService.set(key, data, 300); // 5 minute TTL
                console.log(`💾 Cache Miss: ${key} - data stored.`);
            }),
        );
    }
}
