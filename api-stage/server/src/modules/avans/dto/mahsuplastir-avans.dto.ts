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
    tutar: number;

    @IsOptional()
    @IsString()
    aciklama?: string;
}

export class MahsuplastirAvansDto {
    @IsNotEmpty({ message: 'Avans ID zorunludur' })
    @IsString()
    avansId: string;

    @IsNotEmpty({ message: 'Mahsuplaşma planları zorunludur' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MahsuplasmaPlanDto)
    planlar: MahsuplasmaPlanDto[];
}
