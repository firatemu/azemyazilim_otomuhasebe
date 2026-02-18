import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, ValidateIf } from 'class-validator';

export enum OdemeTipi {
    BANKA_HAVALESI = 'BANKA_HAVALESI',
    NAKIT = 'NAKIT',
    ELDEN = 'ELDEN'
}

export class PayCreditInstallmentDto {
    @IsEnum(OdemeTipi)
    odemeTipi: OdemeTipi;

    @IsNumber()
    tutar: number;

    @ValidateIf(o => o.odemeTipi === OdemeTipi.BANKA_HAVALESI)
    @IsString()
    bankaHesapId?: string;

    @ValidateIf(o => o.odemeTipi === OdemeTipi.NAKIT)
    @IsString()
    kasaId?: string;

    @IsOptional()
    @IsString()
    aciklama?: string;

    @IsOptional()
    @IsDateString()
    odemeTarihi?: string;
}
