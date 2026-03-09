import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CodeTemplateService } from '../code-template/code-template.service';
import { SystemParameterService } from '../system-parameter/system-parameter.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { PartRequestStatus, WorkOrderStatus, VehicleWorkflowStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const DEFAULT_ACCOUNTS_RECEIVABLE = '120';
const DEFAULT_REVENUE_LABOR = '602';
const DEFAULT_REVENUE_PARTS = '601';

@Injectable()
export class ServiceInvoiceService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    private codeTemplateService: CodeTemplateService,
    private systemParameterService: SystemParameterService,
  ) {}

  /**
   * Step 6: Invoice oluşturma + Muhasebe kaydı
   * - SADECE WorkOrderItem'lardan fatura üretilir
   * - Tüm PartRequest'ler USED olmalı (product Step 5'te düşüldü)
   * - STOK DÜŞÜMÜ YAPILMAZ
   */
  async createFromWorkOrder(workOrderId: string, createdBy: string) {
    const tenantId = await this.tenantResolver.resolveForCreate({
      allowNull: true,
    });

    const finalTenantId = tenantId ?? undefined;

    const invoiceNo = await this.codeTemplateService.getNextCode('SERVICE_INVOICE');

    return this.prisma.extended.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findFirst({
        where: {
          id: workOrderId,
          ...buildTenantWhereClause(finalTenantId),
        },
        include: {
          items: true,
          partRequests: true,
          account: true,
          customerVehicle: true,
        },
      });

      if (!workOrder) {
        throw new NotFoundException('Work order not found');
      }

      const isReady =
        workOrder.vehicleWorkflowStatus === VehicleWorkflowStatus.READY ||
        workOrder.status === WorkOrderStatus.VEHICLE_READY ||
        workOrder.status === WorkOrderStatus.CLOSED_WITHOUT_INVOICE;
      if (!isReady) {
        throw new BadRequestException(
          'Sadece araç hazır veya kapatılmış iş emirleri faturalanabilir',
        );
      }

      const existingInvoice = await tx.serviceInvoice.findUnique({
        where: { workOrderId },
      });
      if (existingInvoice) {
        throw new BadRequestException('Bu iş emri için fatura zaten oluşturulmuş');
      }

      const partRequestsNotUsed = workOrder.partRequests.filter(
        (pr) => pr.status !== PartRequestStatus.USED && pr.status !== PartRequestStatus.CANCELLED,
      );
      if (partRequestsNotUsed.length > 0) {
        throw new BadRequestException(
          'Tüm parça talepleri kullanıldı olarak işaretlenmeden fatura oluşturulamaz',
        );
      }

      if (workOrder.items.length === 0) {
        throw new BadRequestException('İş emrinde fatura kalemi bulunmuyor');
      }

      const subtotal = Number(workOrder.grandTotal) - Number(workOrder.taxAmount);
      const taxAmount = Number(workOrder.taxAmount);
      const grandTotal = Number(workOrder.grandTotal);

      const serviceInvoice = await tx.serviceInvoice.create({
        data: {
          tenantId: finalTenantId,
          invoiceNo,
          workOrderId,
          accountId: workOrder.accountId,
          subtotal: new Decimal(subtotal),
          taxAmount: new Decimal(taxAmount),
          grandTotal: new Decimal(grandTotal),
          createdBy,
        },
        include: {
          account: { select: { id: true, code: true, unvan: true } },
          workOrder: { select: { id: true, workOrderNo: true } },
        },
      });

      const laborTotal = Number(workOrder.totalLaborCost);
      const partsTotal = Number(workOrder.totalPartsCost);

      const accountsReceivable =
        (await this.systemParameterService.getParameter(
          'SERVICE_INVOICE_ACCOUNTS_RECEIVABLE',
          DEFAULT_ACCOUNTS_RECEIVABLE,
        )) ?? DEFAULT_ACCOUNTS_RECEIVABLE;
      const revenueLabor =
        (await this.systemParameterService.getParameter(
          'SERVICE_INVOICE_REVENUE_LABOR',
          DEFAULT_REVENUE_LABOR,
        )) ?? DEFAULT_REVENUE_LABOR;
      const revenueParts =
        (await this.systemParameterService.getParameter(
          'SERVICE_INVOICE_REVENUE_PARTS',
          DEFAULT_REVENUE_PARTS,
        )) ?? DEFAULT_REVENUE_PARTS;

      const arCode = String(accountsReceivable);
      const laborCode = String(revenueLabor);
      const partsCode = String(revenueParts);

      const journalEntry = await tx.journalEntry.create({
        data: {
          tenantId: finalTenantId,
          referenceType: 'SERVICE_INVOICE',
          referenceId: serviceInvoice.id,
          serviceInvoiceId: serviceInvoice.id,
          description: `Servis Faturası ${invoiceNo} - İş Emri ${workOrder.workOrderNo}`,
          lines: {
            create: [
              {
                accountCode: arCode,
                accountName: 'Alacaklar',
                debit: new Decimal(grandTotal),
                credit: new Decimal(0),
                description: `Servis Faturası ${invoiceNo}`,
              },
              ...(laborTotal > 0
                ? [
                    {
                      accountCode: laborCode,
                      accountName: 'Hizmet Geliri',
                      debit: new Decimal(0),
                      credit: new Decimal(laborTotal),
                      description: 'İşçilik',
                    },
                  ]
                : []),
              ...(partsTotal > 0
                ? [
                    {
                      accountCode: partsCode,
                      accountName: 'Parça Satış Geliri',
                      debit: new Decimal(0),
                      credit: new Decimal(partsTotal),
                      description: 'Parça satışı',
                    },
                  ]
                : []),
            ],
          },
        },
      });

      await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: WorkOrderStatus.INVOICED_CLOSED,
          vehicleWorkflowStatus: VehicleWorkflowStatus.DELIVERED,
          actualCompletionDate: workOrder.actualCompletionDate ?? new Date(),
        },
      });

      return {
        serviceInvoice,
        journalEntry,
      };
    });
  }

  async findAll(page = 1, limit = 50, search?: string, accountId?: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: any = buildTenantWhereClause(tenantId ?? undefined);

    if (search) {
      where.OR = [
        { invoiceNo: { contains: search, mode: 'insensitive' } },
        {
          workOrder: {
            workOrderNo: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (accountId) where.accountId = accountId;

    const [data, total] = await Promise.all([
      this.prisma.extended.serviceInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issueDate: 'desc' },
        include: {
          account: { select: { id: true, code: true, unvan: true } },
          workOrder: { select: { id: true, workOrderNo: true, status: true } },
        },
      }),
      this.prisma.extended.serviceInvoice.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const invoice = await this.prisma.extended.serviceInvoice.findFirst({
      where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      include: {
        account: { select: { id: true, code: true, unvan: true } },
        workOrder: {
          include: {
            items: { include: { product: { select: { id: true, code: true, name: true } } } },
            customerVehicle: true,
          },
        },
        journalEntry: { include: { lines: true } },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Service invoice not found: id`);
    }

    return invoice;
  }
}
