import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CashboxType } from '../cashbox.enums';

export class CreateCashboxDto {
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    code?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name: string;

    @IsEnum(CashboxType)
    @ApiProperty({ enum: CashboxType })
    type: CashboxType;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ required: false, default: true })
    isActive?: boolean;
}
