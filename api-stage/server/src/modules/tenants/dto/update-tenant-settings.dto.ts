import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateTenantSettingsDto {
    @IsOptional()
    @IsString()
    companyType?: string;

    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsString()
    taxNumber?: string;

    @IsOptional()
    @IsString()
    taxOffice?: string;

    @IsOptional()
    @IsString()
    mersisNo?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    tcNo?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsOptional()
    @IsString()
    neighborhood?: string;

    @IsOptional()
    @IsString()
    postalCode?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    logoUrl?: string;

    @IsOptional()
    @IsObject()
    features?: any;

    @IsOptional()
    @IsObject()
    limits?: any;

    @IsOptional()
    @IsString()
    timezone?: string;

    @IsOptional()
    @IsString()
    locale?: string;

    @IsOptional()
    @IsString()
    currency?: string;
}
