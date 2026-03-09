import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsUUID()
  customerVehicleId?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
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

  @IsOptional()
  @IsString()
  supplyResponseNotes?: string;
}
