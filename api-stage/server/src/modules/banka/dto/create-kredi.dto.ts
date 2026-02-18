import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { KrediTuru } from '@prisma/client';

export class CreateKrediKullanimDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    tutar: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    taksitSayisi: number;



    @IsNotEmpty()
    @IsEnum(KrediTuru)
    krediTuru: KrediTuru;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    yillikFaizOrani: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    odemeSikligi?: number; // Rotatif için (1, 3, 6, 12 ay)

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    taksitTutari: number; // Kullanıcı taksit tutarını girer

    @IsNotEmpty()
    @IsDateString()
    kullanimTarihi: string; // Paranın hesaba girdiği tarih

    @IsNotEmpty()
    @IsDateString()
    ilkTaksitTarihi: string; // İlk taksit ödeme tarihi

    @IsOptional()
    @IsString()
    aciklama?: string;
}
