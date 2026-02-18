import { IsUUID } from 'class-validator';

export class CalculateCostDto {
  @IsUUID()
  stokId!: string;
}
