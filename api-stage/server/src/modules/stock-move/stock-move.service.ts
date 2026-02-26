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
import { StockMoveType } from '@prisma/client';

@Injectable()
export class StockMoveService {
  constructor(private prisma: PrismaService) {}

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

      // Negatif stok kontrolü
      if (newQty < 0) {
        throw new BadRequestException('Negatif stok yasak');
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
        throw new BadRequestException('Negatif stok yasak');
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
   * Assign Location: Sadece raf adresi tanımlama (stok hareketi yok)
   */
  async assignLocation(assignLocationDto: any, userId?: string) {
    // Ürün kontrolü
    const product = await this.prisma.stok.findUnique({
      where: { id: assignLocationDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Hedef depo kontrolü
    const toWarehouse = await this.prisma.warehouse.findUnique({
      where: { id: assignLocationDto.toWarehouseId },
    });

    if (!toWarehouse) {
      throw new NotFoundException('Hedef depo bulunamadı');
    }

    if (!toWarehouse.active) {
      throw new BadRequestException('Hedef depo aktif değil');
    }

    // Hedef raf kontrolü
    const toLocation = await this.prisma.location.findUnique({
      where: { id: assignLocationDto.toLocationId },
    });

    if (!toLocation) {
      throw new NotFoundException('Hedef raf bulunamadı');
    }

    if (!toLocation.active) {
      throw new BadRequestException('Hedef raf aktif değil');
    }

    if (toLocation.warehouseId !== assignLocationDto.toWarehouseId) {
      throw new BadRequestException('Hedef raf, hedef depoya ait değil');
    }

    // ProductLocationStock kaydı oluştur veya güncelle
    return this.prisma.$transaction(async (prisma) => {
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
            ? `Raf adresi tanımlandı ve ${qty} adet stok eklendi`
            : 'Raf adresi tanımlandı (stok hareketi olmadan)',
        stock,
      };
    });
  }

  /**
   * Put-Away: Ürünü rafa yerleştirme (Gerçek stok hareketi ile)
   */
  async putAway(putAwayDto: PutAwayDto, userId?: string) {
    // Ürün kontrolü
    const product = await this.prisma.stok.findUnique({
      where: { id: putAwayDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Ürünün toplam stok miktarını hesapla (StokHareket tablosundan, iptal faturalar hariç)
    const stokHareketler = await this.prisma.stokHareket.findMany({
      where: { stokId: putAwayDto.productId },
      include: { faturaKalemi: { include: { fatura: { select: { durum: true } } } } },
    });

    let toplamStok = 0;
    stokHareketler.forEach((hareket) => {
      if ((hareket as any).faturaKalemi?.fatura?.durum === 'IPTAL') return;
      if (
        hareket.hareketTipi === 'GIRIS' ||
        hareket.hareketTipi === 'SAYIM_FAZLA' ||
        hareket.hareketTipi === 'IADE' ||
        hareket.hareketTipi === 'IPTAL_GIRIS'
      ) {
        toplamStok += hareket.miktar;
      } else if (
        hareket.hareketTipi === 'CIKIS' ||
        hareket.hareketTipi === 'SATIS' ||
        hareket.hareketTipi === 'SAYIM_EKSIK' ||
        hareket.hareketTipi === 'IPTAL_CIKIS'
      ) {
        toplamStok -= hareket.miktar;
      }
    });

    // Raflardaki toplam stok
    const rafToplamStok = await this.prisma.productLocationStock.aggregate({
      where: { productId: putAwayDto.productId },
      _sum: { qtyOnHand: true },
    });

    const mevcutRafStok = rafToplamStok._sum.qtyOnHand || 0;
    const yerlestirilecekStok = mevcutRafStok + putAwayDto.qty;

    // Toplam stok kontrolü
    if (yerlestirilecekStok > toplamStok) {
      throw new BadRequestException(
        `Hata: Toplam stok (${toplamStok}) yetersiz! Raflarda ${mevcutRafStok} adet var, ${putAwayDto.qty} adet eklemek istiyorsunuz. Maksimum ${toplamStok - mevcutRafStok} adet ekleyebilirsiniz.`,
      );
    }

    // Hedef depo kontrolü
    const toWarehouse = await this.prisma.warehouse.findUnique({
      where: { id: putAwayDto.toWarehouseId },
    });

    if (!toWarehouse) {
      throw new NotFoundException('Hedef depo bulunamadı');
    }

    if (!toWarehouse.active) {
      throw new BadRequestException('Hedef depo aktif değil');
    }

    // Hedef raf kontrolü
    const toLocation = await this.prisma.location.findUnique({
      where: { id: putAwayDto.toLocationId },
    });

    if (!toLocation) {
      throw new NotFoundException('Hedef raf bulunamadı');
    }

    if (!toLocation.active) {
      throw new BadRequestException('Hedef raf aktif değil');
    }

    if (toLocation.warehouseId !== putAwayDto.toWarehouseId) {
      throw new BadRequestException('Hedef raf, hedef depoya ait değil');
    }

    // Transaction içinde işlem yap
    return this.prisma.$transaction(async (prisma) => {
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
          qty: putAwayDto.qty,
          moveType: StockMoveType.PUT_AWAY,
          refType: 'PutAway',
          note: putAwayDto.note,
          createdBy: userId,
        },
        include: {
          product: {
            select: {
              id: true,
              stokKodu: true,
              stokAdi: true,
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
          error: error.message || 'Bilinmeyen hata',
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
    const product = await this.prisma.stok.findUnique({
      where: { id: transferDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Kaynak depo kontrolü
    const fromWarehouse = await this.prisma.warehouse.findUnique({
      where: { id: transferDto.fromWarehouseId },
    });

    if (!fromWarehouse) {
      throw new NotFoundException('Kaynak depo bulunamadı');
    }

    if (!fromWarehouse.active) {
      throw new BadRequestException('Kaynak depo aktif değil');
    }

    // Kaynak raf kontrolü
    const fromLocation = await this.prisma.location.findUnique({
      where: { id: transferDto.fromLocationId },
    });

    if (!fromLocation) {
      throw new NotFoundException('Kaynak raf bulunamadı');
    }

    if (!fromLocation.active) {
      throw new BadRequestException('Kaynak raf aktif değil');
    }

    if (fromLocation.warehouseId !== transferDto.fromWarehouseId) {
      throw new BadRequestException('Kaynak raf, kaynak depoya ait değil');
    }

    // Hedef depo kontrolü
    const toWarehouse = await this.prisma.warehouse.findUnique({
      where: { id: transferDto.toWarehouseId },
    });

    if (!toWarehouse) {
      throw new NotFoundException('Hedef depo bulunamadı');
    }

    if (!toWarehouse.active) {
      throw new BadRequestException('Hedef depo aktif değil');
    }

    // Hedef raf kontrolü
    const toLocation = await this.prisma.location.findUnique({
      where: { id: transferDto.toLocationId },
    });

    if (!toLocation) {
      throw new NotFoundException('Hedef raf bulunamadı');
    }

    if (!toLocation.active) {
      throw new BadRequestException('Hedef raf aktif değil');
    }

    if (toLocation.warehouseId !== transferDto.toWarehouseId) {
      throw new BadRequestException('Hedef raf, hedef depoya ait değil');
    }

    // Kaynak = Hedef kontrolü
    if (
      transferDto.fromWarehouseId === transferDto.toWarehouseId &&
      transferDto.fromLocationId === transferDto.toLocationId
    ) {
      throw new BadRequestException('Kaynak ve hedef raf aynı olamaz');
    }

    // Transaction içinde işlem yap
    return this.prisma.$transaction(async (prisma) => {
      // Kaynak rafta yeterli stok var mı kontrol et
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
        throw new BadRequestException('Kaynak rafta yeterli stok yok');
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
          qty: transferDto.qty,
          moveType: StockMoveType.TRANSFER,
          refType: 'Transfer',
          note: transferDto.note,
          createdBy: userId,
        },
        include: {
          product: {
            select: {
              id: true,
              stokKodu: true,
              stokAdi: true,
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

    return this.prisma.stockMove.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            stokKodu: true,
            stokAdi: true,
            marka: true,
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
    const stockMove = await this.prisma.stockMove.findUnique({
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
      throw new NotFoundException('Stok hareketi bulunamadı');
    }

    return stockMove;
  }
}
