import {
  IsArray,
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SevkSatinAlmaSiparisKalemiDto {
  @IsString()
  @IsNotEmpty()
  kalemId: string;

  @IsNumber()
  @Min(1)
  sevkMiktar: number;
}

export class SevkSatinAlmaSiparisDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SevkSatinAlmaSiparisKalemiDto)
  kalemler: SevkSatinAlmaSiparisKalemiDto[];
}

