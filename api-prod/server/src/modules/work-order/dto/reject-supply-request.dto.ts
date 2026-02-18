import {
  IsString,
  IsOptional,
} from 'class-validator';

/**
 * DTO for rejecting supply request
 */
export class RejectSupplyRequestDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

