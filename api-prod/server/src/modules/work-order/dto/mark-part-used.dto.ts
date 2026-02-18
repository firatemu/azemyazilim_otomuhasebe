import { IsUUID } from 'class-validator';

export class MarkPartUsedDto {
  @IsUUID()
  lineId: string;

  @IsUUID()
  warehouseId: string;

  @IsUUID()
  locationId: string;
}

export class MarkAllPartsUsedDto {
  @IsUUID()
  warehouseId: string;

  @IsUUID()
  locationId: string;
}

