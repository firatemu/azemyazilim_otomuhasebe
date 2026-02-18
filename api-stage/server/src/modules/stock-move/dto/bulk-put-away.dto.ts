import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { PutAwayDto } from './put-away.dto';

export class BulkPutAwayDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'En az 1 adet işlem gerekli' })
  @ValidateNested({ each: true })
  @Type(() => PutAwayDto)
  operations: PutAwayDto[];
}
