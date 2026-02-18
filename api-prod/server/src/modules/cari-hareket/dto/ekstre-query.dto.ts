import { IsOptional, IsDateString, IsString } from 'class-validator';

export class EkstreQueryDto {
  @IsString()
  cariId: string;

  @IsOptional()
  @IsDateString()
  baslangicTarihi?: string;

  @IsOptional()
  @IsDateString()
  bitisTarihi?: string;
}
