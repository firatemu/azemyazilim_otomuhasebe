import { IsString, IsOptional } from 'class-validator';

export class CreateParameterDto {
  @IsString()
  key!: string;

  // value can be any JSON-serializable type (boolean, number, string, object, array)
  value!: any;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
