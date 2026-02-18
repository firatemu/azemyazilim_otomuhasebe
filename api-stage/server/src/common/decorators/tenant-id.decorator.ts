import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const TenantId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const tenantId = request.tenantId || request.user?.tenantId;

        if (!tenantId) {
            // Ideally this should be handled by a global guard or middleware, but safe to check here
            // For SuperAdmin context without specific tenant, this might be undefined.
            // But RolesService requires tenantId.
            throw new BadRequestException('Tenant Context Required');
        }
        return tenantId;
    },
);
