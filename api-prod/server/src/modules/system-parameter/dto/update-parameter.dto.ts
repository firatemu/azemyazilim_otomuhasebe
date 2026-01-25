import { IsOptional } from 'class-validator';

export class UpdateParameterDto {
  @IsOptional()
  value?: any;

  @IsOptional()
  description?: string;

  @IsOptional()
  category?: string;
}
