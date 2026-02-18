import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class TahsilCekSenetDto {
  @IsNotEmpty()
  @IsString()
  kasaId: string;

  @IsOptional()
  @IsDateString()
  tahsilTarihi?: string;

  @IsOptional()
  @IsString()
  aciklama?: string;
}
