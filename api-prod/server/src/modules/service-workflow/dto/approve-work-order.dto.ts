import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  Length,
} from 'class-validator';

export class ApproveWorkOrderDto {
  @IsNotEmpty({ message: 'WorkOrder ID is required' })
  @IsUUID('4', { message: 'WorkOrder ID must be a valid UUID' })
  workOrderId: string;

  @IsNotEmpty({ message: 'Solution Package ID is required' })
  @IsUUID('4', { message: 'Solution Package ID must be a valid UUID' })
  solutionPackageId: string;

  @IsOptional()
  @IsString()
  @Length(10, 1000, {
    message: 'Approval note must be between 10 and 1000 characters',
  })
  approvalNote?: string;
}

