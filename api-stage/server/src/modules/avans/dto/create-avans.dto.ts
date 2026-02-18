import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    Min,
} from 'class-validator';

export class CreateAvansDto {
    @IsNotEmpty({ message: 'Personel ID zorunludur' })
    @IsString()
    personelId: string;

    @IsNotEmpty({ message: 'Tutar zorunludur' })
    @IsNumber()
    @Min(0.01, { message: 'Tutar 0\'dan büyük olmalıdır' })
    tutar: number;

    @IsOptional()
    tarih?: Date;

    @IsOptional()
    @IsString()
    aciklama?: string;

    @IsOptional()
    @IsString()
    kasaId?: string; // Hangi kasadan verildi
}
