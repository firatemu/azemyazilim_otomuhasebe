import {
    IsNotEmpty,
    IsString,
    IsArray,
    ValidateNested,
    IsNumber,
    IsOptional,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MahsuplasmaPlanDto {
    @IsNotEmpty({ message: 'Plan ID zorunludur' })
    @IsString()
    planId: string;

    @IsNotEmpty({ message: 'Tutar zorunludur' })
    @IsNumber()
    @Min(0.01, { message: 'Tutar 0\'dan büyük olmalıdır' })
    amount: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class MahsuplastirAdvanceDto {
    @IsNotEmpty({ message: 'Advance ID zorunludur' })
    @IsString()
    advanceId: string;

    @IsNotEmpty({ message: 'Mahsuplaşma planları zorunludur' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MahsuplasmaPlanDto)
    planlar: MahsuplasmaPlanDto[];
}
