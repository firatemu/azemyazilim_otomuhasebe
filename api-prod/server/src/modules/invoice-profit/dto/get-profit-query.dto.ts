import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetProfitQueryDto {
  @IsOptional()
  @IsString()
  stokId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  cariId?: string;

  @IsOptional()
  @IsString()
  durum?: string;
}
