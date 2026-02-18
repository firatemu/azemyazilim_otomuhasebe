import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  Length,
} from 'class-validator';

export class UpdateSolutionPackageDto {
  @IsOptional()
  @IsString()
  @Length(5, 200, {
    message: 'Name must be between 5 and 200 characters',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(20, 2000, {
    message: 'Description must be between 20 and 2000 characters',
  })
  description?: string;

  @IsOptional()
  @IsInt({ message: 'Estimated duration must be an integer' })
  @Min(1, { message: 'Estimated duration must be at least 1 minute' })
  @Max(10080, { message: 'Estimated duration must be at most 10080 minutes (1 week)' })
  estimatedDurationMinutes?: number;

  @IsNotEmpty({ message: 'Version is required for optimistic locking' })
  @IsInt({ message: 'Version must be an integer' })
  @Min(1, { message: 'Version must be at least 1' })
  version: number;
}

