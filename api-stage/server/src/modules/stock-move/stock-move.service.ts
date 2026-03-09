import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateStockMoveDto } from './dto/create-stock-move.dto';
import { PutAwayDto } from './dto/put-away.dto';
import { BulkPutAwayDto } from './dto/bulk-put-away.dto';
import { TransferDto } from './dto/transfer.dto';
import { StockMoveType } from './dto/create-stock-move.dto';

@Injectable()
export class StockMoveService {
  constructor(private prisma: PrismaService) { }

  /**
   * ProductLocationStock bakiyesini günceller (veya oluşturur)
   */
  private async updateProductLocationStock(
    warehouseId: string,
    locationId: string,
    productId: string,
    qtyChange: number,
    prisma: any,
  ) {
    // Mevcut bakiye kaydını bul veya oluştur
    let stock = await prisma.productLocationStock.findUnique({
      where: {
        warehouseId_locationId_productId: {
          warehouseId,
          locationId,
          productId,
        },
      },
    });

    if (stock) {
      // Mevcut bakiye güncelle
      const newQty = stock.qtyOnHand + qtyChange;

      // Negatif product kontrolü
      if (newQty < 0) {
        throw new BadRequestException('Negative product is forbidden');
      }

      stock = await prisma.productLocationStock.update({
        where: {
          warehouseId_locationId_productId: {
            warehouseId,
            locationId,
            productId,
          },
        },
        data: {
          qtyOnHand: newQty,
        },
      });
    } else {
      // Yeni bakiye kaydı oluştur
      if (qtyChange < 0) {
        throw new BadRequestException('Negative product is forbidden');
      }

      stock = await prisma.productLocationStock.create({
        data: {
          warehouseId,
          locationId,
          productId,
          qtyOnHand: qtyChange,
        },
      });
    }

    return stock;
  }

  /**
   * Assign Location: Sadece raf adresi tanımlama (product hareketi yok)
   */
  async assignLocation(assignLocationDto: any, userId?: string) {
    // Ürün kontrolü
    const product = await this.prisma.extended.product.findUnique({
      where: { id: assignLocationDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Hedef depo kontrolü
    const toWarehouse = await this.prisma.extended.warehouse.findUnique({
      where: { id: assignLocationDto.toWarehouseId },
    });

    if (!toWarehouse) {
      throw new NotFoundException('Target warehouse not found');
    }

    if (!toWarehouse.active) {
      throw new BadRequestException('Target warehouse is not active');
    }

    // Hedef raf kontrolü
    const toLocation = await this.prisma.extended.location.findUnique({
      where: { id: assignLocationDto.toLocationId },
    });

    if (!toLocation) {
      throw new NotFoundException('Target shelf not found');
    }

    if (!toLocation.active) {
      throw new BadRequestException('Target shelf is not active');
    }

    if (toLocation.warehouseId !== assignLocationDto.toWarehouseId) {
      throw new BadRequestException('Target shelf does not belong to the target warehouse');
    }

    // ProductLocationStock kaydı oluştur veya güncelle
    return this.prisma.extended.$transaction(async (prisma) => {
      let stock = await prisma.productLocationStock.findUnique({
        where: {
          warehouseId_locationId_productId: {
            warehouseId: assignLocationDto.toWarehouseId,
            locationId: assignLocationDto.toLocationId,
            productId: assignLocationDto.productId,
          },
        },
      });

      const qty = assignLocationDto.qty || 0;

      if (stock) {
        // Mevcut kayıt varsa güncelle
        stock = await prisma.productLocationStock.update({
          where: {
            warehouseId_locationId_productId: {
              warehouseId: assignLocationDto.toWarehouseId,
              locationId: assignLocationDto.toLocationId,
              productId: assignLocationDto.productId,
            },
          },
          data: {
            qtyOnHand: stock.qtyOnHand + qty, // Mevcut stoka ekle
          },
        });
      } else {
        // Yeni kayıt oluştur
        stock = await prisma.productLocationStock.create({
          data: {
            warehouseId: assignLocationDto.toWarehouseId,
            locationId: assignLocationDto.toLocationId,
            productId: assignLocationDto.productId,
            qtyOnHand: qty,
          },
        });
      }

      return {
        message:
          qty > 0
            ? `Self address defined and ${qty} products added`
            : 'Shelf address defined (without product movement)',
        stock,
      };
    });
  }

  /**
   * Put-Away: Ürünü rafa yerleştirme (Gerçek product hareketi ile)
   */
  async putAway(putAwayDto: PutAwayDto, userId?: string) {
    // Ürün kontrolü
    const product = await this.prisma.extended.product.findUnique({
      where: { id: putAwayDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Ürünün toplam product quantityını hesapla (ProductMovement tablosundan, iptal faturalar hariç)
    const stokHareketler = await this.prisma.extended.productMovement.findMany({
      where: { productId: putAwayDto.productId },
      include: { invoiceItem: { include: { invoice: { select: { status: true } } } } },
    });

    let toplamStok = 0;
    stokHareketler.forEach((hareket) => {
      if ((hareket as any).invoiceItem?.invoice?.status === 'CANCELLED') return;
      if (
        hareket.movementType === 'ENTRY' ||
        hareket.movementType === 'COUNT_SURPLUS' ||
        hareket.movementType === 'RETURN' ||
        hareket.movementType === 'CANCELLATION_ENTRY'
      ) {
        toplamStok += hareket.quantity;
      } else if (
        hareket.movementType === 'EXIT' ||
        hareket.movementType === 'SALE' ||
        hareket.movementType === 'COUNT_SHORTAGE' ||
        hareket.movementType === 'CANCELLATION_EXIT'
      ) {
        toplamStok -= hareket.quantity;
      }
    });

    // Raflardaki toplam product
    const rafToplamStok = await this.prisma.extended.productLocationStock.aggregate({
      where: { productId: putAwayDto.productId },
      _sum: { qtyOnHand: true },
    });

    const mevcutRafStok = rafToplamStok._sum.qtyOnHand || 0;
    const yerlestirilecekStok = mevcutRafStok + putAwayDto.qty;

    // Toplam product kontrolü
    if (yerlestirilecekStok > toplamStok) {
      throw new BadRequestException(
        `Error: Total product (${toplamStok}) is insufficient! There are ${mevcutRafStok} units on the shelves, you want to add ${putAwayDto.qty} units. You can add a maximum of ${toplamStok - mevcutRafStok} units.`,
      );
    }

    // Hedef depo kontrolü
    const toWarehouse = await this.prisma.extended.warehouse.findUnique({
      where: { id: putAwayDto.toWarehouseId },
    });

    if (!toWarehouse) {
      throw new NotFoundException('Target warehouse not found');
    }

    if (!toWarehouse.active) {
      throw new BadRequestException('Target warehouse is not active');
    }

    // Hedef raf kontrolü
    const toLocation = await this.prisma.extended.location.findUnique({
      where: { id: putAwayDto.toLocationId },
    });

    if (!toLocation) {
      throw new NotFoundException('Target shelf not found');
    }

    if (!toLocation.active) {
      throw new BadRequestException('Target shelf is not active');
    }

    if (toLocation.warehouseId !== putAwayDto.toWarehouseId) {
      throw new BadRequestException('Target shelf does not belong to the target warehouse');
    }

    // Transaction içinde işlem yap
    return this.prisma.extended.$transaction(async (prisma) => {
      // Stok bakiye güncelle (hedef rafa ekle)
      await this.updateProductLocationStock(
        putAwayDto.toWarehouseId,
        putAwayDto.toLocationId,
        putAwayDto.productId,
        putAwayDto.qty,
        prisma,
      );

      // Stok hareketi kaydı oluştur
      const stockMove = await prisma.stockMove.create({
        data: {
          productId: putAwayDto.productId,
          fromWarehouseId: null, // Put-away için kaynak yok
          fromLocationId: null,
          toWarehouseId: putAwayDto.toWarehouseId,
          toLocationId: putAwayDto.toLocationId,
          quantity: putAwayDto.qty,
          moveType: StockMoveType.PUT_AWAY,
          refType: 'PutAway',
          notes: putAwayDto.note,
          createdBy: userId,
        },
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          toWarehouse: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          toLocation: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      });

      return stockMove;
    });
  }

  /**
   * Bulk Put-Away: Toplu ürün yerleştirme (Excel ile)
   */
  async bulkPutAway(bulkPutAwayDto: BulkPutAwayDto, userId?: string) {
    const results = {
      success: [] as any[],
      failed: [] as any[],
      total: bulkPutAwayDto.operations.length,
    };

    // Her bir işlemi sırayla yap
    for (const [index, operation] of bulkPutAwayDto.operations.entries()) {
      try {
        const stockMove = await this.putAway(operation, userId);
        results.success.push({
          index: index + 1,
          operation,
          stockMove,
        });
      } catch (error) {
        results.failed.push({
          index: index + 1,
          operation,
          error: error.message || 'Unknown error',
        });
      }
    }

    return {
      ...results,
      successCount: results.success.length,
      failedCount: results.failed.length,
    };
  }

  /**
   * Transfer: Raflar arası transfer
   */
  async transfer(transferDto: TransferDto, userId?: string) {
    // Ürün kontrolü
    const product = await this.prisma.extended.product.findUnique({
      where: { id: transferDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Kaynak depo kontrolü
    const fromWarehouse = await this.prisma.extended.warehouse.findUnique({
      where: { id: transferDto.fromWarehouseId },
    });

    if (!fromWarehouse) {
      throw new NotFoundException('Source warehouse not found');
    }

    if (!fromWarehouse.active) {
      throw new BadRequestException('Source warehouse is not active');
    }

    // Kaynak raf kontrolü
    const fromLocation = await this.prisma.extended.location.findUnique({
      where: { id: transferDto.fromLocationId },
    });

    if (!fromLocation) {
      throw new NotFoundException('Source shelf not found');
    }

    if (!fromLocation.active) {
      throw new BadRequestException('Source shelf is not active');
    }

    if (fromLocation.warehouseId !== transferDto.fromWarehouseId) {
      throw new BadRequestException('Source shelf does not belong to the source warehouse');
    }

    // Hedef depo kontrolü
    const toWarehouse = await this.prisma.extended.warehouse.findUnique({
      where: { id: transferDto.toWarehouseId },
    });

    if (!toWarehouse) {
      throw new NotFoundException('Target warehouse not found');
    }

    if (!toWarehouse.active) {
      throw new BadRequestException('Target warehouse is not active');
    }

    // Hedef raf kontrolü
    const toLocation = await this.prisma.extended.location.findUnique({
      where: { id: transferDto.toLocationId },
    });

    if (!toLocation) {
      throw new NotFoundException('Target shelf not found');
    }

    if (!toLocation.active) {
      throw new BadRequestException('Target shelf is not active');
    }

    if (toLocation.warehouseId !== transferDto.toWarehouseId) {
      throw new BadRequestException('Target shelf does not belong to the target warehouse');
    }

    // Kaynak = Hedef kontrolü
    if (
      transferDto.fromWarehouseId === transferDto.toWarehouseId &&
      transferDto.fromLocationId === transferDto.toLocationId
    ) {
      throw new BadRequestException('Source and target shelf cannot be the same');
    }

    // Transaction içinde işlem yap
    return this.prisma.extended.$transaction(async (prisma) => {
      // Kaynak rafta yeterli product var mı kontrol et
      const sourceStock = await prisma.productLocationStock.findUnique({
        where: {
          warehouseId_locationId_productId: {
            warehouseId: transferDto.fromWarehouseId,
            locationId: transferDto.fromLocationId,
            productId: transferDto.productId,
          },
        },
      });

      if (!sourceStock || sourceStock.qtyOnHand < transferDto.qty) {
        throw new BadRequestException('Not enough products on the source shelf');
      }

      // Kaynak raftan çıkar
      await this.updateProductLocationStock(
        transferDto.fromWarehouseId,
        transferDto.fromLocationId,
        transferDto.productId,
        -transferDto.qty,
        prisma,
      );

      // Hedef rafa ekle
      await this.updateProductLocationStock(
        transferDto.toWarehouseId,
        transferDto.toLocationId,
        transferDto.productId,
        transferDto.qty,
        prisma,
      );

      // Stok hareketi kaydı oluştur
      const stockMove = await prisma.stockMove.create({
        data: {
          productId: transferDto.productId,
          fromWarehouseId: transferDto.fromWarehouseId,
          fromLocationId: transferDto.fromLocationId,
          toWarehouseId: transferDto.toWarehouseId,
          toLocationId: transferDto.toLocationId,
          quantity: transferDto.qty,
          moveType: StockMoveType.TRANSFER,
          refType: 'Transfer',
          notes: transferDto.note,
          createdBy: userId,
        },
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          fromWarehouse: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          fromLocation: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          toWarehouse: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          toLocation: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      });

      return stockMove;
    });
  }

  async findAll(
    productId?: string,
    warehouseId?: string,
    locationId?: string,
    moveType?: StockMoveType,
    limit?: number,
  ) {
    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (warehouseId) {
      where.OR = [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId },
      ];
    }

    if (locationId) {
      where.OR = [{ fromLocationId: locationId }, { toLocationId: locationId }];
    }

    if (moveType) {
      where.moveType = moveType;
    }

    return this.prisma.extended.stockMove.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            brand: true,
          },
        },
        fromWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        fromLocation: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        toWarehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        toLocation: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit || 100,
    });
  }

  async findOne(id: string) {
    const stockMove = await this.prisma.extended.stockMove.findUnique({
      where: { id },
      include: {
        product: true,
        fromWarehouse: true,
        fromLocation: true,
        toWarehouse: true,
        toLocation: true,
        createdByUser: true,
      },
    });

    if (!stockMove) {
      throw new NotFoundException('Stock movement not found');
    }

    return stockMove;
  }
}
