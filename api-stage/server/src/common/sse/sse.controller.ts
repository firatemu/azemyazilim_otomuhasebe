import { Controller, Get, Param, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseService } from './sse.service';

/**
 * SseController — Server-Sent Events endpoint'i
 *
 * GET /events/:tenantId/notifications → text/event-stream
 *
 * Frontend'de EventSource ile bağlanılır:
 *   const es = new EventSource('/api/events/<tenantId>/notifications');
 *
 * MASTER_PROMPT: tenantId path param olarak alınır.
 * Bir tenant'ın stream'i başka tenant'a sızmaz (SseService.filter()).
 */
@Controller('events')
export class SseController {
    constructor(private readonly sseService: SseService) { }

    @Sse(':tenantId/notifications')
    stream(@Param('tenantId') tenantId: string): Observable<MessageEvent> {
        return this.sseService.getStream(tenantId);
    }
}
