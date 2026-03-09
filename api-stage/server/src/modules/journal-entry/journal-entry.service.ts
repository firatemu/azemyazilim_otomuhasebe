import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';

@Injectable()
export class JournalEntryService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) { }

  async findAll(
    page = 1,
    limit = 50,
    referenceType?: string,
    referenceId?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: any = buildTenantWhereClause(tenantId ?? undefined);

    if (referenceType) where.referenceType = referenceType;
    if (referenceId) where.referenceId = referenceId;

    const [data, total] = await Promise.all([
      this.prisma.extended.journalEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { entryDate: 'desc' },
        include: {
          lines: true,
          serviceInvoice: {
            select: { id: true, invoiceNo: true, grandTotal: true },
          },
        },
      }),
      this.prisma.extended.journalEntry.count({ where }),
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
    const entry = await this.prisma.extended.journalEntry.findFirst({
      where: { id, ...buildTenantWhereClause(tenantId ?? undefined) },
      include: {
        lines: true,
        serviceInvoice: {
          include: {
            workOrder: { select: { id: true, workOrderNo: true } },
            account: { select: { id: true, code: true, title: true } },
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException(`Accounting record not found: ${id}`);
    }

    return entry;
  }

  async findByReference(referenceType: string, referenceId: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const entry = await this.prisma.extended.journalEntry.findFirst({
      where: {
        referenceType,
        referenceId,
        ...buildTenantWhereClause(tenantId ?? undefined),
      },
      include: {
        lines: true,
        serviceInvoice: true,
      },
    });

    if (!entry) {
      throw new NotFoundException(`Accounting record not found: ${referenceType}/${referenceId}`);
    }

    return entry;
  }
}
