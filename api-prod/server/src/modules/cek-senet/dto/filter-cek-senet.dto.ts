import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { CekSenetTip, PortfoyTip, CekSenetDurum } from '@prisma/client';

export class FilterCekSenetDto {
  @IsOptional()
  @IsEnum(CekSenetTip)
  tip?: CekSenetTip;

  @IsOptional()
  @IsEnum(PortfoyTip)
  portfoyTip?: PortfoyTip;

  @IsOptional()
  @IsEnum(CekSenetDurum)
  durum?: CekSenetDurum;

  @IsOptional()
  @IsString()
  cariId?: string;

  @IsOptional()
  @IsDateString()
  vadeBaslangic?: string;

  @IsOptional()
  @IsDateString()
  vadeBitis?: string;

  @IsOptional()
  @IsString()
  cekNo?: string;

  @IsOptional()
  @IsString()
  seriNo?: string;
}
