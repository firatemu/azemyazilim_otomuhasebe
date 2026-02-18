import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { CekSenetDurum } from '@prisma/client';

export class CekSenetIslemDto {
    @IsString()
    @IsNotEmpty()
    cekSenetId: string;

    @IsEnum(CekSenetDurum)
    yeniDurum: CekSenetDurum;


    @IsDateString()
    tarih: string;

    @IsString()
    @IsOptional()
    aciklama?: string;

    // Kısmi tahsilat veya işlem tutarı
    @IsNumber()
    @Min(0)
    islemTutari: number;

    // Finansal Entegrasyon Seçenekleri
    @IsOptional()
    @IsString()
    kasaId?: string; // Nakit tahsilat ise

    @IsOptional()
    @IsString()
    bankaHesapId?: string; // Bankaya tahsilat ise
}
