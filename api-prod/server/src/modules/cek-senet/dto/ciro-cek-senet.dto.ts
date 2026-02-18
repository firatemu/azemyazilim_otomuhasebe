import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CiroCekSenetDto {
  @IsNotEmpty()
  @IsString()
  ciroEdilen: string;

  @IsOptional()
  @IsDateString()
  ciroTarihi?: string;

  @IsOptional()
  @IsString()
  aciklama?: string;
}
