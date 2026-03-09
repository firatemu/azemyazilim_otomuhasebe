import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    Min,
} from 'class-validator';

export class CreateAdvanceDto {
    @IsNotEmpty({ message: 'Employee ID zorunludur' })
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

    @IsOptional()
    @IsString()
    cashboxId?: string; // Hangi cashboxdan verildi
}
