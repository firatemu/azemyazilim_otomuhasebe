import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Length,
  Matches,
} from 'class-validator';

export class UpdateTechnicalFindingDto {
  @IsOptional()
  @IsString()
  @Length(5, 200, {
    message: 'Title must be between 5 and 200 characters',
  })
  @Matches(/^[a-zA-Z0-9\s\-\_\.]+$/, {
    message: 'Title contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and dots are allowed',
  })
  title?: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000, {
    message: 'Description must be between 10 and 5000 characters',
  })
  description?: string;

  @IsNotEmpty({ message: 'Version is required for optimistic locking' })
  @IsInt({ message: 'Version must be an integer' })
  @Min(1, { message: 'Version must be at least 1' })
  version: number;
}

