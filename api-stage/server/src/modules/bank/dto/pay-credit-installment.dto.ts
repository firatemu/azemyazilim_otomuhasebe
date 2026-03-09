import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentType {
    BANKA_HAVALESI = 'BANKA_HAVALESI',
    CASH = 'CASH',
    ELDEN = 'ELDEN'
}

export class PayCreditInstallmentDto {
    @IsEnum(PaymentType)
    @ApiProperty({ enum: PaymentType })
    paymentType: PaymentType; // Renamed from paymentType

    @IsNumber()
    @ApiProperty()
    amount: number; // Renamed from amount

    @ValidateIf(o => o.paymentType === PaymentType.BANKA_HAVALESI)
    @IsString()
    @ApiProperty({ required: false })
    bankAccountId?: string; // Renamed from bankHesapId

    @ValidateIf(o => o.paymentType === PaymentType.CASH)
    @IsString()
    @ApiProperty({ required: false })
    cashboxId?: string; // Renamed from cashboxId

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    notes?: string; // Renamed from notes

    @IsOptional()
    @IsDateString()
    @ApiProperty({ required: false })
    paymentDate?: string; // Renamed from paymentDate
}
