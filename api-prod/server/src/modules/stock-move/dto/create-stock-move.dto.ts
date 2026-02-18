import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { StockMoveType } from '@prisma/client';

export class CreateStockMoveDto {
  @IsString()
  @IsNotEmpty()
  productId: string; // Stok ID

  @IsString()
  @IsOptional()
  fromWarehouseId?: string; // Kaynak depo (nullable - put-away için NULL)

  @IsString()
  @IsOptional()
  fromLocationId?: string; // Kaynak raf (nullable)

  @IsString()
  @IsNotEmpty()
  toWarehouseId: string; // Hedef depo

  @IsString()
  @IsNotEmpty()
  toLocationId: string; // Hedef raf

  @IsInt()
  @Min(1)
  qty: number; // Miktar (pozitif)

  @IsEnum(StockMoveType)
  moveType: StockMoveType; // PUT_AWAY, TRANSFER, vb.

  @IsString()
  @IsOptional()
  refType?: string; // Referans tipi (Order, PutAway, Transfer, vb.)

  @IsString()
  @IsOptional()
  refId?: string; // Referans ID (işlem referansı)

  @IsString()
  @IsOptional()
  note?: string; // Açıklama
}
