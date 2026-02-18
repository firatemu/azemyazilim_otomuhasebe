import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddPackagePartDto } from './add-package-part.dto';

export class CreateSolutionPackageDto {
  @IsNotEmpty({ message: 'WorkOrder ID is required' })
  @IsUUID('4', { message: 'WorkOrder ID must be a valid UUID' })
  workOrderId: string;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Length(5, 200, {
    message: 'Name must be between 5 and 200 characters',
  })
  name: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @Length(20, 2000, {
    message: 'Description must be between 20 and 2000 characters',
  })
  description: string;

  @IsNotEmpty({ message: 'Estimated duration is required' })
  @IsInt({ message: 'Estimated duration must be an integer' })
  @Min(1, { message: 'Estimated duration must be at least 1 minute' })
  @Max(10080, { message: 'Estimated duration must be at most 10080 minutes (1 week)' })
  estimatedDurationMinutes: number;

  @IsNotEmpty({ message: 'Parts are required' })
  @IsArray({ message: 'Parts must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AddPackagePartDto)
  parts: AddPackagePartDto[];
}

