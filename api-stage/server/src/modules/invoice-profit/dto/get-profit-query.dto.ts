import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetProfitQueryDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
