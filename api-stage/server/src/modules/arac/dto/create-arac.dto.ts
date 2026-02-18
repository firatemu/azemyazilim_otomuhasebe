import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAracDto {
  @IsNotEmpty()
  @IsString()
  marka: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  motorHacmi: string;

  @IsNotEmpty()
  @IsString()
  yakitTipi: string;
}
