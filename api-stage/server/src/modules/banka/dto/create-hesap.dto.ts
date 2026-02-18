import { BankaHesapTipi } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, ValidateIf, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBankaHesapDto {
    @IsString()
    hesapAdi: string;

    @IsOptional()
    @IsString()
    hesapKodu?: string;

    @IsEnum(BankaHesapTipi)
    hesapTipi: BankaHesapTipi;

    @IsOptional()
    @IsString()
    hesapNo?: string;

    @IsOptional()
    @IsString()
    iban?: string;

    @IsOptional()
    @IsBoolean()
    aktif?: boolean;

    // POS hesapları için komisyon oranı
    @ValidateIf(o => o.hesapTipi === 'POS')
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    komisyonOrani?: number;

    // POS terminal numarası
    @ValidateIf(o => o.hesapTipi === 'POS')
    @IsOptional()
    @IsString()
    terminalNo?: string;

    // Kredi hesapları için
    @ValidateIf(o => o.hesapTipi === 'KREDI')
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    krediLimiti?: number;

    // Firma kredi kartı için
    @ValidateIf(o => o.hesapTipi === 'FIRMA_KREDI_KARTI')
    @IsNumber()
    @Type(() => Number)
    kartLimiti?: number;

    @ValidateIf(o => o.hesapTipi === 'FIRMA_KREDI_KARTI')
    @IsNumber()
    @Type(() => Number)
    hesapKesimGunu?: number;

    @ValidateIf(o => o.hesapTipi === 'FIRMA_KREDI_KARTI')
    @IsNumber()
    @Type(() => Number)
    sonOdemeGunu?: number;
}

export class UpdateBankaHesapDto extends CreateBankaHesapDto { }
