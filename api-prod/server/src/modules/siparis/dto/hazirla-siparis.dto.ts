import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SiparisHazirlikKalemiDto {
  @IsString()
  @IsNotEmpty()
  siparisKalemiId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsNumber()
  @Min(1)
  miktar: number;
}

export class HazirlaSiparisDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiparisHazirlikKalemiDto)
  hazirlananlar: SiparisHazirlikKalemiDto[];
}
