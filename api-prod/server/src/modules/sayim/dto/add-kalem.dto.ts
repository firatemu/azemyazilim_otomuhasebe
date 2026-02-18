import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class AddKalemDto {
  @IsString()
  @IsNotEmpty()
  stokId: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsNumber()
  @Min(0)
  sayilanMiktar: number;
}
