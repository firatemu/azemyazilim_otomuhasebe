import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsNumber,
    IsDateString,
    Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CashboxMovementType {
    COLLECTION = 'COLLECTION',
    PAYMENT = 'PAYMENT',
    INCOMING_TRANSFER = 'INCOMING_TRANSFER',
    OUTGOING_TRANSFER = 'OUTGOING_TRANSFER',
    CREDIT_CARD = 'CREDIT_CARD',
    TRANSFER = 'TRANSFER',
    CARRY_FORWARD = 'CARRY_FORWARD',
    CHECK_RECEIVED = 'CHECK_RECEIVED',
    CHECK_GIVEN = 'CHECK_GIVEN',
    PROMISSORY_RECEIVED = 'PROMISSORY_RECEIVED',
    PROMISSORY_GIVEN = 'PROMISSORY_GIVEN',
    CHECK_COLLECTION = 'CHECK_COLLECTION',
    PROMISSORY_COLLECTION = 'PROMISSORY_COLLECTION'
}

export class CreateCashboxMovementDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    cashboxId: string;

    @IsEnum(CashboxMovementType)
    @ApiProperty({ enum: CashboxMovementType })
    movementType: CashboxMovementType;

    @IsNumber()
    @Min(0)
    @ApiProperty()
    amount: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    documentType?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    documentNo?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    accountId?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    notes?: string;

    @IsDateString()
    @IsOptional()
    @ApiProperty({ required: false })
    date?: string;
}
