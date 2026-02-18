import { IsString, IsNotEmpty } from 'class-validator';

export class FaturalandiSiparisDto {
  @IsString()
  @IsNotEmpty()
  faturaNo: string;
}
