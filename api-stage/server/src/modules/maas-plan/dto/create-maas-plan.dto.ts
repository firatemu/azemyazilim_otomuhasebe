import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    Min,
    Max,
} from 'class-validator';

export class CreateMaasPlanDto {
    @IsNotEmpty({ message: 'Personel ID zorunludur' })
    @IsString()
    personelId: string;

    @IsNotEmpty({ message: 'Yıl zorunludur' })
    @IsNumber()
    @Min(2020)
    @Max(2100)
    yil: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    maas?: number; // Personelden alınacak, opsiyonel override

    @IsOptional()
    @IsNumber()
    @Min(0)
    prim?: number; // Personelden alınacak, opsiyonel override
}
