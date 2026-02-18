import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { CodeTemplateService } from '../code-template/code-template.service';

@Injectable()
export class WarehouseService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
  ) { }

  async findAll(active?: boolean) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: any = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };
    if (active !== undefined) where.active = active;

    return this.prisma.warehouse.findMany({
      where,
      include: {
        _count: {
          select: {
            locations: true,
            stockMoves: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        locations: {
          where: { active: true },
          orderBy: { code: 'asc' },
        },
        _count: {
          select: {
            locations: true,
            productLocationStocks: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    return warehouse;
  }

  async findByCode(code: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        code,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        locations: {
          where: { active: true },
          orderBy: { code: 'asc' },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    return warehouse;
  }

  async create(createDto: CreateWarehouseDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({ allowNull: true });

    let code = createDto.code;
    if (!code || code.trim() === '') {
      try {
        code = await this.codeTemplateService.getNextCode('WAREHOUSE');
      } catch (error) {
        throw new BadRequestException(
          'Otomatik kod oluşturulamadı. Lütfen manuel kod girin veya "Numara Şablonları" ayarlarını kontrol edin.',
        );
      }
    }

    const existing = await this.prisma.warehouse.findFirst({
      where: {
        code,
        ...(tenantId != null ? { tenantId } : { tenantId: null }),
      },
    });
    if (existing) {
      throw new BadRequestException('Bu depo kodu zaten kullanılıyor');
    }

    const created = await this.prisma.warehouse.create({
      data: {
        code,
        ...(tenantId != null && { tenantId }),
        name: createDto.name,
        active: createDto.active ?? true,
        isDefault: createDto.isDefault ?? false,
        address: createDto.address,
        phone: createDto.phone,
        manager: createDto.manager,
      },
    });

    if (createDto.isDefault) {
      await this.setOtherWarehousesNotDefault(created.id, tenantId ?? undefined);
    }

    return created;
  }

  private async setOtherWarehousesNotDefault(currentId: string, tenantId?: string) {
    await this.prisma.warehouse.updateMany({
      where: {
        id: { not: currentId },
        ...buildTenantWhereClause(tenantId),
      },
      data: { isDefault: false },
    });
  }

  async update(id: string, updateDto: UpdateWarehouseDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id,
        ...(tenantId != null ? { tenantId } : { tenantId: null }),
      },
    });
    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    if (updateDto.code && updateDto.code !== warehouse.code) {
      const existing = await this.prisma.warehouse.findFirst({
        where: {
          code: updateDto.code,
          ...(tenantId != null ? { tenantId } : { tenantId: null }),
        },
      });
      if (existing) {
        throw new BadRequestException('Bu depo kodu zaten kullanılıyor');
      }
    }

    const updated = await this.prisma.warehouse.update({
      where: { id },
      data: updateDto,
    });

    if (updateDto.isDefault) {
      await this.setOtherWarehousesNotDefault(id, tenantId ?? undefined);
    }

    return updated;
  }

  async remove(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id,
        ...(tenantId != null ? { tenantId } : { tenantId: null }),
      },
      include: {
        _count: {
          select: {
            locations: true,
            productLocationStocks: true,
            stockMoves: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    if (warehouse._count.locations > 0) {
      throw new BadRequestException(
        'Bu depoda raflar bulunuyor. Önce rafları silin.',
      );
    }

    if (warehouse._count.productLocationStocks > 0) {
      throw new BadRequestException(
        'Bu depoda stok kayıtları bulunuyor. Önce stok kayıtlarını temizleyin.',
      );
    }

    return this.prisma.warehouse.delete({
      where: { id },
    });
  }

  async getStockReport(warehouseId: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    const stocks = await this.prisma.productLocationStock.findMany({
      where: {
        warehouseId,
        warehouse: {
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      },
      include: {
        product: true,
        location: true,
      },
    });

    const productGroups = stocks.reduce((acc, current) => {
      const productId = current.productId;
      if (!acc[productId]) {
        acc[productId] = {
          id: productId,
          stokKodu: current.product.stokKodu,
          stokAdi: current.product.stokAdi,
          birim: current.product.birim,
          qtyOnHand: 0,
          qtyReserved: 0,
          qtyAvailable: 0,
          locations: [],
        };
      }

      acc[productId].qtyOnHand += current.qtyOnHand;
      acc[productId].qtyAvailable = acc[productId].qtyOnHand - acc[productId].qtyReserved;
      acc[productId].locations.push({
        locationCode: current.location.code,
        locationName: current.location.name,
        quantity: current.qtyOnHand,
      });

      return acc;
    }, {} as Record<string, any>);

    return Object.values(productGroups);
  }

  async getOrCreateDefaultLocation(warehouseId: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    // Verify warehouse exists and belongs to tenant
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    // Generate clean code using warehouse code
    // Fallback to ID if code is missing (should not happen due to schema)
    const warehouseCode = warehouse.code || 'MAIN';
    const locCode = `GENEL-${warehouseCode}`;
    const locName = `Genel Depo Alanı (${warehouse.name})`;

    // Look for existing default location with NEW format
    let defaultLocation = await this.prisma.location.findFirst({
      where: {
        warehouseId,
        code: locCode,
      },
    });

    // Option: Check for OLD format if new one doesn't exist?
    // If we want to migrate, we could rename here.
    // For now, we prefer creating the NEW clean one for new assignments.
    // If we want to reuse the OLD one if it exists, uncomment below:
    /*
    if (!defaultLocation) {
       defaultLocation = await this.prisma.location.findFirst({
         where: { warehouseId, code: `DEF-${warehouseId}` }
       });
    }
    */

    // Create if doesn't exist
    if (!defaultLocation) {
      defaultLocation = await this.prisma.location.create({
        data: {
          warehouseId,
          code: locCode,
          barcode: locCode,
          name: locName,
          layer: 1,
          corridor: 'A',
          side: 1,
          section: 1,
          level: 1,
          active: true,
        },
      });
    }

    return defaultLocation;
  }

  async getProductStockHistory(productId: string, date: Date) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    // 1. Get all active warehouses for this tenant
    const warehouses = await this.prisma.warehouse.findMany({
      where: {
        active: true,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      select: { id: true, name: true, code: true },
    });

    const warehouseTotals: Record<string, { id: string; name: string; code: string; quantity: number }> = {};
    warehouses.forEach(w => {
      warehouseTotals[w.id] = {
        id: w.id,
        name: w.name,
        code: w.code,
        quantity: 0,
      };
    });

    // 2. Get current stock levels per warehouse for this product
    const currentStocks = await this.prisma.productLocationStock.findMany({
      where: {
        productId,
        warehouseId: { in: warehouses.map(w => w.id) },
      },
    });

    currentStocks.forEach(stock => {
      if (warehouseTotals[stock.warehouseId]) {
        warehouseTotals[stock.warehouseId].quantity += stock.qtyOnHand;
      }
    });

    // 3. Normalize target date to END OF DAY (23:59:59.999)
    // This ensures we show the stock AFTER all moves of that day
    const targetDateEnd = new Date(date);
    targetDateEnd.setHours(23, 59, 59, 999);

    // 4. Fetch all StockMove records for this product created AFTER the target date
    const movesAfterDate = await this.prisma.stockMove.findMany({
      where: {
        productId,
        createdAt: {
          gt: targetDateEnd,
        },
      },
    });

    // 5. Backtrack: Adjust current quantities based on moves that happened AFTER the date
    for (const move of movesAfterDate) {
      if (move.fromWarehouseId && warehouseTotals[move.fromWarehouseId]) {
        warehouseTotals[move.fromWarehouseId].quantity += move.qty;
      }

      const isOutgoingOnly = ['SALE', 'PICKING', 'DAMAGE'].includes(move.moveType);

      if (move.toWarehouseId && warehouseTotals[move.toWarehouseId] && !isOutgoingOnly) {
        warehouseTotals[move.toWarehouseId].quantity -= move.qty;
      }
    }

    return Object.values(warehouseTotals);
  }

  async getUniversalStockReport(date: Date) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    // 1. Get all active warehouses
    const warehouses = await this.prisma.warehouse.findMany({
      where: {
        active: true,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      select: { id: true, name: true, code: true },
    });

    // 2. Get all products that have or had stock movements/records
    // To keep it performant, we only get products that have ProductLocationStock records
    const currentStocks = await this.prisma.productLocationStock.findMany({
      where: {
        warehouse: {
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      },
      include: {
        product: {
          select: { id: true, stokKodu: true, stokAdi: true, birim: true },
        },
      },
    });

    // 3. Normalize data into a matrix: Product ID -> { productInfo, warehouseQuantities: { warehouseId: qty } }
    const productMatrix: Record<string, any> = {};

    currentStocks.forEach((stock) => {
      const pId = stock.productId;
      if (!productMatrix[pId]) {
        productMatrix[pId] = {
          productId: pId,
          stokKodu: stock.product.stokKodu,
          stokAdi: stock.product.stokAdi,
          birim: stock.product.birim,
          warehouseStocks: {},
          total: 0,
        };
        // Initialize all warehouses with 0
        warehouses.forEach((w) => {
          productMatrix[pId].warehouseStocks[w.id] = 0;
        });
      }
      productMatrix[pId].warehouseStocks[stock.warehouseId] += stock.qtyOnHand;
      productMatrix[pId].total += stock.qtyOnHand;
    });

    // 4. Backtrack if date is in the past
    const targetDateEnd = new Date(date);
    targetDateEnd.setHours(23, 59, 59, 999);

    const now = new Date();
    if (targetDateEnd < now) {
      const movesAfterDate = await this.prisma.stockMove.findMany({
        where: {
          createdAt: { gt: targetDateEnd },
          product: {
            ...buildTenantWhereClause(tenantId ?? undefined),
          },
        },
      });

      movesAfterDate.forEach((move) => {
        const pId = move.productId;
        // If product isn't in matrix yet but had moves, we might need to add it
        // However, usually any product with moves was in ProductLocationStock at some point.
        // For simplicity, we ensure the matrix entry exists
        if (!productMatrix[pId]) {
          // This is a rare case where current stock is 0 everywhere and was never initialized
          // We'd need product info here. For now, let's assume currentStocks covers active products.
          return;
        }

        // Undo move
        if (move.fromWarehouseId && productMatrix[pId].warehouseStocks[move.fromWarehouseId] !== undefined) {
          productMatrix[pId].warehouseStocks[move.fromWarehouseId] += move.qty;
          productMatrix[pId].total += move.qty;
        }

        const isOutgoingOnly = ['SALE', 'PICKING', 'DAMAGE'].includes(move.moveType);
        if (move.toWarehouseId && productMatrix[pId].warehouseStocks[move.toWarehouseId] !== undefined && !isOutgoingOnly) {
          productMatrix[pId].warehouseStocks[move.toWarehouseId] -= move.qty;
          productMatrix[pId].total -= move.qty;
        }
      });
    }

    return {
      warehouses,
      report: Object.values(productMatrix),
    };
  }

  async getWarehouseStock(warehouseId: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    const stocks = await this.prisma.productLocationStock.groupBy({
      by: ['productId'],
      where: { warehouseId },
      _sum: { qtyOnHand: true },
    });

    const productsWithStock = await Promise.all(
      stocks.map(async (stock) => {
        const product = await this.prisma.stok.findUnique({
          where: { id: stock.productId },
          select: {
            id: true,
            stokKodu: true,
            stokAdi: true,
            birim: true,
          },
        });
        return {
          ...product,
          qtyOnHand: stock._sum.qtyOnHand || 0,
        };
      }),
    );

    return productsWithStock;
  }

  async getDefaultWarehouse() {
    const tenantId = await this.tenantResolver.resolveForQuery();
    return this.prisma.warehouse.findFirst({
      where: {
        ...buildTenantWhereClause(tenantId ?? undefined),
        active: true,
        isDefault: true,
      },
    });
  }
}
