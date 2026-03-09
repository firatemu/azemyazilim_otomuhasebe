import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateCompanyCreditCardDto {
  @IsString()
  @IsNotEmpty()
  cashboxId: string; // Hangi Firma KK cashboxsına bağlı

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  name: string; // "Ziraat Visa - Ahmet Bey"

  @IsString()
  @IsNotEmpty()
  bankName: string; // Ziraat, Garanti vb.

  @IsString()
  @IsOptional()
  cardType?: string; // Visa, MasterCard

  @IsString()
  @IsOptional()
  lastFourDigits?: string;

  @IsNumber()
  @IsOptional()
  @Min(0, {
    message: 'Limit 0 veya daha büyük olmalıdır. 0 creditLimitsiz anlamına gelir.',
  })
  @Type(() => Number)
  @Transform(({ value }) => {
    // String gelirse number'a çevir
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    }
    return value;
  })
  creditLimit?: number; // Kart creditLimiti (0 = creditLimitsiz)

  @IsDateString()
  @IsOptional()
  statementDate?: string; // ISO date string

  @IsDateString()
  @IsOptional()
  paymentDueDate?: string; // ISO date string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
