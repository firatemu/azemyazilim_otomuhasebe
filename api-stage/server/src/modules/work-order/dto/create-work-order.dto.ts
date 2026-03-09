import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateWorkOrderDto {
  @IsNotEmpty()
  @IsString()
  customerVehicleId: string;

  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  estimatedCompletionDate?: string;

  @IsOptional()
  @IsString()
  diagnosisNotes?: string;
}
