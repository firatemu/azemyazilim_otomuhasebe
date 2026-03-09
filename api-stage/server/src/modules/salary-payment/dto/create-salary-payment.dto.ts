import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsArray,
    ValidateNested,
    IsEnum,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class SalaryPaymentDetailDto {
    @IsNotEmpty({ message: 'Ödeme tipi zorunludur' })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsNotEmpty({ message: 'Tutar zorunludur' })
    @IsNumber()
    @Min(0.01, { message: 'Tutar 0\'dan büyük olmalıdır' })
    amount: number;

    @IsOptional()
    @IsString()
    cashboxId?: string;

    @IsOptional()
    @IsString()
    bankAccountId?: string;

    @IsOptional()
    @IsString()
    referenceNo?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateSalaryPaymentDto {
    @IsNotEmpty({ message: 'Plan ID zorunludur' })
    @IsString()
    salaryPlanId: string;

    @IsNotEmpty({ message: 'Personel ID zorunludur' })
    @IsString()
    employeeId: string;

    @IsNotEmpty({ message: 'Tutar zorunludur' })
    @IsNumber()
    @Min(0.01, { message: 'Tutar 0\'dan büyük olmalıdır' })
    amount: number;

    @IsOptional()
    date?: Date;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsNotEmpty({ message: 'Ödeme detayları zorunludur' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SalaryPaymentDetailDto)
    paymentDetails: SalaryPaymentDetailDto[];
}
