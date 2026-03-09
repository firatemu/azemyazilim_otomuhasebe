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
import { CreateWarehouseTransferDto } from './dto/create-warehouse-transfer.dto';
import { UpdateWarehouseTransferDto } from './dto/update-warehouse-transfer.dto';
import { CodeTemplateService } from '../code-template/code-template.service';

@Injectable()
export class WarehouseTransferService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
  ) { }

  async findAll(status?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: any = {
      ...buildTenantWhereClause(tenantId ?? undefined),
      deletedAt: null,
    };
    if (status) where.status = status;

    return this.prisma.extended.warehouseTransfer.findMany({
      where,
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true,
                brand: true,
              },
            },
          },
        },
        preparedByUser: {
          select: { id: true, fullName: true },
        },
        approvedByUser: {
          select: { id: true, fullName: true },
        },
        receivedByUser: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const transfer = await this.prisma.extended.warehouseTransfer.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
        deletedAt: null,
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: {
            product: true,
            fromLocation: true,
            toLocation: true,
          },
        },
        preparedByUser: {
          select: { id: true, fullName: true, email: true },
        },
        approvedByUser: {
          select: { id: true, fullName: true, email: true },
        },
        receivedByUser: {
          select: { id: true, fullName: true, email: true },
        },
        logs: {
          include: {
            user: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer slip not found');
    }

    return transfer;
  }

  async create(createDto: CreateWarehouseTransferDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({
      allowNull: true,
    });

    // Aynı ambardan aynı ambara transfer kontrolü
    if (createDto.fromWarehouseId === createDto.toWarehouseId) {
      throw new BadRequestException(
        'Kaynak ve hedef ambar aynı olamaz',
      );
    }

    // Transfer numarası oluştur
    let transferNo: string;
    try {
      transferNo = await this.codeTemplateService.getNextCode(
        'WAREHOUSE_TRANSFER',
      );
    } catch (error) {
      // Fallback to manual numbering
      const count = await this.prisma.extended.warehouseTransfer.count({
        where: buildTenantWhereClause(tenantId ?? undefined),
      });
      transferNo = `TRF-${String(count + 1).padStart(6, '0')}`;
    }

    // Kaynak ambarda yeterli product var mı kontrol et
    for (const kalem of createDto.items) {
      const stock = await this.checkStock(
        createDto.fromWarehouseId,
        kalem.productId,
      );
      if (stock < kalem.quantity) {
        const product = await this.prisma.extended.product.findUnique({
          where: { id: kalem.productId },
          select: { code: true, name: true },
        });
        throw new BadRequestException(
          `${(product as any)?.code} - ${(product as any)?.name} için kaynak ambarda yeterli product yok. Mevcut: ${stock}, İstenen: ${kalem.quantity}`,
        );
      }
    }

    // Transfer fişi oluştur
    const transfer = await this.prisma.extended.warehouseTransfer.create({
      data: {
        transferNo,
        ...(tenantId && { tenantId }),
        date: new Date(createDto.date),
        fromWarehouseId: createDto.fromWarehouseId,
        toWarehouseId: createDto.toWarehouseId,
        status: 'PREPARING',
        driverName: createDto.driverName,
        vehiclePlate: createDto.vehiclePlate,
        notes: createDto.notes,
        createdBy: createDto.userId,
        preparedById: createDto.userId,
        items: {
          create: createDto.items.map((kalem) => ({
            productId: kalem.productId,
            quantity: kalem.quantity,
            fromLocationId: kalem.fromLocationId,
            toLocationId: kalem.toLocationId,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        fromWarehouse: true,
        toWarehouse: true,
      },
    });

    // Log kaydı oluştur
    await this.createLog(transfer.id, createDto.userId, 'CREATE', {
      action: 'Transfer fişi oluşturuldu',
    });

    return transfer;
  }

  async update(id: string, updateDto: UpdateWarehouseTransferDto) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const transfer = await this.prisma.extended.warehouseTransfer.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
        deletedAt: null,
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer slip not found');
    }

    if ((transfer as any).status !== 'PREPARING') {
      throw new BadRequestException(
        'Sadece hazırlanıyor statusundaki fişler düzenlenebilir',
      );
    }

    const { userId, items, ...dataToUpdate } = updateDto;
    return this.prisma.extended.warehouseTransfer.update({
      where: { id },
      data: {
        ...dataToUpdate,
        updatedBy: userId,
      },
    });
  }

  async approve(id: string, userId: string) {
    const transfer = await this.prisma.extended.warehouseTransfer.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!transfer) throw new NotFoundException('Transfer slip not found');
    if ((transfer as any).status !== 'PREPARING') {
      throw new BadRequestException(
        'Sadece hazırlanıyor statusundaki fişler onaylanabilir',
      );
    }

    // Stok kontrolü tekrar yap
    for (const kalem of (transfer as any).items) {
      const stock = await this.checkStock(
        transfer.fromWarehouseId,
        kalem.productId,
      );
      if (stock < kalem.quantity) {
        const product = await this.prisma.extended.product.findUnique({
          where: { id: kalem.productId },
          select: { code: true, name: true },
        });
        throw new BadRequestException(
          `${(product as any)?.code} - ${(product as any)?.name} için kaynak ambarda yeterli product yok. Mevcut: ${stock}, İstenen: ${kalem.quantity}`,
        );
      }
    }

    // Varsayılan lokasyonları al
    const fromDefaultLocation = await this.getDefaultLocation(
      transfer.fromWarehouseId,
    );
    const toDefaultLocation = await this.getDefaultLocation(
      transfer.toWarehouseId,
    );

    // Stok hareketlerini oluştur
    for (const kalem of (transfer as any).items) {
      await this.prisma.extended.stockMove.create({
        data: {
          productId: kalem.productId,
          fromWarehouseId: transfer.fromWarehouseId,
          fromLocationId: kalem.fromLocationId || fromDefaultLocation.id,
          toWarehouseId: transfer.toWarehouseId,
          toLocationId: kalem.toLocationId || toDefaultLocation.id,
          qty: kalem.quantity,
          moveType: 'TRANSFER',
          refType: 'WarehouseTransfer',
          refId: transfer.id,
          createdBy: userId,
        },
      });

      // ProductLocationStock güncelle - Kaynak ambardan düş
      await this.updateProductLocationStock(
        transfer.fromWarehouseId,
        kalem.fromLocationId,
        kalem.productId,
        -kalem.quantity,
      );

      // ProductLocationStock güncelle - Hedef ambara ekle
      await this.updateProductLocationStock(
        transfer.toWarehouseId,
        kalem.toLocationId || kalem.fromLocationId,
        kalem.productId,
        kalem.quantity,
      );
    }

    // Transfer statusunu güncelle
    const updated = await this.prisma.extended.warehouseTransfer.update({
      where: { id },
      data: {
        status: 'IN_TRANSIT',
        approvedById: userId,
        shippingDate: new Date(),
        updatedBy: userId,
      },
    });

    await this.createLog(id, userId, 'UPDATE', {
      action: 'Transfer fişi onaylandı ve product hareketleri oluşturuldu',
    });

    return updated;
  }

  async complete(id: string, userId: string) {
    const transfer = await this.prisma.extended.warehouseTransfer.findUnique({
      where: { id },
    });

    if (!transfer) throw new NotFoundException('Transfer slip not found');
    if ((transfer as any).status !== 'IN_TRANSIT') {
      throw new BadRequestException(
        'Sadece yolda statusundaki fişler tamamlanabilir',
      );
    }

    const updated = await this.prisma.extended.warehouseTransfer.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        receivedById: userId,
        deliveryDate: new Date(),
        updatedBy: userId,
      },
    });

    await this.createLog(id, userId, 'UPDATE', {
      action: 'Transfer fişi tamamlandı',
    });

    return updated;
  }

  async cancel(id: string, userId: string, reason?: string) {
    const transfer = await this.prisma.extended.warehouseTransfer.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!transfer) throw new NotFoundException('Transfer slip not found');
    if ((transfer as any).status === 'COMPLETED') {
      throw new BadRequestException('Tamamlanmış fişler iptal edilemez');
    }
    if ((transfer as any).status === 'CANCELLED') {
      throw new BadRequestException('Fiş zaten iptal edilmiş');
    }

    // Eğer YOLDA statusundaysa product hareketlerini geri al
    if ((transfer as any).status === 'IN_TRANSIT') {
      for (const kalem of (transfer as any).items) {
        // Kaynak ambara geri ekle
        await this.updateProductLocationStock(
          transfer.fromWarehouseId,
          kalem.fromLocationId,
          kalem.productId,
          kalem.quantity,
        );

        // Hedef ambardan düş
        await this.updateProductLocationStock(
          transfer.toWarehouseId,
          kalem.toLocationId || kalem.fromLocationId,
          kalem.productId,
          -kalem.quantity,
        );
      }
    }

    const updated = await this.prisma.extended.warehouseTransfer.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedBy: userId,
      },
    });

    await this.createLog(id, userId, 'UPDATE', {
      action: 'Transfer fişi iptal edildi',
      reason,
    });

    return updated;
  }

  async remove(id: string) {
    const transfer = await this.prisma.extended.warehouseTransfer.findUnique({
      where: { id },
    });

    if (!transfer) throw new NotFoundException('Transfer slip not found');
    if ((transfer as any).status === 'IN_TRANSIT' || (transfer as any).status === 'COMPLETED') {
      throw new BadRequestException(
        'Yolda veya tamamlanmış fişler silinemez. Önce iptal edin.',
      );
    }

    return this.prisma.extended.warehouseTransfer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private async checkStock(
    warehouseId: string,
    productId: string,
  ): Promise<number> {
    const result = await this.prisma.extended.productLocationStock.aggregate({
      where: { warehouseId, productId },
      _sum: { qtyOnHand: true },
    });
    return result._sum.qtyOnHand || 0;
  }

  private async updateProductLocationStock(
    warehouseId: string,
    locationId: string | null,
    productId: string,
    qtyChange: number,
  ) {
    // Lokasyon belirtilmemişse varsayılan lokasyonu kullan
    let finalLocationId = locationId;
    if (!finalLocationId) {
      const defaultLocation = await this.getDefaultLocation(warehouseId);
      finalLocationId = defaultLocation.id;
    }

    const existing = await this.prisma.extended.productLocationStock.findUnique({
      where: {
        warehouseId_locationId_productId: {
          warehouseId,
          locationId: finalLocationId,
          productId,
        },
      },
    });

    if (existing) {
      const newQty = existing.qtyOnHand + qtyChange;
      if (newQty < 0) {
        throw new BadRequestException(
          'Stok quantityı negatif olamaz',
        );
      }
      await this.prisma.extended.productLocationStock.update({
        where: { id: existing.id },
        data: { qtyOnHand: newQty },
      });
    } else if (qtyChange > 0) {
      await this.prisma.extended.productLocationStock.create({
        data: {
          warehouseId,
          locationId: finalLocationId,
          productId,
          qtyOnHand: qtyChange,
        },
      });
    }
  }

  private async getDefaultLocation(warehouseId: string) {
    const location = await this.prisma.extended.location.findFirst({
      where: { warehouseId, active: true },
      orderBy: { code: 'asc' },
    });

    if (!location) {
      throw new BadRequestException(
        'Active location not found in warehouse',
      );
    }

    return location;
  }

  private async createLog(
    transferId: string,
    userId: string | undefined,
    actionType: string,
    changes: any,
  ) {
    await this.prisma.extended.warehouseTransferLog.create({
      data: {
        transferId,
        userId,
        actionType: actionType as any,
        changes: JSON.stringify(changes),
      },
    });
  }
}
