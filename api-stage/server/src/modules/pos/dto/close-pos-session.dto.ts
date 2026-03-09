import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClosePosSessionDto {
  @ApiProperty({ description: 'Kapanış amountı' })
  closingAmount: number;

  @ApiProperty({ description: 'Kapanış notesı' })
  @IsOptional()
  closingNotes?: string;
}
