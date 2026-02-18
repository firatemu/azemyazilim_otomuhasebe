import {
  IsArray,
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SevkSiparisKalemiDto {
  @IsString()
  @IsNotEmpty()
  kalemId: string;

  @IsNumber()
  @Min(1)
  sevkMiktar: number;
}

export class SevkSiparisDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SevkSiparisKalemiDto)
  kalemler: SevkSiparisKalemiDto[];
}
