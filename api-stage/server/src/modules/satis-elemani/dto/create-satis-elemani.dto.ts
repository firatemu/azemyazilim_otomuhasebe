import { IsNotEmpty, IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateSatisElemaniDto {
    @IsNotEmpty({ message: 'Ad soyad boş olamaz' })
    @IsString()
    adSoyad: string;

    @IsOptional()
    @IsString()
    telefon?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Geçersiz e-posta adresi' })
    email?: string;

    @IsOptional()
    @IsBoolean()
    aktif?: boolean;
}
