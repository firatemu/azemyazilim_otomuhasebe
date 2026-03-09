import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePosSessionDto {
  @ApiProperty({ description: 'Kasiyer ID' })
  cashierId: string;

  @ApiProperty({ description: 'Kasa ID' })
  cashboxId: string;

  @ApiProperty({ description: 'Açılış amountı' })
  openingAmount: number;
}
