import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsInt,
} from 'class-validator';

export class AddLaborLineDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  laborHours: number;

  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  taxRate?: number;
}

