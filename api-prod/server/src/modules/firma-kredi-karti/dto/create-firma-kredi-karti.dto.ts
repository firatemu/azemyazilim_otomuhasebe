import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateFirmaKrediKartiDto {
  @IsString()
  @IsNotEmpty()
  kasaId: string; // Hangi Firma KK kasasına bağlı

  @IsString()
  @IsOptional()
  kartKodu?: string;

  @IsString()
  @IsNotEmpty()
  kartAdi: string; // "Ziraat Visa - Ahmet Bey"

  @IsString()
  @IsNotEmpty()
  bankaAdi: string; // Ziraat, Garanti vb.

  @IsString()
  @IsOptional()
  kartTipi?: string; // Visa, MasterCard

  @IsString()
  @IsOptional()
  sonDortHane?: string;

  @IsNumber()
  @IsOptional()
  @Min(0, {
    message: 'Limit 0 veya daha büyük olmalıdır. 0 limitsiz anlamına gelir.',
  })
  @Type(() => Number)
  @Transform(({ value }) => {
    // String gelirse number'a çevir
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    }
    return value;
  })
  limit?: number; // Kart limiti (0 = limitsiz)

  @IsDateString()
  @IsOptional()
  hesapKesimTarihi?: string; // ISO date string

  @IsDateString()
  @IsOptional()
  sonOdemeTarihi?: string; // ISO date string

  @IsBoolean()
  @IsOptional()
  aktif?: boolean;
}
