import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PurchaseOrderLocalStatus } from '@prisma/client';

export class QueryPurchaseOrderDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    page?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    limit?: string;

    @IsOptional()
    @IsEnum(PurchaseOrderLocalStatus)
    @ApiProperty({ enum: PurchaseOrderLocalStatus, required: false })
    status?: PurchaseOrderLocalStatus;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    search?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    accountId?: string;
}
