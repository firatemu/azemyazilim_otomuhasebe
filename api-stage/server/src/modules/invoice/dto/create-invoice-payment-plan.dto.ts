import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateInvoicePaymentPlanDto {
    @IsDateString()
    @IsNotEmpty()
    vade: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    @IsOptional()
    paymentType?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsBoolean()
    @IsOptional()
    odendi?: boolean;
}
