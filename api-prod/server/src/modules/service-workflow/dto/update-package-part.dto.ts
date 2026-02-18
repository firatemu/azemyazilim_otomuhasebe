import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdatePackagePartDto {
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.001, { message: 'Quantity must be greater than 0' })
  @Max(999999, { message: 'Quantity must be less than 999999' })
  quantity: number;
}

