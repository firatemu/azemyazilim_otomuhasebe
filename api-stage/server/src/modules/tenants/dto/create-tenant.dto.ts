import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  planSlug?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxCompanies?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxInvoices?: number;
}
