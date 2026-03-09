import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBankDto {
    @IsString()
    @ApiProperty()
    name: string; // Renamed from ad

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    branch?: string; // Renamed from sube

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    city?: string; // Renamed from sehir

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    contactName?: string; // Renamed from yetkili

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    phone?: string; // Renamed from telefon

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    logo?: string;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ required: false, default: true })
    isActive?: boolean; // Renamed from status
}

export class UpdateBankDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    branch?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    contactName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
