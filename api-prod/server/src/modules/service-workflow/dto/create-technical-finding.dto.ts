import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreateTechnicalFindingDto {
  @IsNotEmpty({ message: 'WorkOrder ID is required' })
  @IsUUID('4', { message: 'WorkOrder ID must be a valid UUID' })
  workOrderId: string;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @Length(5, 200, {
    message: 'Title must be between 5 and 200 characters',
  })
  @Matches(/^[a-zA-Z0-9\s\-\_\.]+$/, {
    message: 'Title contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and dots are allowed',
  })
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @Length(10, 5000, {
    message: 'Description must be between 10 and 5000 characters',
  })
  description: string;
}

