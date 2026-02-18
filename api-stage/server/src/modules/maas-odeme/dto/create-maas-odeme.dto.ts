import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsArray,
    ValidateNested,
    IsEnum,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OdemeDetayDto {
    @IsNotEmpty({ message: 'Ödeme tipi zorunludur' })
    @IsEnum(['NAKIT', 'BANKA_HAVALESI'])
    odemeTipi: 'NAKIT' | 'BANKA_HAVALESI';

    @IsNotEmpty({ message: 'Tutar zorunludur' })
    @IsNumber()
    @Min(0.01, { message: 'Tutar 0\'dan büyük olmalıdır' })
    tutar: number;

    @IsOptional()
    @IsString()
    kasaId?: string; // NAKIT için zorunlu

    @IsOptional()
    @IsString()
    bankaHesapId?: string; // BANKA_HAVALESI için zorunlu

    @IsOptional()
    @IsString()
    referansNo?: string;

    @IsOptional()
    @IsString()
    aciklama?: string;
}

export class CreateMaasOdemeDto {
    @IsNotEmpty({ message: 'Plan ID zorunludur' })
    @IsString()
    planId: string;

    @IsNotEmpty({ message: 'Personel ID zorunludur' })
    @IsString()
    personelId: string;

    @IsNotEmpty({ message: 'Tutar zorunludur' })
    @IsNumber()
    @Min(0.01, { message: 'Tutar 0\'dan büyük olmalıdır' })
    tutar: number;

    @IsOptional()
    tarih?: Date;

    @IsOptional()
    @IsString()
    aciklama?: string;

    @IsNotEmpty({ message: 'Ödeme detayları zorunludur' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OdemeDetayDto)
    odemeDetaylari: OdemeDetayDto[];
}
