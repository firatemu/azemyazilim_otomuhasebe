import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
    @IsEnum(['USER', 'VIEWER', 'SUPPORT', 'MANAGER', 'ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN'])
    @IsNotEmpty()
    role: string;
}
