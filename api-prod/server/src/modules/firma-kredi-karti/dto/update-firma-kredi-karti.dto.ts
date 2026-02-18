import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateFirmaKrediKartiDto } from './create-firma-kredi-karti.dto';

export class UpdateFirmaKrediKartiDto extends PartialType(
  OmitType(CreateFirmaKrediKartiDto, ['kasaId'] as const),
) {
  // kasaId burada olmamalı - OmitType ile çıkarıldı
  // Eğer frontend'den gönderilirse, service'de kontrol edilecek

  @IsNumber()
  @IsOptional()
  @Min(0, {
    message: 'Limit 0 veya daha büyük olmalıdır. 0 limitsiz anlamına gelir.',
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
  limit?: number; // Kart limiti (0 = limitsiz, undefined = değiştirilmedi)
}
