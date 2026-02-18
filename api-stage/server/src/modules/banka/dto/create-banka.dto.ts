import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBankaDto {
    @IsString()
    ad: string;

    @IsOptional()
    @IsString()
    sube?: string;

    @IsOptional()
    @IsString()
    sehir?: string;

    @IsOptional()
    @IsString()
    yetkili?: string;

    @IsOptional()
    @IsString()
    telefon?: string;

    @IsOptional()
    @IsString()
    logo?: string;

    @IsOptional()
    @IsBoolean()
    durum?: boolean;
}

export class UpdateBankaDto extends CreateBankaDto { }
