import {
    IsNotEmpty,
    IsString,
    IsEnum,
    IsOptional,
    IsEmail,
    Length,
    IsBoolean,
    IsInt,
    Min,
    ValidateNested,
    IsArray,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum AccountType {
    CUSTOMER = 'CUSTOMER',
    SUPPLIER = 'SUPPLIER',
    BOTH = 'BOTH'
}

export enum CompanyType {
    CORPORATE = 'CORPORATE',
    INDIVIDUAL = 'INDIVIDUAL'
}

export enum RiskStatus {
    NORMAL = 'NORMAL',
    RISKY = 'RISKY',
    BLACK_LIST = 'BLACK_LIST',
    IN_COLLECTION = 'IN_COLLECTION'
}

export enum AddressType {
    DELIVERY = 'DELIVERY',
    INVOICE = 'INVOICE',
    CENTER = 'CENTER',
    BRANCH = 'BRANCH',
    WAREHOUSE = 'WAREHOUSE',
    OTHER = 'OTHER',
    SHIPMENT = 'SHIPMENT'
}

export class CreateAccountContactDto {
    @IsNotEmpty() @IsString() @ApiProperty() fullName: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) title?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) phone?: string;
    @IsOptional() @IsEmail() @ApiProperty({ required: false }) email?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) extension?: string;
    @IsOptional() @IsBoolean() @ApiProperty({ required: false }) isDefault?: boolean;
    @IsOptional() @IsString() @ApiProperty({ required: false }) notes?: string;
}

export class CreateAccountAddressDto {
    @IsNotEmpty() @IsString() @ApiProperty() title: string;
    @IsEnum(AddressType) @ApiProperty({ enum: AddressType }) type: AddressType;
    @IsNotEmpty() @IsString() @ApiProperty() address: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) city?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) district?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) postalCode?: string;
    @IsOptional() @IsBoolean() @ApiProperty({ required: false }) isDefault?: boolean;
}

export class CreateAccountBankDto {
    @IsNotEmpty() @IsString() @ApiProperty() bankName: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) branchName?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) branchCode?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) accountNo?: string;
    @IsNotEmpty() @IsString() @ApiProperty() iban: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) currency?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) notes?: string;
}

export class CreateAccountDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    code?: string;

    @IsNotEmpty({ message: 'Title cannot be empty' })
    @IsString()
    @ApiProperty()
    title: string;

    @IsOptional()
    @IsEnum(AccountType)
    @ApiProperty({ enum: AccountType, required: false })
    type?: AccountType;

    @IsOptional()
    @IsEnum(CompanyType)
    @ApiProperty({ enum: CompanyType, required: false })
    companyType?: CompanyType;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    taxNumber?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    taxOffice?: string;

    @IsOptional()
    @IsString()
    @Length(11, 11, { message: 'National ID must be 11 characters' })
    @ApiProperty({ required: false })
    nationalId?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    fullName?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    phone?: string;

    @IsOptional()
    @IsEmail()
    @ApiProperty({ required: false })
    email?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    country?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    city?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    district?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    address?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    contactPerson?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @ApiProperty({ required: false })
    paymentTermDays?: number;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ required: false })
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? null : value)
    @ApiProperty({ required: false })
    salesAgentId?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @ApiProperty({ required: false })
    creditLimit?: number;

    @IsEnum(RiskStatus)
    @IsOptional()
    @ApiProperty({ enum: RiskStatus, required: false })
    creditStatus?: RiskStatus;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @ApiProperty({ required: false })
    collateralAmount?: number;

    @IsOptional() @IsString() @ApiProperty({ required: false }) sector?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) customCode1?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) customCode2?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) website?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) fax?: string;
    @IsOptional() @IsInt() @ApiProperty({ required: false }) dueDays?: number;
    @IsOptional() @IsString() @ApiProperty({ required: false }) currency?: string;
    @IsOptional() @IsString() @ApiProperty({ required: false }) bankInfo?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAccountContactDto)
    @ApiProperty({ type: [CreateAccountContactDto], required: false })
    contacts?: CreateAccountContactDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAccountAddressDto)
    @ApiProperty({ type: [CreateAccountAddressDto], required: false })
    addresses?: CreateAccountAddressDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAccountBankDto)
    @ApiProperty({ type: [CreateAccountBankDto], required: false })
    banks?: CreateAccountBankDto[];
}
