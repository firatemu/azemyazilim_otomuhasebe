import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { CekSenetTip, CekSenetDurum } from '@prisma/client';

export class CreateCekSenetDto {
    @IsEnum(CekSenetTip)
    tip: CekSenetTip;


    @IsString()
    @IsNotEmpty()
    evrakNo: string;

    @IsDateString()
    vadeTarihi: string;

    @IsNumber()
    @Min(0)
    tutar: number;

    @IsString()
    @IsOptional()
    borclu?: string;

    @IsString()
    @IsOptional()
    banka?: string;

    @IsString()
    @IsOptional()
    sube?: string;

    @IsString()
    @IsOptional()
    hesapNo?: string;

    @IsString()
    @IsOptional()
    aciklama?: string;

    // İlk giriş sırasında hangi cariden alındığı (Giriş Bordrosu için) context'ten gelecek
}

export class UpdateCekSenetDto {
    @IsString()
    @IsOptional()
    evrakNo?: string;

    @IsDateString()
    @IsOptional()
    vadeTarihi?: string;

    @IsString()
    @IsOptional()
    borclu?: string;

    @IsString()
    @IsOptional()
    banka?: string;

    @IsString()
    @IsOptional()
    sube?: string;

    @IsString()
    @IsOptional()
    hesapNo?: string;
}
