import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class RejectWorkOrderDto {
  @IsNotEmpty({ message: 'WorkOrder ID is required' })
  @IsUUID('4', { message: 'WorkOrder ID must be a valid UUID' })
  workOrderId: string;

  @IsNotEmpty({ message: 'Solution Package ID is required' })
  @IsUUID('4', { message: 'Solution Package ID must be a valid UUID' })
  solutionPackageId: string;

  @IsNotEmpty({ message: 'Rejection reason is required' })
  @IsString()
  @Length(20, 2000, {
    message: 'Rejection reason must be between 20 and 2000 characters',
  })
  rejectionReason: string;
}

