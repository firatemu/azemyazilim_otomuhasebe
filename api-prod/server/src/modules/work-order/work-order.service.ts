import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { isStagingEnvironment, buildTenantWhereClause } from '../../common/utils/staging.util';
import {
  WorkOrderStatus,
  WorkOrderLineType,
  PartSource,
  SupplyRequestStatus,
  FaturaTipi,
  FaturaDurum,
  StockMoveType,
  HareketTipi,
  Prisma,
} from '@prisma/client';
import {
  CreateWorkOrderDto,
  AssignTechnicianDto,
  UpdateStatusDto,
  AddLaborLineDto,
  AddPartLineDto,
  AddPartFromStockDto,
  RequestPartSupplyDto,
  ApproveSupplyRequestDto,
  RejectSupplyRequestDto,
  TogglePartUsedDto,
} from './dto';
import { Decimal } from '@prisma/client/runtime/library';

// İmmutable (read-only) durumlar
const IMMUTABLE_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.CLOSED,
  WorkOrderStatus.CANCELLED,
];

// Onay sonrası durumlar (parça/işçilik değişikliğinde WAITING_FOR_APPROVAL'a dönecek)
const POST_APPROVAL_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.APPROVED,
  WorkOrderStatus.PART_WAITING,
  WorkOrderStatus.IN_PROGRESS,
  WorkOrderStatus.QUALITY_CONTROL,
  WorkOrderStatus.READY_FOR_DELIVERY,
];

// Geçerli durum geçişleri
const VALID_STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.ACCEPTED]: [
    WorkOrderStatus.DIAGNOSIS,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.DIAGNOSIS]: [
    WorkOrderStatus.WAITING_FOR_APPROVAL,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.WAITING_FOR_APPROVAL]: [
    WorkOrderStatus.APPROVED,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.APPROVED]: [
    WorkOrderStatus.PART_WAITING,
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.WAITING_FOR_APPROVAL, // Değişiklik durumunda
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.PART_WAITING]: [
    WorkOrderStatus.IN_PROGRESS,
    WorkOrderStatus.WAITING_FOR_APPROVAL, // Değişiklik durumunda
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.IN_PROGRESS]: [
    WorkOrderStatus.QUALITY_CONTROL,
    WorkOrderStatus.PART_WAITING,
    WorkOrderStatus.WAITING_FOR_APPROVAL, // Değişiklik durumunda
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.QUALITY_CONTROL]: [
    WorkOrderStatus.READY_FOR_DELIVERY,
    WorkOrderStatus.IN_PROGRESS, // Kalite kontrolde sorun çıkarsa
    WorkOrderStatus.WAITING_FOR_APPROVAL, // Değişiklik durumunda
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.READY_FOR_DELIVERY]: [
    WorkOrderStatus.INVOICED,
    WorkOrderStatus.WAITING_FOR_APPROVAL, // Değişiklik durumunda
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.INVOICED]: [
    WorkOrderStatus.CLOSED,
    WorkOrderStatus.CANCELLED,
  ],
  [WorkOrderStatus.CLOSED]: [], // Değişiklik yapılamaz
  [WorkOrderStatus.CANCELLED]: [], // Değişiklik yapılamaz
};

@Injectable()
export class WorkOrderService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) { }

  private async findWorkOrderOrThrow(id: string, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;
    const tenantId = await this.tenantResolver.resolveForQuery();
    const workOrder = await prisma.workOrder.findFirst({
      where: {
        id,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        vehicle: true,
        customer: true,
        technician: true,
        lines: {
          include: {
            product: true,
          },
        },
        invoice: true,
      },
    });

    if (!workOrder) {
      throw new NotFoundException('İş emri bulunamadı');
    }

    return workOrder;
  }

  /**
   * İmmutable durum kontrolü
   */
  private assertMutable(status: WorkOrderStatus): void {
    if (IMMUTABLE_STATUSES.includes(status)) {
      throw new ForbiddenException(
        `Bu iş emri ${status === WorkOrderStatus.CLOSED ? 'kapatılmış' : 'iptal edilmiş'}. Değişiklik yapılamaz.`,
      );
    }
  }

  /**
   * Durum geçişi geçerlilik kontrolü
   */
  private assertValidTransition(
    currentStatus: WorkOrderStatus,
    newStatus: WorkOrderStatus,
  ): void {
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Geçersiz durum geçişi: ${currentStatus} -> ${newStatus}`,
      );
    }
  }

  /**
   * IN_PROGRESS için APPROVED kontrolü
   */
  private assertApprovedForInProgress(
    currentStatus: WorkOrderStatus,
    newStatus: WorkOrderStatus,
  ): void {
    if (newStatus === WorkOrderStatus.IN_PROGRESS) {
      // IN_PROGRESS'e geçiş sadece APPROVED, PART_WAITING veya QUALITY_CONTROL'dan olabilir
      const allowedForInProgress: WorkOrderStatus[] = [
        WorkOrderStatus.APPROVED,
        WorkOrderStatus.PART_WAITING,
        WorkOrderStatus.QUALITY_CONTROL,
      ];
      if (!allowedForInProgress.includes(currentStatus)) {
        throw new BadRequestException(
          'İşleme alınabilmesi için önce onaylanması gerekir (APPROVED durumu)',
        );
      }
    }
  }

  /**
   * Audit log oluştur
   */
  private async createAuditLog(
    data: {
      workOrderId: string;
      action: string;
      previousStatus?: WorkOrderStatus;
      newStatus?: WorkOrderStatus;
      technicianId?: string;
      details?: any;
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;

    await prisma.workOrderAuditLog.create({
      data: {
        workOrderId: data.workOrderId,
        action: data.action,
        previousStatus: data.previousStatus,
        newStatus: data.newStatus,
        technicianId: data.technicianId,
        details: data.details ? JSON.stringify(data.details) : null,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * İş emri numarası oluştur
   */
  private async generateWorkOrderNo(tx: Prisma.TransactionClient): Promise<string> {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const year = new Date().getFullYear();
    const prefix = `IE${year}`;

    const lastWorkOrder = await tx.workOrder.findFirst({
      where: {
        ...buildTenantWhereClause(tenantId ?? undefined),
        workOrderNo: { startsWith: prefix },
      },
      orderBy: { workOrderNo: 'desc' },
      select: { workOrderNo: true },
    });

    let nextNumber = 1;
    if (lastWorkOrder) {
      const lastNumberStr = lastWorkOrder.workOrderNo.replace(prefix, '');
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }

  /**
   * Satır toplamlarını hesapla
   */
  private calculateLineTotal(
    quantity: number,
    unitPrice: number,
    discountRate: number,
    taxRate: number,
  ): { discountAmount: number; taxAmount: number; lineTotal: number } {
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discountRate / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const lineTotal = afterDiscount + taxAmount;

    return {
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      lineTotal: Math.round(lineTotal * 100) / 100,
    };
  }

  /**
   * İş emri toplamlarını yeniden hesapla
   */
  private async recalculateTotals(
    workOrderId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const lines = await tx.workOrderLine.findMany({
      where: { workOrderId },
    });

    let laborTotal = 0;
    let partsTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    for (const line of lines) {
      const lineTotal = Number(line.lineTotal);
      const lineTax = Number(line.taxAmount);
      const lineDiscount = Number(line.discountAmount);

      if (line.lineType === WorkOrderLineType.LABOR) {
        laborTotal += lineTotal - lineTax;
      } else {
        partsTotal += lineTotal - lineTax;
      }
      totalDiscount += lineDiscount;
      totalTax += lineTax;
    }

    const grandTotal = laborTotal + partsTotal + totalTax;

    await tx.workOrder.update({
      where: { id: workOrderId },
      data: {
        laborTotal: new Decimal(laborTotal),
        partsTotal: new Decimal(partsTotal),
        discountAmount: new Decimal(totalDiscount),
        taxAmount: new Decimal(totalTax),
        grandTotal: new Decimal(grandTotal),
      },
    });
  }

  // ============= PUBLIC SERVICE METHODS =============

  /**
   * 1. createWorkOrder - Yeni iş emri oluştur
   */
  async createWorkOrder(
    dto: CreateWorkOrderDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      // Araç kontrolü - staging'de tenantId opsiyonel
      const vehicleWhere: any = { id: dto.vehicleId };
      if (tenantId) {
        vehicleWhere.tenantId = tenantId;
      }

      const vehicle = await tx.vehicle.findFirst({
        where: vehicleWhere,
      });
      if (!vehicle) {
        throw new NotFoundException('Araç bulunamadı');
      }

      // Müşteri kontrolü - staging'de tenantId opsiyonel
      const customerWhere: any = { id: dto.customerId };
      if (tenantId) {
        customerWhere.tenantId = tenantId;
      }

      const customer = await tx.cari.findFirst({
        where: customerWhere,
      });
      if (!customer) {
        throw new NotFoundException('Müşteri bulunamadı');
      }

      // Teknisyen kontrolü (opsiyonel) - staging'de tenantId opsiyonel
      if (dto.technicianId) {
        const technicianWhere: any = { id: dto.technicianId, isActive: true };
        if (tenantId) {
          technicianWhere.tenantId = tenantId;
        }

        const technician = await tx.technician.findFirst({
          where: technicianWhere,
        });
        if (!technician) {
          throw new NotFoundException('Teknisyen bulunamadı veya aktif değil');
        }
      }

      // İş emri numarası oluştur
      const workOrderNo = await this.generateWorkOrderNo(tx);

      // Kilometre güncellemesi
      if (dto.mileage && dto.mileage > (vehicle.mileage || 0)) {
        await tx.vehicle.update({
          where: { id: vehicle.id },
          data: { mileage: dto.mileage },
        });
      }

      // İş emri oluştur - staging'de tenantId opsiyonel
      const workOrderData: any = {
        workOrderNo,
        vehicleId: dto.vehicleId,
        customerId: dto.customerId,
        technicianId: dto.technicianId,
        status: WorkOrderStatus.ACCEPTED,
        complaint: dto.complaint,
        estimatedDelivery: dto.estimatedDelivery
          ? new Date(dto.estimatedDelivery)
          : null,
      };
      if (tenantId) {
        workOrderData.tenantId = tenantId;
      }

      const workOrder = await tx.workOrder.create({
        data: workOrderData,
        include: {
          vehicle: true,
          customer: true,
          technician: true,
        },
      });

      // Audit log
      await this.createAuditLog(
        {
          workOrderId: workOrder.id,
          action: 'WORK_ORDER_CREATED',
          newStatus: WorkOrderStatus.ACCEPTED,
          technicianId: dto.technicianId,
          details: { workOrderNo, vehicleId: dto.vehicleId },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return workOrder;
    });
  }

  /**
   * 2. assignTechnician - Teknisyen ata
   */
  async assignTechnician(
    workOrderId: string,
    dto: AssignTechnicianDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      const technician = await tx.technician.findFirst({
        where: {
          id: dto.technicianId,
          isActive: true,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (!technician) {
        throw new NotFoundException('Teknisyen bulunamadı veya aktif değil');
      }

      const previousTechnicianId = workOrder.technicianId;

      // Teknisyen ata
      const updatedWorkOrder = await tx.workOrder.update({
        where: { id: workOrderId },
        data: { technicianId: dto.technicianId },
        include: {
          vehicle: true,
          customer: true,
          technician: true,
        },
      });

      // Audit log
      await this.createAuditLog(
        {
          workOrderId,
          action: 'TECHNICIAN_ASSIGNED',
          technicianId: dto.technicianId,
          details: {
            previousTechnicianId,
            newTechnicianId: dto.technicianId,
            technicianName: `${technician.firstName} ${technician.lastName}`,
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return updatedWorkOrder;
    });
  }

  /**
   * 3. updateStatus - Durum güncelle
   */
  async updateStatus(
    workOrderId: string,
    dto: UpdateStatusDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);
      const previousStatus = workOrder.status;

      // İmmutable durum kontrolü
      this.assertMutable(previousStatus);

      // Geçerli geçiş kontrolü
      this.assertValidTransition(previousStatus, dto.status);

      // IN_PROGRESS için APPROVED kontrolü
      this.assertApprovedForInProgress(previousStatus, dto.status);

      // Tarih güncellemeleri
      const dateUpdates: Partial<{
        diagnosisAt: Date;
        approvedAt: Date;
        startedAt: Date;
        completedAt: Date;
        closedAt: Date;
      }> = {};

      switch (dto.status) {
        case WorkOrderStatus.DIAGNOSIS:
          dateUpdates.diagnosisAt = new Date();
          break;
        case WorkOrderStatus.APPROVED:
          dateUpdates.approvedAt = new Date();
          break;
        case WorkOrderStatus.IN_PROGRESS:
          if (!workOrder.startedAt) {
            dateUpdates.startedAt = new Date();
          }
          break;
        case WorkOrderStatus.READY_FOR_DELIVERY:
          dateUpdates.completedAt = new Date();
          break;
        case WorkOrderStatus.CLOSED:
          dateUpdates.closedAt = new Date();
          break;
      }

      // Durum güncelle
      const updatedWorkOrder = await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: dto.status,
          ...dateUpdates,
        },
        include: {
          vehicle: true,
          customer: true,
          technician: true,
          lines: true,
        },
      });

      // Audit log
      await this.createAuditLog(
        {
          workOrderId,
          action: 'STATUS_CHANGED',
          previousStatus,
          newStatus: dto.status,
          details: { reason: dto.reason },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return updatedWorkOrder;
    });
  }

  /**
   * 4. addLaborLine - İşçilik satırı ekle
   */
  async addLaborLine(
    workOrderId: string,
    dto: AddLaborLineDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      // Satır toplamlarını hesapla
      const quantity = 1; // İşçilik için miktar 1
      const unitPrice = dto.laborHours * dto.hourlyRate;
      const discountRate = dto.discountRate || 0;
      const taxRate = dto.taxRate ?? 20;

      const { discountAmount, taxAmount, lineTotal } = this.calculateLineTotal(
        quantity,
        unitPrice,
        discountRate,
        taxRate,
      );

      // İşçilik satırı ekle
      const line = await tx.workOrderLine.create({
        data: {
          workOrderId,
          lineType: WorkOrderLineType.LABOR,
          description: dto.description,
          laborHours: new Decimal(dto.laborHours),
          hourlyRate: new Decimal(dto.hourlyRate),
          quantity,
          unitPrice: new Decimal(unitPrice),
          discountRate: new Decimal(discountRate),
          discountAmount: new Decimal(discountAmount),
          taxRate,
          taxAmount: new Decimal(taxAmount),
          lineTotal: new Decimal(lineTotal),
        },
      });

      // Toplamları yeniden hesapla
      await this.recalculateTotals(workOrderId, tx);

      // Onay sonrası değişiklik kontrolü
      if (POST_APPROVAL_STATUSES.includes(workOrder.status)) {
        await tx.workOrder.update({
          where: { id: workOrderId },
          data: { status: WorkOrderStatus.WAITING_FOR_APPROVAL },
        });

        // Audit log - durum değişikliği
        await this.createAuditLog(
          {
            workOrderId,
            action: 'STATUS_CHANGED',
            previousStatus: workOrder.status,
            newStatus: WorkOrderStatus.WAITING_FOR_APPROVAL,
            details: { reason: 'İşçilik eklendi, yeniden onay gerekiyor' },
            userId,
            ipAddress,
            userAgent,
          },
          tx,
        );
      }

      // Audit log - işçilik eklendi
      await this.createAuditLog(
        {
          workOrderId,
          action: 'LABOR_LINE_ADDED',
          details: {
            lineId: line.id,
            description: dto.description,
            laborHours: dto.laborHours,
            hourlyRate: dto.hourlyRate,
            lineTotal,
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return this.findWorkOrderOrThrow(workOrderId, tx);
    });
  }

  /**
   * 5. addPartLine - Parça satırı ekle
   */
  async addPartLine(
    workOrderId: string,
    dto: AddPartLineDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      // Ürün kontrolü - staging'de tenantId opsiyonel
      const product = await tx.stok.findFirst({
        where: {
          id: dto.productId,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (!product) {
        throw new NotFoundException('Ürün bulunamadı');
      }

      // Satır toplamlarını hesapla
      const discountRate = dto.discountRate || 0;
      const taxRate = dto.taxRate ?? (Number(product.kdvOrani) || 20);

      const { discountAmount, taxAmount, lineTotal } = this.calculateLineTotal(
        dto.quantity,
        dto.unitPrice,
        discountRate,
        taxRate,
      );

      // Parça satırı ekle
      const line = await tx.workOrderLine.create({
        data: {
          workOrderId,
          lineType: WorkOrderLineType.PART,
          description: dto.description || product.stokAdi,
          productId: dto.productId,
          quantity: dto.quantity,
          unitPrice: new Decimal(dto.unitPrice),
          discountRate: new Decimal(discountRate),
          discountAmount: new Decimal(discountAmount),
          taxRate,
          taxAmount: new Decimal(taxAmount),
          lineTotal: new Decimal(lineTotal),
          isUsed: false,
        },
        include: {
          product: true,
        },
      });

      // Toplamları yeniden hesapla
      await this.recalculateTotals(workOrderId, tx);

      // Onay sonrası değişiklik kontrolü
      if (POST_APPROVAL_STATUSES.includes(workOrder.status)) {
        await tx.workOrder.update({
          where: { id: workOrderId },
          data: { status: WorkOrderStatus.WAITING_FOR_APPROVAL },
        });

        // Audit log - durum değişikliği
        await this.createAuditLog(
          {
            workOrderId,
            action: 'STATUS_CHANGED',
            previousStatus: workOrder.status,
            newStatus: WorkOrderStatus.WAITING_FOR_APPROVAL,
            details: { reason: 'Parça eklendi, yeniden onay gerekiyor' },
            userId,
            ipAddress,
            userAgent,
          },
          tx,
        );
      }

      // Audit log - parça eklendi
      await this.createAuditLog(
        {
          workOrderId,
          action: 'PART_LINE_ADDED',
          details: {
            lineId: line.id,
            productId: dto.productId,
            productName: product.stokAdi,
            quantity: dto.quantity,
            unitPrice: dto.unitPrice,
            lineTotal,
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return this.findWorkOrderOrThrow(workOrderId, tx);
    });
  }

  /**
   * 5a. addPartFromStock - Stoktan direkt parça ekle (fiyat yok)
   */
  async addPartFromStock(
    workOrderId: string,
    dto: AddPartFromStockDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      // Ürün kontrolü - staging'de tenantId opsiyonel
      const product = await tx.stok.findFirst({
        where: {
          id: dto.productId,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (!product) {
        throw new NotFoundException('Ürün bulunamadı');
      }

      // Stoktan karşılama için fiyat yok, toplam 0
      const lineTotal = 0;
      const discountAmount = 0;
      const taxAmount = 0;

      // Parça satırı ekle - STOCK_DIRECT
      const line = await tx.workOrderLine.create({
        data: {
          workOrderId,
          lineType: WorkOrderLineType.PART,
          description: dto.description || product.stokAdi,
          productId: dto.productId,
          quantity: dto.quantity,
          unitPrice: null, // Fiyat yok
          discountRate: new Decimal(0),
          discountAmount: new Decimal(0),
          taxRate: 0,
          taxAmount: new Decimal(0),
          lineTotal: new Decimal(0),
          isUsed: false,
          partSource: PartSource.STOCK_DIRECT,
        },
        include: {
          product: true,
        },
      });

      // Toplamları yeniden hesapla (fiyat olmadığı için değişmeyecek ama consistency için)
      await this.recalculateTotals(workOrderId, tx);

      // Onay sonrası değişiklik kontrolü
      if (POST_APPROVAL_STATUSES.includes(workOrder.status)) {
        await tx.workOrder.update({
          where: { id: workOrderId },
          data: { status: WorkOrderStatus.WAITING_FOR_APPROVAL },
        });

        // Audit log - durum değişikliği
        await this.createAuditLog(
          {
            workOrderId,
            action: 'STATUS_CHANGED',
            previousStatus: workOrder.status,
            newStatus: WorkOrderStatus.WAITING_FOR_APPROVAL,
            details: { reason: 'Parça eklendi (stoktan), yeniden onay gerekiyor' },
            userId,
            ipAddress,
            userAgent,
          },
          tx,
        );
      }

      // Audit log - parça eklendi
      await this.createAuditLog(
        {
          workOrderId,
          action: 'PART_LINE_ADDED',
          details: {
            lineId: line.id,
            productId: dto.productId,
            productName: product.stokAdi,
            quantity: dto.quantity,
            partSource: 'STOCK_DIRECT',
            note: 'Fiyat gösterilmiyor',
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return line;
    });
  }

  /**
   * 5b. requestPartSupply - Tedarik isteği oluştur
   */
  async requestPartSupply(
    workOrderId: string,
    dto: RequestPartSupplyDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      // Tedarik isteği oluştur - SUPPLY_REQUEST, PENDING
      const line = await tx.workOrderLine.create({
        data: {
          workOrderId,
          lineType: WorkOrderLineType.PART,
          description: dto.description,
          productId: null, // Henüz eşleştirilmedi
          quantity: dto.quantity,
          unitPrice: null, // Fiyat yok
          discountRate: new Decimal(0),
          discountAmount: new Decimal(0),
          taxRate: 0,
          taxAmount: new Decimal(0),
          lineTotal: new Decimal(0),
          isUsed: false,
          partSource: PartSource.SUPPLY_REQUEST,
          supplyRequestStatus: SupplyRequestStatus.PENDING,
          requestedAt: new Date(),
        },
      });

      // Toplamları yeniden hesapla
      await this.recalculateTotals(workOrderId, tx);

      // Audit log - tedarik isteği oluşturuldu
      await this.createAuditLog(
        {
          workOrderId,
          action: 'SUPPLY_REQUEST_CREATED',
          details: {
            lineId: line.id,
            description: dto.description,
            quantity: dto.quantity,
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return line;
    });
  }

  /**
   * 5c. getSupplyRequests - Bekleyen tedarik isteklerini listele (ADMIN)
   */
  async getSupplyRequests(workOrderId: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    const workOrder = await this.prisma.workOrder.findFirst({
      where: {
        id: workOrderId,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
    });

    if (!workOrder) {
      throw new NotFoundException('İş emri bulunamadı');
    }

    // Bekleyen tedarik isteklerini getir
    return this.prisma.workOrderLine.findMany({
      where: {
        workOrderId,
        lineType: WorkOrderLineType.PART,
        partSource: PartSource.SUPPLY_REQUEST,
        supplyRequestStatus: SupplyRequestStatus.PENDING,
      },
      orderBy: {
        requestedAt: 'asc',
      },
      include: {
        workOrder: {
          select: {
            id: true,
            workOrderNo: true,
            vehicle: {
              select: {
                plateNumber: true,
                brand: true,
                model: true,
              },
            },
            customer: {
              select: {
                unvan: true,
                isimSoyisim: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 5d. approveSupplyRequest - Tedarik isteğini onayla ve stokla eşleştir (ADMIN)
   */
  async approveSupplyRequest(
    workOrderId: string,
    lineId: string,
    dto: ApproveSupplyRequestDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      // WorkOrder kontrolü
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // Line kontrolü - PENDING olmalı
      const line = await tx.workOrderLine.findFirst({
        where: {
          id: lineId,
          workOrderId,
          lineType: WorkOrderLineType.PART,
          partSource: PartSource.SUPPLY_REQUEST,
          supplyRequestStatus: SupplyRequestStatus.PENDING,
        },
        include: {
          product: true,
        },
      });

      if (!line) {
        throw new NotFoundException('Tedarik isteği bulunamadı veya zaten işleme alınmış');
      }

      // Ürün kontrolü - staging'de tenantId opsiyonel
      const product = await tx.stok.findFirst({
        where: {
          id: dto.productId,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (!product) {
        throw new NotFoundException('Ürün bulunamadı');
      }

      // Basit işlem: productId'yi ata, description'ı koru
      // description = İstenen ürün (örneğin "Hava filtresi")
      // productId = Stoktan seçilen ürün (örneğin Azm-002)
      const updatedLine = await tx.workOrderLine.update({
        where: { id: lineId },
        data: {
          productId: dto.productId,
          description: line.description, // İstenen ürün bilgisi korunacak
          supplyRequestStatus: SupplyRequestStatus.APPROVED,
          approvedAt: new Date(),
          approvedBy: userId,
          unitPrice: null,
          lineTotal: new Decimal(0),
        },
        include: {
          product: true,
          approver: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      // Toplamları yeniden hesapla
      await this.recalculateTotals(workOrderId, tx);

      // Audit log
      await this.createAuditLog(
        {
          workOrderId,
          action: 'SUPPLY_REQUEST_APPROVED',
          details: {
            lineId: lineId,
            requestedDescription: line.description,
            productId: dto.productId,
            productName: product.stokAdi,
            productCode: product.stokKodu,
            quantity: line.quantity,
            note: dto.note,
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return updatedLine;
    });
  }

  /**
   * 5e. rejectSupplyRequest - Tedarik isteğini reddet (ADMIN)
   */
  async rejectSupplyRequest(
    workOrderId: string,
    lineId: string,
    dto: RejectSupplyRequestDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      // WorkOrder kontrolü
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // Line kontrolü - PENDING olmalı
      const line = await tx.workOrderLine.findFirst({
        where: {
          id: lineId,
          workOrderId,
          lineType: WorkOrderLineType.PART,
          partSource: PartSource.SUPPLY_REQUEST,
          supplyRequestStatus: SupplyRequestStatus.PENDING,
        },
      });

      if (!line) {
        throw new NotFoundException('Tedarik isteği bulunamadı veya zaten işleme alınmış');
      }

      // Line'ı güncelle - status REJECTED yap
      const updatedLine = await tx.workOrderLine.update({
        where: { id: lineId },
        data: {
          supplyRequestStatus: SupplyRequestStatus.REJECTED,
          approvedAt: new Date(),
          approvedBy: userId,
        },
        include: {
          approver: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      // Audit log - tedarik isteği reddedildi
      await this.createAuditLog(
        {
          workOrderId,
          action: 'SUPPLY_REQUEST_REJECTED',
          details: {
            lineId: lineId,
            description: line.description,
            quantity: line.quantity,
            reason: dto.reason,
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return updatedLine;
    });
  }

  /**
   * 6. requestApproval - Onay talep et
   */
  async requestApproval(
    workOrderId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      // Sadece DIAGNOSIS durumundan WAITING_FOR_APPROVAL'a geçilebilir
      if (workOrder.status !== WorkOrderStatus.DIAGNOSIS) {
        throw new BadRequestException(
          `Onay talebi sadece DIAGNOSIS durumundayken yapılabilir. Mevcut durum: ${workOrder.status}`,
        );
      }

      // En az bir satır olmalı
      if (workOrder.lines.length === 0) {
        throw new BadRequestException(
          'Onay talep etmek için en az bir işçilik veya parça satırı eklenmeli',
        );
      }

      // Durum güncelle
      const updatedWorkOrder = await tx.workOrder.update({
        where: { id: workOrderId },
        data: { status: WorkOrderStatus.WAITING_FOR_APPROVAL },
        include: {
          vehicle: true,
          customer: true,
          technician: true,
          lines: true,
        },
      });

      // Audit log
      await this.createAuditLog(
        {
          workOrderId,
          action: 'APPROVAL_REQUESTED',
          previousStatus: WorkOrderStatus.DIAGNOSIS,
          newStatus: WorkOrderStatus.WAITING_FOR_APPROVAL,
          details: {
            lineCount: workOrder.lines.length,
            grandTotal: Number(workOrder.grandTotal),
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return updatedWorkOrder;
    });
  }

  /**
   * 7. approveWork - İşi onayla
   */
  async approveWork(
    workOrderId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      // Sadece WAITING_FOR_APPROVAL durumundan onaylanabilir
      if (workOrder.status !== WorkOrderStatus.WAITING_FOR_APPROVAL) {
        throw new BadRequestException(
          `Onay sadece WAITING_FOR_APPROVAL durumundayken yapılabilir. Mevcut durum: ${workOrder.status}`,
        );
      }

      // Durum güncelle
      const updatedWorkOrder = await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: WorkOrderStatus.APPROVED,
          approvedAt: new Date(),
        },
        include: {
          vehicle: true,
          customer: true,
          technician: true,
          lines: true,
        },
      });

      // Audit log
      await this.createAuditLog(
        {
          workOrderId,
          action: 'WORK_APPROVED',
          previousStatus: WorkOrderStatus.WAITING_FOR_APPROVAL,
          newStatus: WorkOrderStatus.APPROVED,
          details: {
            approvedBy: userId,
            grandTotal: Number(workOrder.grandTotal),
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return updatedWorkOrder;
    });
  }

  /**
   * 8. closeWorkOrder - İş emrini kapat
   */
  async closeWorkOrder(
    workOrderId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      // Sadece INVOICED durumundan kapatılabilir
      if (workOrder.status !== WorkOrderStatus.INVOICED) {
        throw new BadRequestException(
          `Kapatma sadece INVOICED durumundayken yapılabilir. Mevcut durum: ${workOrder.status}`,
        );
      }

      const now = new Date();

      // Durum güncelle
      const updatedWorkOrder = await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: WorkOrderStatus.CLOSED,
          closedAt: now,
        },
        include: {
          vehicle: true,
          customer: true,
          technician: true,
          lines: true,
          invoice: true,
        },
      });

      // Audit log
      await this.createAuditLog(
        {
          workOrderId,
          action: 'WORK_ORDER_CLOSED',
          previousStatus: WorkOrderStatus.INVOICED,
          newStatus: WorkOrderStatus.CLOSED,
          details: {
            closedBy: userId,
            closedAt: now.toISOString(),
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      // PHASE 4: Bakım hatırlatmasını güncelle veya oluştur
      // KURAL: Her araç için sadece BİR aktif hatırlatma
      // nextReminderDate = closedAt + 1 yıl
      const nextReminderDate = new Date(now);
      nextReminderDate.setFullYear(nextReminderDate.getFullYear() + 1);

      const existingReminder = await tx.vehicleMaintenanceReminder.findUnique({
        where: { vehicleId: workOrder.vehicleId },
      });

      if (existingReminder) {
        // GÜNCELLE - Mevcut hatırlatmayı güncelle (ASLA yeni oluşturma)
        await tx.vehicleMaintenanceReminder.update({
          where: { vehicleId: workOrder.vehicleId },
          data: {
            lastServiceDate: now,
            lastWorkOrderId: workOrderId,
            lastMileage: workOrder.vehicle.mileage,
            nextReminderDate,
            reminderSent: false,
            reminderSentAt: null,
          },
        });
      } else {
        // OLUŞTUR - İlk kez hatırlatma oluştur - staging'de tenantId opsiyonel
        const reminderData: any = {
          vehicleId: workOrder.vehicleId,
          lastServiceDate: now,
          lastWorkOrderId: workOrderId,
          lastMileage: workOrder.vehicle.mileage,
          nextReminderDate,
          reminderSent: false,
        };
        if (tenantId) {
          reminderData.tenantId = tenantId;
        }

        await tx.vehicleMaintenanceReminder.create({
          data: reminderData,
        });
      }

      return updatedWorkOrder;
    });
  }

  // ============= QUERY METHODS (için PHASE 4'te kullanılacak) =============

  /**
   * İş emri detayını getir
   */
  async findOne(id: string) {
    return this.findWorkOrderOrThrow(id);
  }

  /**
   * İş emirlerini listele
   */
  async findAll(
    page = 1,
    limit = 50,
    status?: WorkOrderStatus,
    technicianId?: string,
    vehicleId?: string,
    customerId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;

    const where: Prisma.WorkOrderWhereInput = {
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (status) where.status = status;
    if (technicianId) where.technicianId = technicianId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (customerId) where.customerId = customerId;

    if (startDate || endDate) {
      where.acceptedAt = {};
      if (startDate) where.acceptedAt.gte = startDate;
      if (endDate) where.acceptedAt.lte = endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { acceptedAt: 'desc' },
        include: {
          vehicle: true,
          customer: {
            select: {
              id: true,
              cariKodu: true,
              unvan: true,
            },
          },
          technician: {
            select: {
              id: true,
              code: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============= PHASE 3: STOCK & INVOICE INTEGRATION =============

  /**
   * Parçayı kullanıldı olarak işaretle ve stok çıkışı yap
   * PHASE 3 - Stock Integration
   */
  async markPartAsUsed(
    workOrderId: string,
    lineId: string,
    warehouseId: string,
    locationId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      // İş emri kontrolü
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      // İptal edilen iş emirlerinde stok hareketi yapılamaz
      if (workOrder.status === WorkOrderStatus.CANCELLED) {
        throw new ForbiddenException(
          'İptal edilen iş emirlerinde stok hareketi yapılamaz',
        );
      }

      // Satır kontrolü
      const line = await tx.workOrderLine.findFirst({
        where: { id: lineId, workOrderId },
        include: { product: true },
      });

      if (!line) {
        throw new NotFoundException('İş emri satırı bulunamadı');
      }

      if (line.lineType !== WorkOrderLineType.PART) {
        throw new BadRequestException('Bu satır parça değil, işçilik satırı');
      }

      if (line.isUsed) {
        throw new BadRequestException('Bu parça zaten kullanıldı olarak işaretlenmiş');
      }

      if (!line.productId) {
        throw new BadRequestException('Parça satırında ürün bilgisi eksik');
      }

      const warehouse = await tx.warehouse.findFirst({
        where: {
          id: warehouseId,
          active: true,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      });
      if (!warehouse) {
        throw new NotFoundException('Depo bulunamadı veya aktif değil');
      }

      // Raf kontrolü
      const location = await tx.location.findFirst({
        where: { id: locationId, warehouseId, active: true },
      });
      if (!location) {
        throw new NotFoundException('Raf bulunamadı veya aktif değil');
      }

      // Stok kontrolü - Rafta yeterli stok var mı?
      const stockOnLocation = await tx.productLocationStock.findUnique({
        where: {
          warehouseId_locationId_productId: {
            warehouseId,
            locationId,
            productId: line.productId,
          },
        },
      });

      if (!stockOnLocation || stockOnLocation.qtyOnHand < line.quantity) {
        const available = stockOnLocation?.qtyOnHand || 0;
        throw new BadRequestException(
          `Yetersiz stok! Rafta ${available} adet var, ${line.quantity} adet gerekiyor.`,
        );
      }

      // Stok bakiyesini düşür
      await tx.productLocationStock.update({
        where: {
          warehouseId_locationId_productId: {
            warehouseId,
            locationId,
            productId: line.productId,
          },
        },
        data: {
          qtyOnHand: stockOnLocation.qtyOnHand - line.quantity,
        },
      });

      // Stok hareketi kaydı oluştur (StockMove tablosuna)
      await tx.stockMove.create({
        data: {
          productId: line.productId,
          fromWarehouseId: warehouseId,
          fromLocationId: locationId,
          toWarehouseId: warehouseId, // Servis için çıkış, aynı depoda
          toLocationId: locationId,
          qty: line.quantity,
          moveType: StockMoveType.SALE, // Servis satışı
          refType: 'WorkOrder',
          refId: workOrderId,
          note: `İş Emri: ${workOrder.workOrderNo} - Parça kullanıldı`,
          createdBy: userId,
        },
      });

      // Eski stok hareket tablosuna da kayıt (StokHareket - legacy)
      // Sadece unitPrice varsa kayıt yap (stoktan karşılama ve tedarik istekleri için fiyat yok)
      if (line.unitPrice !== null && line.unitPrice !== undefined) {
        await tx.stokHareket.create({
          data: {
            stokId: line.productId,
            hareketTipi: HareketTipi.SATIS,
            miktar: line.quantity,
            birimFiyat: line.unitPrice,
            aciklama: `İş Emri: ${workOrder.workOrderNo}`,
          },
        });
      }

      // Satırı kullanıldı olarak işaretle
      const updatedLine = await tx.workOrderLine.update({
        where: { id: lineId },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
        include: { product: true },
      });

      // Audit log
      await this.createAuditLog(
        {
          workOrderId,
          action: 'PART_MARKED_AS_USED',
          details: {
            lineId,
            productId: line.productId,
            productName: line.product?.stokAdi,
            quantity: line.quantity,
            warehouseId,
            locationId,
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return updatedLine;
    });
  }

  /**
   * Parça kullanım durumunu toggle et (basit işaretleme/iptal)
   * Stok hareketi yapmaz, sadece isUsed alanını günceller
   */
  async togglePartUsed(
    workOrderId: string,
    lineId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      // İş emri kontrolü
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      // Satır kontrolü
      const line = await tx.workOrderLine.findFirst({
        where: { id: lineId, workOrderId },
        include: { product: true },
      });

      if (!line) {
        throw new NotFoundException('İş emri satırı bulunamadı');
      }

      if (line.lineType !== WorkOrderLineType.PART) {
        throw new BadRequestException('Bu satır parça değil, işçilik satırı');
      }

      // Toggle işlemi
      const newIsUsed = !line.isUsed;

      const updatedLine = await tx.workOrderLine.update({
        where: { id: lineId },
        data: {
          isUsed: newIsUsed,
          usedAt: newIsUsed ? new Date() : null,
        },
        include: { product: true },
      });

      // Audit log
      await this.createAuditLog(
        {
          workOrderId,
          action: newIsUsed ? 'PART_MARKED_AS_USED' : 'PART_UNMARKED_AS_USED',
          details: {
            lineId,
            productId: line.productId,
            productName: line.product?.stokAdi || line.description,
            quantity: line.quantity,
            previousStatus: line.isUsed,
            newStatus: newIsUsed,
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return updatedLine;
    });
  }

  /**
   * İş emrinden satış faturası oluştur
   * PHASE 3 - Invoice Integration
   */
  async generateInvoice(
    workOrderId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findFirst({
        where: {
          id: workOrderId,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
        include: {
          vehicle: true,
          customer: true,
          lines: {
            include: { product: true },
          },
        },
      });

      if (!workOrder) {
        throw new NotFoundException('İş emri bulunamadı');
      }

      // İptal edilen iş emirlerinde fatura oluşturulamaz
      if (workOrder.status === WorkOrderStatus.CANCELLED) {
        throw new ForbiddenException(
          'İptal edilen iş emirlerinde fatura oluşturulamaz',
        );
      }

      // Sadece READY_FOR_DELIVERY durumunda fatura oluşturulabilir
      if (workOrder.status !== WorkOrderStatus.READY_FOR_DELIVERY) {
        throw new BadRequestException(
          `Fatura sadece READY_FOR_DELIVERY durumundayken oluşturulabilir. Mevcut durum: ${workOrder.status}`,
        );
      }

      // Zaten faturalandırılmış mı kontrolü
      if (workOrder.invoiceId) {
        throw new BadRequestException('Bu iş emri zaten faturalandırılmış');
      }

      // Fatura numarası oluştur
      const year = new Date().getFullYear();
      const lastFatura = await tx.fatura.findFirst({
        where: {
          ...buildTenantWhereClause(tenantId ?? undefined),
          faturaTipi: FaturaTipi.SATIS,
        },
        orderBy: { createdAt: 'desc' },
        select: { faturaNo: true },
      });

      let nextNumber = 1;
      if (lastFatura?.faturaNo) {
        const match = lastFatura.faturaNo.match(/(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      const faturaNo = `SF-${year}-${nextNumber.toString().padStart(6, '0')}`;

      // Fatura kalemlerini oluştur
      const kalemler: any[] = [];

      for (const line of workOrder.lines) {
        if (line.lineType === WorkOrderLineType.PART && line.productId) {
          // Parça kalemi - unitPrice null ise 0 kullan (stoktan karşılama ve tedarik istekleri için)
          const unitPrice = line.unitPrice !== null && line.unitPrice !== undefined ? Number(line.unitPrice) : 0;
          kalemler.push({
            stokId: line.productId,
            miktar: line.quantity,
            birimFiyat: unitPrice,
            kdvOrani: line.taxRate,
            kdvTutar: Number(line.taxAmount),
            tutar: Number(line.lineTotal) - Number(line.taxAmount),
          });
        } else if (line.lineType === WorkOrderLineType.LABOR) {
          // İşçilik için genel hizmet stoku kullan (varsa)
          // Not: İşçilik kalemleri için özel bir stok kaydı gerekebilir
          // Bu implementasyonda işçilik fatura açıklamasına ekleniyor
        }
      }

      // Toplam hesaplamaları
      const toplamTutar = Number(workOrder.laborTotal) + Number(workOrder.partsTotal);
      const kdvTutar = Number(workOrder.taxAmount);
      const genelToplam = Number(workOrder.grandTotal);

      const fatura = await tx.fatura.create({
        data: {
          ...(tenantId != null && { tenantId }),
          faturaNo,
          faturaTipi: FaturaTipi.SATIS,
          cariId: workOrder.customerId,
          tarih: new Date(),
          iskonto: Number(workOrder.discountAmount),
          toplamTutar: new Decimal(toplamTutar),
          kdvTutar: new Decimal(kdvTutar),
          genelToplam: new Decimal(genelToplam),
          odenecekTutar: new Decimal(genelToplam),
          durum: FaturaDurum.ACIK,
          aciklama: `İş Emri: ${workOrder.workOrderNo} - Araç: ${workOrder.vehicle.plateNumber}`,
          createdBy: userId,
          deliveryNoteId: undefined, // Work-order faturaları için şimdilik undefined (ileride otomatik irsaliye eklenecek)
          kalemler: {
            create: kalemler,
          },
        },
        include: {
          kalemler: {
            include: { stok: true },
          },
          cari: true,
        },
      });

      // Cari bakiye güncelle (Borç olarak ekle - müşteri bize borçlanıyor)
      await tx.cari.update({
        where: { id: workOrder.customerId },
        data: {
          bakiye: {
            increment: genelToplam,
          },
        },
      });

      // Cari hareket kaydı oluştur
      const currentCari = await tx.cari.findUnique({
        where: { id: workOrder.customerId },
        select: { bakiye: true },
      });

      await tx.cariHareket.create({
        data: {
          cariId: workOrder.customerId,
          tip: 'BORC',
          tutar: new Decimal(genelToplam),
          bakiye: currentCari?.bakiye || new Decimal(0),
          belgeTipi: 'FATURA',
          belgeNo: faturaNo,
          aciklama: `İş Emri Faturası: ${workOrder.workOrderNo}`,
        },
      });

      // İş emrini güncelle
      const updatedWorkOrder = await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          invoiceId: fatura.id,
          status: WorkOrderStatus.INVOICED,
        },
        include: {
          vehicle: true,
          customer: true,
          technician: true,
          lines: true,
          invoice: true,
        },
      });

      // Fatura log
      await tx.faturaLog.create({
        data: {
          faturaId: fatura.id,
          userId,
          actionType: 'CREATE',
          changes: JSON.stringify({
            source: 'WorkOrder',
            workOrderId,
            workOrderNo: workOrder.workOrderNo,
          }),
          ipAddress,
          userAgent,
        },
      });

      // WorkOrder Audit log
      await this.createAuditLog(
        {
          workOrderId,
          action: 'INVOICE_GENERATED',
          previousStatus: WorkOrderStatus.READY_FOR_DELIVERY,
          newStatus: WorkOrderStatus.INVOICED,
          details: {
            invoiceId: fatura.id,
            faturaNo,
            genelToplam,
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return {
        workOrder: updatedWorkOrder,
        invoice: fatura,
      };
    });
  }

  /**
   * Tüm parçaları kullanıldı olarak işaretle (toplu)
   * Tek bir raftan tüm parçaları çıkar
   */
  async markAllPartsAsUsed(
    workOrderId: string,
    warehouseId: string,
    locationId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    return this.prisma.$transaction(async (tx) => {
      const workOrder = await this.findWorkOrderOrThrow(workOrderId, tx);

      // İmmutable durum kontrolü
      this.assertMutable(workOrder.status);

      // İptal edilen iş emirlerinde stok hareketi yapılamaz
      if (workOrder.status === WorkOrderStatus.CANCELLED) {
        throw new ForbiddenException(
          'İptal edilen iş emirlerinde stok hareketi yapılamaz',
        );
      }

      // Kullanılmamış parça satırlarını bul
      const unusedPartLines = workOrder.lines.filter(
        (line) =>
          line.lineType === WorkOrderLineType.PART &&
          !line.isUsed &&
          line.productId,
      );

      if (unusedPartLines.length === 0) {
        throw new BadRequestException('Kullanılmamış parça satırı bulunamadı');
      }

      // Her parça için stok kontrolü yap
      for (const line of unusedPartLines) {
        const stockOnLocation = await tx.productLocationStock.findUnique({
          where: {
            warehouseId_locationId_productId: {
              warehouseId,
              locationId,
              productId: line.productId!,
            },
          },
        });

        if (!stockOnLocation || stockOnLocation.qtyOnHand < line.quantity) {
          const available = stockOnLocation?.qtyOnHand || 0;
          const product = line.product;
          throw new BadRequestException(
            `Yetersiz stok: ${product?.stokAdi || line.productId} - Rafta ${available} adet var, ${line.quantity} adet gerekiyor.`,
          );
        }
      }

      // Tüm parçalar için stok çıkışı yap
      const results: any[] = [];

      for (const line of unusedPartLines) {
        // Stok bakiyesini düşür
        const currentStock = await tx.productLocationStock.findUnique({
          where: {
            warehouseId_locationId_productId: {
              warehouseId,
              locationId,
              productId: line.productId!,
            },
          },
        });

        await tx.productLocationStock.update({
          where: {
            warehouseId_locationId_productId: {
              warehouseId,
              locationId,
              productId: line.productId!,
            },
          },
          data: {
            qtyOnHand: (currentStock?.qtyOnHand || 0) - line.quantity,
          },
        });

        // Stok hareketi
        await tx.stockMove.create({
          data: {
            productId: line.productId!,
            fromWarehouseId: warehouseId,
            fromLocationId: locationId,
            toWarehouseId: warehouseId,
            toLocationId: locationId,
            qty: line.quantity,
            moveType: StockMoveType.SALE,
            refType: 'WorkOrder',
            refId: workOrderId,
            note: `İş Emri: ${workOrder.workOrderNo} - Parça kullanıldı`,
            createdBy: userId,
          },
        });

        // Legacy stok hareket
        // Sadece unitPrice varsa kayıt yap (stoktan karşılama ve tedarik istekleri için fiyat yok)
        if (line.unitPrice !== null && line.unitPrice !== undefined) {
          await tx.stokHareket.create({
            data: {
              stokId: line.productId!,
              hareketTipi: HareketTipi.SATIS,
              miktar: line.quantity,
              birimFiyat: line.unitPrice,
              aciklama: `İş Emri: ${workOrder.workOrderNo}`,
            },
          });
        }

        // Satırı güncelle
        const updatedLine = await tx.workOrderLine.update({
          where: { id: line.id },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        });

        results.push(updatedLine);
      }

      // Audit log
      await this.createAuditLog(
        {
          workOrderId,
          action: 'ALL_PARTS_MARKED_AS_USED',
          details: {
            lineCount: unusedPartLines.length,
            warehouseId,
            locationId,
          },
          userId,
          ipAddress,
          userAgent,
        },
        tx,
      );

      return {
        markedLines: results.length,
        workOrder: await this.findWorkOrderOrThrow(workOrderId, tx),
      };
    });
  }

  /**
   * 6. getAllSupplyRequests - Tüm tedarik isteklerini getir
   */
  async getAllSupplyRequests(
    page: number = 1,
    limit: number = 50,
    status?: SupplyRequestStatus,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;

    const where: Prisma.WorkOrderLineWhereInput = {
      workOrder: {
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      // partSource enum kontrolü yapılmalı, eğer modelde yoksa string olarak kullanılabilir
      // Şimdilik existing koda göre partSource alanını kontrol ediyoruz
      partSource: PartSource.SUPPLY_REQUEST,
    };

    if (status) {
      where.supplyRequestStatus = status;
    }

    const [total, data] = await Promise.all([
      this.prisma.workOrderLine.count({ where }),
      this.prisma.workOrderLine.findMany({
        where,
        include: {
          workOrder: {
            include: {
              vehicle: true,
              customer: true,
            },
          },
          product: true,
        },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

