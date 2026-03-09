import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface SseEvent {
    tenantId: string;
    type: string;
    data: Record<string, unknown>;
}

/**
 * SseService — Server-Sent Events yönetimi
 *
 * Per-tenant RxJS Subject stream kullanır.
 * Worker'lar (örn. AccountingWorker) fatura oluşturulduğunda
 * bu servis üzerinden frontend'e bildirim atar.
 *
 * MASTER_PROMPT: tenantId ile strict izolasyon.
 * Bir tenant'ın eventi başka bir tenant'a asla sızmaz.
 */
@Injectable()
export class SseService {
    private readonly subject = new Subject<SseEvent>();

    /**
     * Belirli bir tenant için SSE stream döndürür.
     * NestJS @Sse() decorator ile birlikte kullanılır.
     */
    getStream(tenantId: string): Observable<MessageEvent> {
        return this.subject.asObservable().pipe(
            filter((event) => event.tenantId === tenantId), // Tenant izolasyonu
            map(
                (event) =>
                    new MessageEvent('message', {
                        data: JSON.stringify({
                            type: event.type,
                            ...event.data,
                            timestamp: new Date().toISOString(),
                        }),
                    }),
            ),
        );
    }

    /**
     * Belirli bir tenant'a event yayınla.
     * Backend worker'larından çağrılır.
     */
    emit(tenantId: string, type: string, data: Record<string, unknown>) {
        this.subject.next({ tenantId, type, data });
    }
}
