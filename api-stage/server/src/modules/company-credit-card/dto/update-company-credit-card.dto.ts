import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateCompanyCreditCardDto } from './create-company-credit-card.dto';

export class UpdateCompanyCreditCardDto extends PartialType(
  OmitType(CreateCompanyCreditCardDto, ['cashboxId'] as const),
) {
  // cashboxId burada olmamalı - OmitType ile çıkarıldı
  // Eğer frontend'den gönderilirse, service'de kontrol edilecek

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
  creditLimit?: number; // Kart creditLimiti (0 = creditLimitsiz, undefined = değiştirilmedi)
}
