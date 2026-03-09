import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class OverviewQueryDto {
  @IsOptional()
  @IsIn(['today', 'thisMonth', 'lastMonth', 'last30', 'last90', 'custom'])
  preset?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
