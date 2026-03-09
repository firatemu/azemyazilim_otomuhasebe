import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryNoteStatus } from '../sales-waybill.enums';

export class FilterSalesWaybillDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  page?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  limit?: string;

  @IsOptional()
  @IsEnum(DeliveryNoteStatus)
  @ApiProperty({ enum: DeliveryNoteStatus, required: false })
  status?: DeliveryNoteStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  accountId?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  endDate?: string;
}
