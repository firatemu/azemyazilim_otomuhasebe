import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('Request');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url } = req;
        const userAgent = req.get('user-agent') || '';
        const now = Date.now();

        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const statusCode = response.statusCode;
                const delay = Date.now() - now;

                // Log format: [METHOD] URL STATUS DURATION UserAgent
                this.logger.log(
                    `${method} ${url} ${statusCode} ${delay}ms - ${userAgent}`,
                );
            }),
        );
    }
}
