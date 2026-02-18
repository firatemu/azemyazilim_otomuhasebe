import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { CreateInvoiceFromOrderDto } from './dto/create-invoice-from-order.dto';
import { CreateOrderFromRemainingDto } from './dto/create-order-from-remaining.dto';
import { PurchaseOrderFilterDto } from './dto/purchase-order-filter.dto';
import {
  OrderStatus,
  OrderItemStatus,
  FaturaTipi,
  FaturaDurum,
  Prisma,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) { }

  /**
   * Sipariş numarası oluştur (PO-{YEAR}-{INCREMENT})
   */
  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PO-${year}-`;

    const lastOrder = await this.prisma.purchaseOrder.findFirst({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
    });

    let increment = 1;
    if (lastOrder) {
      const lastNumber = lastOrder.orderNumber.split('-')[2];
      increment = parseInt(lastNumber) + 1;
    }

    const paddedIncrement = increment.toString().padStart(5, '0');
    return `${prefix}${paddedIncrement}`;
  }

  /**
   * Sipariş durumunu otomatik güncelle
   */
  private async updateOrderStatus(
    orderId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const prisma = tx || this.prisma;

    const order = await prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    const allCompleted = order.items.every(
      (item) => item.status === OrderItemStatus.COMPLETED,
    );
    const allPending = order.items.every(
      (item) => item.status === OrderItemStatus.PENDING,
    );
    const hasPartial = order.items.some(
      (item) => item.status === OrderItemStatus.PARTIAL,
    );

    let newStatus: OrderStatus;
    if (allCompleted) {
      newStatus = OrderStatus.COMPLETED;
    } else if (hasPartial || (!allPending && !allCompleted)) {
      newStatus = OrderStatus.PARTIAL;
    } else {
      newStatus = OrderStatus.PENDING;
    }

    if (order.status !== newStatus) {
      await prisma.purchaseOrder.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    }
  }

  /**
   * Item durumunu güncelle
   */
  private async updateItemStatus(
    itemId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const prisma = tx || this.prisma;

    const item = await prisma.purchaseOrderItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return;
    }

    const remaining = item.orderedQuantity - item.receivedQuantity;

    let newStatus: OrderItemStatus;
    if (remaining === 0) {
      newStatus = OrderItemStatus.COMPLETED;
    } else if (item.receivedQuantity > 0) {
      newStatus = OrderItemStatus.PARTIAL;
    } else {
      newStatus = OrderItemStatus.PENDING;
    }

    if (item.status !== newStatus) {
      await prisma.purchaseOrderItem.update({
        where: { id: itemId },
        data: { status: newStatus },
      });
    }
  }

  /**
   * Sipariş oluştur
   */
  async create(dto: CreatePurchaseOrderDto, userId?: string) {
    // Tedarikçi kontrolü
    const supplier = await this.prisma.cari.findUnique({
      where: { id: dto.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Tedarikçi bulunamadı');
    }

    // Ürün kontrolü
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.stok.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Bazı ürünler bulunamadı');
    }

    // Toplam tutar hesaplama
    let totalAmount = new Decimal(0);
    const items = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const unitPrice = new Decimal(item.unitPrice);
      const quantity = new Decimal(item.orderedQuantity);
      const itemTotal = unitPrice.mul(quantity);
      totalAmount = totalAmount.add(itemTotal);

      return {
        productId: item.productId,
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: 0,
        unitPrice: unitPrice,
        status: OrderItemStatus.PENDING,
      };
    });

    const orderNumber = await this.generateOrderNumber();

    return await this.prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId: dto.supplierId,
        orderDate: new Date(),
        expectedDeliveryDate: dto.expectedDeliveryDate
          ? new Date(dto.expectedDeliveryDate)
          : null,
        status: OrderStatus.PENDING,
        totalAmount,
        notes: dto.notes,
        items: {
          create: items,
        },
      },
      include: {
        supplier: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Sipariş listesi
   */
  async findAll(page = 1, limit = 50, filters?: PurchaseOrderFilterDto) {
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseOrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.supplierId) {
      where.supplierId = filters.supplierId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.orderDate = {};
      if (filters.startDate) {
        where.orderDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.orderDate.lte = new Date(filters.endDate);
      }
    }

    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        {
          supplier: {
            unvan: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
          supplier: {
            cariKodu: { contains: filters.search, mode: 'insensitive' },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplier: {
            select: {
              id: true,
              cariKodu: true,
              unvan: true,
            },
          },
          items: {
            select: {
              id: true,
              orderedQuantity: true,
              receivedQuantity: true,
              status: true,
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Sipariş detay
   */
  async findOne(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
        invoices: {
          select: {
            id: true,
            faturaNo: true,
            tarih: true,
            genelToplam: true,
            durum: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    return order;
  }

  /**
   * Sipariş güncelle
   */
  async update(id: string, dto: UpdatePurchaseOrderDto, userId?: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Tamamlanmış veya iptal edilmiş siparişler düzenlenemez',
      );
    }

    // Güncelleme işlemleri burada yapılacak
    // Şimdilik sadece status güncellemesi
    const updateData: Prisma.PurchaseOrderUpdateInput = {};

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.expectedDeliveryDate) {
      updateData.expectedDeliveryDate = new Date(dto.expectedDeliveryDate);
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    return await this.prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Sipariş sil
   */
  async remove(id: string, userId?: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        invoices: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    if (order.invoices) {
      throw new BadRequestException(
        'Bu siparişe ait faturalar bulunduğu için silinemez',
      );
    }

    await this.prisma.purchaseOrder.delete({
      where: { id },
    });

    return { message: 'Sipariş başarıyla silindi' };
  }

  /**
   * Kalan miktarları getir
   */
  async getRemainingItems(orderId: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    const remainingItems = order.items
      .filter((item) => item.orderedQuantity > item.receivedQuantity)
      .map((item) => ({
        purchaseOrderItemId: item.id,
        productId: item.productId,
        product: item.product,
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: item.receivedQuantity,
        remainingQuantity: item.orderedQuantity - item.receivedQuantity,
        unitPrice: item.unitPrice,
        status: item.status,
      }));

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: remainingItems,
    };
  }

  /**
   * Siparişten fatura oluştur
   */
  async createInvoiceFromOrder(
    orderId: string,
    dto: CreateInvoiceFromOrderDto,
    userId?: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id: orderId },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Sipariş bulunamadı');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(
          'İptal edilmiş siparişten fatura oluşturulamaz',
        );
      }

      // Fatura kalemlerini oluştur
      const faturaKalemleri: Array<{
        stokId: string;
        miktar: number;
        birimFiyat: Decimal;
        kdvOrani: number;
        kdvTutar: Decimal;
        tutar: Decimal;
        purchaseOrderItemId?: string;
      }> = [];
      let toplamTutar = new Decimal(0);
      let kdvTutar = new Decimal(0);

      for (const kalem of dto.kalemler) {
        const orderItem = order.items.find(
          (item) =>
            item.productId === kalem.productId &&
            (kalem.purchaseOrderItemId
              ? item.id === kalem.purchaseOrderItemId
              : true),
        );

        if (!orderItem) {
          throw new BadRequestException(
            `Ürün ${kalem.productId} siparişte bulunamadı`,
          );
        }

        const remaining =
          orderItem.orderedQuantity - orderItem.receivedQuantity;
        if (kalem.quantity > remaining) {
          throw new BadRequestException(
            `Ürün ${kalem.productId} için kalan miktar ${remaining}, talep edilen ${kalem.quantity}`,
          );
        }

        const birimFiyat = new Decimal(kalem.unitPrice);
        const miktar = new Decimal(kalem.quantity);
        const tutar = birimFiyat.mul(miktar);
        const kdv = tutar
          .mul(new Decimal(kalem.kdvOrani))
          .div(new Decimal(100));

        toplamTutar = toplamTutar.add(tutar);
        kdvTutar = kdvTutar.add(kdv);

        faturaKalemleri.push({
          stokId: kalem.productId,
          miktar: kalem.quantity,
          birimFiyat: birimFiyat,
          kdvOrani: kalem.kdvOrani,
          kdvTutar: kdv,
          tutar: tutar,
          purchaseOrderItemId: orderItem.id,
        });

        // Sipariş item'ının receivedQuantity'sini güncelle
        const newReceivedQuantity = orderItem.receivedQuantity + kalem.quantity;
        await tx.purchaseOrderItem.update({
          where: { id: orderItem.id },
          data: { receivedQuantity: newReceivedQuantity },
        });

        // Item durumunu güncelle
        await this.updateItemStatus(orderItem.id, tx);
      }

      const iskonto = new Decimal(dto.iskonto || 0);
      const iskontoTutar = toplamTutar.mul(iskonto).div(new Decimal(100));
      const toplamTutarIskontoSonrasi = toplamTutar.sub(iskontoTutar);
      const genelToplam = toplamTutarIskontoSonrasi.add(kdvTutar);

      // Fatura oluştur
      const fatura = await tx.fatura.create({
        data: {
          faturaNo: dto.faturaNo,
          faturaTipi: FaturaTipi.ALIS,
          cariId: order.supplierId,
          tarih: dto.tarih ? new Date(dto.tarih) : new Date(),
          vade: dto.vade ? new Date(dto.vade) : null,
          iskonto: iskonto,
          toplamTutar: toplamTutarIskontoSonrasi,
          kdvTutar: kdvTutar,
          genelToplam: genelToplam,
          aciklama: dto.aciklama,
          durum: FaturaDurum.ACIK,
          odenecekTutar: genelToplam,
          odenenTutar: new Decimal(0),
          purchaseOrderId: order.id,
          createdBy: userId,
          kalemler: {
            create: faturaKalemleri,
          },
        },
        include: {
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Sipariş durumunu güncelle
      await this.updateOrderStatus(orderId, tx);

      return fatura;
    });
  }

  /**
   * Kalan miktarlardan yeni sipariş oluştur
   */
  async createOrderFromRemaining(
    dto: CreateOrderFromRemainingDto,
    userId?: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const originalOrder = await tx.purchaseOrder.findUnique({
        where: { id: dto.originalOrderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!originalOrder) {
        throw new NotFoundException('Orijinal sipariş bulunamadı');
      }

      // Yeni sipariş için item'ları hazırla
      let totalAmount = new Decimal(0);
      const items: Array<{
        productId: string;
        orderedQuantity: number;
        receivedQuantity: number;
        unitPrice: Decimal;
        status: OrderItemStatus;
      }> = [];

      for (const itemDto of dto.items) {
        const originalItem = originalOrder.items.find(
          (item) => item.id === itemDto.purchaseOrderItemId,
        );

        if (!originalItem) {
          throw new BadRequestException(
            `Sipariş kalemi ${itemDto.purchaseOrderItemId} bulunamadı`,
          );
        }

        const remaining =
          originalItem.orderedQuantity - originalItem.receivedQuantity;
        if (remaining <= 0) {
          throw new BadRequestException(
            `Ürün ${originalItem.productId} için kalan miktar yok`,
          );
        }

        const unitPrice = originalItem.unitPrice;
        const itemTotal = unitPrice.mul(new Decimal(remaining));
        totalAmount = totalAmount.add(itemTotal);

        items.push({
          productId: originalItem.productId,
          orderedQuantity: remaining,
          receivedQuantity: 0,
          unitPrice: unitPrice,
          status: OrderItemStatus.PENDING,
        });
      }

      const orderNumber = await this.generateOrderNumber();

      const newOrder = await tx.purchaseOrder.create({
        data: {
          orderNumber,
          supplierId: dto.supplierId,
          orderDate: new Date(),
          expectedDeliveryDate: dto.expectedDeliveryDate
            ? new Date(dto.expectedDeliveryDate)
            : null,
          status: OrderStatus.PENDING,
          totalAmount,
          items: {
            create: items,
          },
        },
        include: {
          supplier: {
            select: {
              id: true,
              cariKodu: true,
              unvan: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  stokKodu: true,
                  stokAdi: true,
                },
              },
            },
          },
        },
      });

      return newOrder;
    });
  }

  /**
   * Siparişe ait faturalar
   */
  async getOrderInvoices(orderId: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    const invoices = await this.prisma.fatura.findMany({
      where: {
        purchaseOrderId: orderId,
      },
      include: {
        kalemler: {
          include: {
            stok: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
              },
            },
          },
        },
      },
      orderBy: {
        tarih: 'desc',
      },
    });

    return invoices;
  }
}
