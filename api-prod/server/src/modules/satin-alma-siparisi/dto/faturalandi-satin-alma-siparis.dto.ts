import { IsString, IsNotEmpty } from 'class-validator';

export class FaturalandiSatinAlmaSiparisDto {
  @IsString()
  @IsNotEmpty()
  faturaNo: string;
}
