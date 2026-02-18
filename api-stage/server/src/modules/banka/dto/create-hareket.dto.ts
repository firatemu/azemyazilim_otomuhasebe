import {
    BankaHareketTipi,
    BankaHareketAltTipi,
} from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBankaHareketDto {
    @IsEnum(BankaHareketTipi)
    hareketTipi: BankaHareketTipi;

    @IsOptional()
    @IsEnum(BankaHareketAltTipi)
    hareketAltTipi?: BankaHareketAltTipi;

    @IsNumber()
    @Type(() => Number)
    tutar: number;

    @IsOptional()
    @IsString()
    aciklama?: string;

    @IsOptional()
    @IsString()
    referansNo?: string;

    @IsOptional()
    @IsUUID()
    cariId?: string;

    @IsOptional()
    @IsString()
    tarih?: string;
}

// POS işlemleri için özel DTO - komisyon hesaplama dahil
export class CreatePosHareketDto {
    @IsNumber()
    @Type(() => Number)
    tutar: number; // Brüt tahsilat tutarı

    @IsOptional()
    @IsString()
    aciklama?: string;

    @IsOptional()
    @IsString()
    referansNo?: string;

    @IsOptional()
    @IsUUID()
    cariId?: string;

    @IsOptional()
    @IsString()
    tarih?: string;
}

// Kredi işlemleri için DTO
export class CreateKrediHareketDto {
    @IsEnum(BankaHareketAltTipi)
    hareketAltTipi: BankaHareketAltTipi; // KREDI_KULLANIM veya KREDI_ODEME

    @IsNumber()
    @Type(() => Number)
    tutar: number;

    @IsOptional()
    @IsString()
    aciklama?: string;

    @IsOptional()
    @IsString()
    referansNo?: string;

    @IsOptional()
    @IsString()
    tarih?: string;
}
