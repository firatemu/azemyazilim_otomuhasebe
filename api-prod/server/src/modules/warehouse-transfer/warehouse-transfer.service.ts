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
  ) {}

  async findAll(durum?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const where: any = {
      ...buildTenantWhereClause(tenantId ?? undefined),
      deletedAt: null,
    };
    if (durum) where.durum = durum;

    return this.prisma.warehouseTransfer.findMany({
      where,
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        kalemler: {
          include: {
            stok: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
                birim: true,
              },
            },
          },
        },
        hazirlayanUser: {
          select: { id: true, fullName: true },
        },
        onaylayanUser: {
          select: { id: true, fullName: true },
        },
        teslimAlanUser: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const transfer = await this.prisma.warehouseTransfer.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
        deletedAt: null,
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        kalemler: {
          include: {
            stok: true,
            fromLocation: true,
            toLocation: true,
          },
        },
        hazirlayanUser: {
          select: { id: true, fullName: true, email: true },
        },
        onaylayanUser: {
          select: { id: true, fullName: true, email: true },
        },
        teslimAlanUser: {
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
      throw new NotFoundException('Transfer fişi bulunamadı');
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
      const count = await this.prisma.warehouseTransfer.count({
        where: buildTenantWhereClause(tenantId ?? undefined),
      });
      transferNo = `TRF-${String(count + 1).padStart(6, '0')}`;
    }

    // Kaynak ambarda yeterli stok var mı kontrol et
    for (const kalem of createDto.kalemler) {
      const stock = await this.checkStock(
        createDto.fromWarehouseId,
        kalem.stokId,
      );
      if (stock < kalem.miktar) {
        const product = await this.prisma.stok.findUnique({
          where: { id: kalem.stokId },
          select: { stokKodu: true, stokAdi: true },
        });
        throw new BadRequestException(
          `${product?.stokKodu} - ${product?.stokAdi} için kaynak ambarda yeterli stok yok. Mevcut: ${stock}, İstenen: ${kalem.miktar}`,
        );
      }
    }

    // Transfer fişi oluştur
    const transfer = await this.prisma.warehouseTransfer.create({
      data: {
        transferNo,
        ...(tenantId && { tenantId }),
        tarih: new Date(createDto.tarih),
        fromWarehouseId: createDto.fromWarehouseId,
        toWarehouseId: createDto.toWarehouseId,
        durum: 'HAZIRLANIYOR',
        driverName: createDto.driverName,
        vehiclePlate: createDto.vehiclePlate,
        aciklama: createDto.aciklama,
        createdBy: createDto.userId,
        hazirlayanUserId: createDto.userId,
        kalemler: {
          create: createDto.kalemler.map((kalem) => ({
            stokId: kalem.stokId,
            miktar: kalem.miktar,
            fromLocationId: kalem.fromLocationId,
            toLocationId: kalem.toLocationId,
          })),
        },
      },
      include: {
        kalemler: { include: { stok: true } },
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
    const transfer = await this.prisma.warehouseTransfer.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
        deletedAt: null,
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer fişi bulunamadı');
    }

    if (transfer.durum !== 'HAZIRLANIYOR') {
      throw new BadRequestException(
        'Sadece hazırlanıyor durumundaki fişler düzenlenebilir',
      );
    }

    const { userId, kalemler, ...dataToUpdate } = updateDto;
    return this.prisma.warehouseTransfer.update({
      where: { id },
      data: {
        ...dataToUpdate,
        updatedBy: userId,
      },
    });
  }

  async approve(id: string, userId: string) {
    const transfer = await this.prisma.warehouseTransfer.findUnique({
      where: { id },
      include: { kalemler: true },
    });

    if (!transfer) throw new NotFoundException('Transfer fişi bulunamadı');
    if (transfer.durum !== 'HAZIRLANIYOR') {
      throw new BadRequestException(
        'Sadece hazırlanıyor durumundaki fişler onaylanabilir',
      );
    }

    // Stok kontrolü tekrar yap
    for (const kalem of transfer.kalemler) {
      const stock = await this.checkStock(
        transfer.fromWarehouseId,
        kalem.stokId,
      );
      if (stock < kalem.miktar) {
        const product = await this.prisma.stok.findUnique({
          where: { id: kalem.stokId },
          select: { stokKodu: true, stokAdi: true },
        });
        throw new BadRequestException(
          `${product?.stokKodu} - ${product?.stokAdi} için kaynak ambarda yeterli stok yok. Mevcut: ${stock}, İstenen: ${kalem.miktar}`,
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
    for (const kalem of transfer.kalemler) {
      await this.prisma.stockMove.create({
        data: {
          productId: kalem.stokId,
          fromWarehouseId: transfer.fromWarehouseId,
          fromLocationId: kalem.fromLocationId || fromDefaultLocation.id,
          toWarehouseId: transfer.toWarehouseId,
          toLocationId: kalem.toLocationId || toDefaultLocation.id,
          qty: kalem.miktar,
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
        kalem.stokId,
        -kalem.miktar,
      );

      // ProductLocationStock güncelle - Hedef ambara ekle
      await this.updateProductLocationStock(
        transfer.toWarehouseId,
        kalem.toLocationId || kalem.fromLocationId,
        kalem.stokId,
        kalem.miktar,
      );
    }

    // Transfer durumunu güncelle
    const updated = await this.prisma.warehouseTransfer.update({
      where: { id },
      data: {
        durum: 'YOLDA',
        onaylayanUserId: userId,
        sevkTarihi: new Date(),
        updatedBy: userId,
      },
    });

    await this.createLog(id, userId, 'UPDATE', {
      action: 'Transfer fişi onaylandı ve stok hareketleri oluşturuldu',
    });

    return updated;
  }

  async complete(id: string, userId: string) {
    const transfer = await this.prisma.warehouseTransfer.findUnique({
      where: { id },
    });

    if (!transfer) throw new NotFoundException('Transfer fişi bulunamadı');
    if (transfer.durum !== 'YOLDA') {
      throw new BadRequestException(
        'Sadece yolda durumundaki fişler tamamlanabilir',
      );
    }

    const updated = await this.prisma.warehouseTransfer.update({
      where: { id },
      data: {
        durum: 'TAMAMLANDI',
        teslimAlanUserId: userId,
        teslimTarihi: new Date(),
        updatedBy: userId,
      },
    });

    await this.createLog(id, userId, 'UPDATE', {
      action: 'Transfer fişi tamamlandı',
    });

    return updated;
  }

  async cancel(id: string, userId: string, reason?: string) {
    const transfer = await this.prisma.warehouseTransfer.findUnique({
      where: { id },
      include: { kalemler: true },
    });

    if (!transfer) throw new NotFoundException('Transfer fişi bulunamadı');
    if (transfer.durum === 'TAMAMLANDI') {
      throw new BadRequestException('Tamamlanmış fişler iptal edilemez');
    }
    if (transfer.durum === 'IPTAL') {
      throw new BadRequestException('Fiş zaten iptal edilmiş');
    }

    // Eğer YOLDA durumundaysa stok hareketlerini geri al
    if (transfer.durum === 'YOLDA') {
      for (const kalem of transfer.kalemler) {
        // Kaynak ambara geri ekle
        await this.updateProductLocationStock(
          transfer.fromWarehouseId,
          kalem.fromLocationId,
          kalem.stokId,
          kalem.miktar,
        );

        // Hedef ambardan düş
        await this.updateProductLocationStock(
          transfer.toWarehouseId,
          kalem.toLocationId || kalem.fromLocationId,
          kalem.stokId,
          -kalem.miktar,
        );
      }
    }

    const updated = await this.prisma.warehouseTransfer.update({
      where: { id },
      data: {
        durum: 'IPTAL',
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
    const transfer = await this.prisma.warehouseTransfer.findUnique({
      where: { id },
    });

    if (!transfer) throw new NotFoundException('Transfer fişi bulunamadı');
    if (transfer.durum === 'YOLDA' || transfer.durum === 'TAMAMLANDI') {
      throw new BadRequestException(
        'Yolda veya tamamlanmış fişler silinemez. Önce iptal edin.',
      );
    }

    return this.prisma.warehouseTransfer.update({
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
    const result = await this.prisma.productLocationStock.aggregate({
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

    const existing = await this.prisma.productLocationStock.findUnique({
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
          'Stok miktarı negatif olamaz',
        );
      }
      await this.prisma.productLocationStock.update({
        where: { id: existing.id },
        data: { qtyOnHand: newQty },
      });
    } else if (qtyChange > 0) {
      await this.prisma.productLocationStock.create({
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
    const location = await this.prisma.location.findFirst({
      where: { warehouseId, active: true },
      orderBy: { code: 'asc' },
    });

    if (!location) {
      throw new BadRequestException(
        'Ambarda aktif lokasyon bulunamadı',
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
    await this.prisma.warehouseTransferLog.create({
      data: {
        transferId,
        userId,
        actionType: actionType as any,
        changes: JSON.stringify(changes),
      },
    });
  }
}
