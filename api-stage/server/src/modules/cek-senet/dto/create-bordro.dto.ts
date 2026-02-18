import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { BordroTipi } from '@prisma/client';
import { CreateCekSenetDto } from './create-cek-senet.dto';

export class CreateBordroDto {
    @IsEnum(BordroTipi)
    tip: BordroTipi;


    @IsString()
    @IsNotEmpty()
    bordroNo: string;

    @IsDateString()
    tarih: string;

    @IsString()
    @IsOptional()
    cariId?: string; // Kimden alındı veya kime verildi

    @IsString()
    @IsOptional()
    bankaHesabiId?: string;

    @IsString()
    @IsOptional()
    aciklama?: string;

    // Giriş Bordrosu ise yeni çekler oluşturulur
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCekSenetDto)
    @IsOptional()
    yeniCekler?: CreateCekSenetDto[];

    // Çıkış Bordrosu ise mevcut çekler seçilir (ID listesi)
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    secilenCekIdleri?: string[];
}
