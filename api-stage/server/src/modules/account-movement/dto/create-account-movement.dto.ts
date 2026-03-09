import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsDateString,
    IsNumber,
} from 'class-validator';

export enum AccountMovementType {
    DEBIT = 'DEBIT',
    CREDIT = 'CREDIT',
    CARRY_FORWARD = 'CARRY_FORWARD'
}

export enum MovementDocumentType {
    INVOICE = 'INVOICE',
    COLLECTION = 'COLLECTION',
    PAYMENT = 'PAYMENT',
    CHECK_PROMISSORY = 'CHECK_PROMISSORY',
    CARRY_FORWARD = 'CARRY_FORWARD',
    CORRECTION = 'CORRECTION',
    CHECK_ENTRY = 'CHECK_ENTRY',
    CHECK_EXIT = 'CHECK_EXIT',
    RETURN = 'RETURN',
}

export class CreateAccountMovementDto {
    @IsString()
    @IsNotEmpty()
    accountId: string;

    @IsEnum(AccountMovementType)
    @IsNotEmpty()
    type: AccountMovementType;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsOptional()
    @IsEnum(MovementDocumentType)
    documentType?: MovementDocumentType;

    @IsOptional()
    @IsString()
    documentNo?: string;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsString()
    @IsNotEmpty()
    notes: string;
}
