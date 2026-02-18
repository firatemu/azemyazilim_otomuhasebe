import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global filter to catch Tenant Security Exceptions.
 * It masks the specific "Tenant context missing" error to prevent leaking implementation details,
 * while logging the critical event for admins.
 */
@Catch(BadRequestException)
export class TenantSecurityExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(TenantSecurityExceptionFilter.name);

    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();

        const message = typeof exceptionResponse === 'object'
            ? exceptionResponse.message
            : exceptionResponse;

        // Check if it is a Tenant Security Error
        if (
            message &&
            (message.includes('Tenant context missing') || message.includes('Security Alert'))
        ) {
            // 1. Log Critically
            this.logger.error(`🚨 [SECURITY BREACH ATTEMPT] ${message}`);

            // 2. Mask the error to the client
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal Server Error', // Generic message
                timestamp: new Date().toISOString(),
            });
        } else {
            // Pass through other BadRequestExceptions (validation errors, etc.)
            response.status(status).json(exceptionResponse);
        }
    }
}
