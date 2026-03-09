import { IsNotEmpty, IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateSalesAgentDto {
    @IsNotEmpty({ message: 'Ad soyad boş olamaz' })
    @IsString()
    fullName: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Geçersiz e-posta adresi' })
    email?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
