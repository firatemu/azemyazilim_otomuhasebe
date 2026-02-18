import { IsString, IsNotEmpty } from 'class-validator';

export class AssignBasePlanLicenseDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class AssignModuleLicenseDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  moduleSlug: string;
}

export class RevokeLicenseDto {
  @IsString()
  @IsNotEmpty()
  licenseId: string;
}

export class InviteUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class PurchaseAdditionalUsersDto {
  @IsString()
  @IsNotEmpty()
  quantity: string; // String olarak al, parseInt ile dönüştür
}

export class PurchaseModuleLicenseDto {
  @IsString()
  @IsNotEmpty()
  moduleSlug: string;

  @IsString()
  @IsNotEmpty()
  quantity: string; // String olarak al, parseInt ile dönüştür
}


