import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { Prisma } from '@prisma/client';
import { InvoiceStatus, InvoiceType } from './invoice.enums';
import * as ExcelJS from 'exceljs';

@Injectable()
export class InvoiceExportService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantResolver: TenantResolverService,
    ) { }

    async generateSalesInvoiceExcel(
        invoiceType?: InvoiceType,
        startDate?: string,
        endDate?: string,
        status?: string,
        search?: string,
        satisElemaniId?: string,
    ): Promise<Buffer> {
        const tenantId = await this.tenantResolver.resolveForQuery();

        const where: Prisma.InvoiceWhereInput = {
            deletedAt: null,
            ...buildTenantWhereClause(tenantId ?? undefined),
        };

        if (invoiceType) (where as any).invoiceType = invoiceType;
        if (satisElemaniId) (where as any).salesAgentId = satisElemaniId;

        if (startDate || endDate) {
            where.date = {};
            if (startDate) (where.date as any).gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                (where.date as any).lte = end;
            }
        }

        if (status) {
            const mapStatus = (s: string) => {
                const v = s.trim();
                const trToEn: Record<string, string> = {
                    OPEN: 'OPEN',
                    ONAYLANDI: 'APPROVED',
                    KISMEN_ODENDI: 'PARTIALLY_PAID',
                    CLOSED: 'CLOSED',
                    CANCELLATION: 'CANCELLED',
                };
                return trToEn[v] || v;
            };
            const statuslar = status.split(',').map(mapStatus);
            (where as any).status = { in: statuslar };
        }

        if (search) {
            where.OR = [
                { invoiceNo: { contains: search, mode: 'insensitive' } },
                { account: { title: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const faturalar = await this.prisma.extended.invoice.findMany({
            where,
            include: {
                account: { select: { title: true, code: true } },
                salesAgent: { select: { fullName: true } },
            },
            orderBy: { date: 'desc' },
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Faturalar');

        const statusLabels: Record<string, string> = {
            OPEN: 'Açık',
            APPROVED: 'Onaylandı',
            PARTIALLY_PAID: 'Kısmen Ödendi',
            CLOSED: 'Kapalı',
            CANCELLED: 'İptal',
            DRAFT: 'Taslak',
        };

        worksheet.columns = [
            { header: 'Invoice No', key: 'faturaNo', width: 18 },
            { header: 'Tarih', key: 'date', width: 14 },
            { header: 'Cari Kodu', key: 'code', width: 14 },
            { header: 'Cari Unvan', key: 'title', width: 30 },
            { header: 'Vade', key: 'vade', width: 14 },
            { header: 'Ara Toplam', key: 'totalAmount', width: 16 },
            { header: 'KDV', key: 'kdvTutar', width: 14 },
            { header: 'Genel Toplam', key: 'grandTotal', width: 18 },
            { header: 'Döviz', key: 'dovizCinsi', width: 10 },
            { header: 'Kur', key: 'dovizKuru', width: 12 },
            { header: 'Döviz Toplam', key: 'dovizToplam', width: 18 },
            { header: 'Durum', key: 'status', width: 14 },
            { header: 'Satış Elemanı', key: 'satisElemani', width: 20 },
        ];

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1976D2' },
        };
        headerRow.alignment = { horizontal: 'center' };

        // Add data
        faturalar.forEach((f) => {
            worksheet.addRow({
                faturaNo: (f as any).invoiceNo,
                date: (f as any).date ? new Date((f as any).date).toLocaleDateString('tr-TR') : '',
                code: (f as any).account?.code || '',
                title: (f as any).account?.title || '',
                vade: (f as any).dueDate ? new Date((f as any).dueDate).toLocaleDateString('tr-TR') : '',
                totalAmount: Number((f as any).totalAmount),
                kdvTutar: Number((f as any).vatAmount),
                grandTotal: Number((f as any).grandTotal),
                dovizCinsi: (f as any).dovizCinsi || 'TRY',
                dovizKuru: (f as any).dovizKuru ? Number((f as any).dovizKuru) : 1,
                dovizToplam: (f as any).dovizToplam
                    ? Number((f as any).dovizToplam)
                    : Number((f as any).grandTotal),
                status: statusLabels[(f as any).status] || (f as any).status,
                satisElemani: (f as any).salesAgent?.fullName || '',
            });
        });

        // Number formatting for currency columns
        ['totalAmount', 'kdvTutar', 'grandTotal'].forEach((key) => {
            const col = worksheet.getColumn(key);
            col.numFmt = '#,##0.00 ₺';
        });

        // Add totals row
        const lastRow = faturalar.length + 2;
        const totalsRow = worksheet.getRow(lastRow);
        totalsRow.getCell('title').value = 'TOPLAM';
        totalsRow.getCell('title').font = { bold: true };
        totalsRow.getCell('totalAmount').value = { formula: `SUM(F2:F${lastRow - 1})` };
        totalsRow.getCell('kdvTutar').value = { formula: `SUM(G2:G${lastRow - 1})` };
        totalsRow.getCell('grandTotal').value = { formula: `SUM(H2:H${lastRow - 1})` };
        totalsRow.font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
