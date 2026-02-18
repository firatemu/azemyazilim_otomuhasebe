import { IsUUID } from 'class-validator';

export class TogglePartUsedDto {
  @IsUUID()
  lineId: string;
}


