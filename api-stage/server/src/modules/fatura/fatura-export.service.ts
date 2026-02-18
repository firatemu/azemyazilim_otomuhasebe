import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { FaturaDurum, FaturaTipi, Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';

@Injectable()
export class FaturaExportService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantResolver: TenantResolverService,
    ) { }

    async generateSalesInvoiceExcel(
        faturaTipi?: FaturaTipi,
        startDate?: string,
        endDate?: string,
        durum?: string,
        search?: string,
        satisElemaniId?: string,
    ): Promise<Buffer> {
        const tenantId = await this.tenantResolver.resolveForQuery();

        const where: Prisma.FaturaWhereInput = {
            deletedAt: null,
            ...buildTenantWhereClause(tenantId ?? undefined),
        };

        if (faturaTipi) where.faturaTipi = faturaTipi;
        if (satisElemaniId) where.satisElemaniId = satisElemaniId;

        if (startDate || endDate) {
            where.tarih = {};
            if (startDate) (where.tarih as any).gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                (where.tarih as any).lte = end;
            }
        }

        if (durum) {
            const durumlar = durum.split(',').map((d) => d.trim()) as FaturaDurum[];
            where.durum = { in: durumlar };
        }

        if (search) {
            where.OR = [
                { faturaNo: { contains: search, mode: 'insensitive' } },
                { cari: { unvan: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const faturalar = await this.prisma.fatura.findMany({
            where,
            include: {
                cari: { select: { unvan: true, cariKodu: true } },
                satisElemani: { select: { adSoyad: true } },
            },
            orderBy: { tarih: 'desc' },
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Faturalar');

        const durumLabels: Record<string, string> = {
            ACIK: 'Açık',
            ONAYLANDI: 'Onaylandı',
            KISMEN_ODENDI: 'Kısmen Ödendi',
            KAPALI: 'Kapalı',
            IPTAL: 'İptal',
        };

        worksheet.columns = [
            { header: 'Fatura No', key: 'faturaNo', width: 18 },
            { header: 'Tarih', key: 'tarih', width: 14 },
            { header: 'Cari Kodu', key: 'cariKodu', width: 14 },
            { header: 'Cari Unvan', key: 'cariUnvan', width: 30 },
            { header: 'Vade', key: 'vade', width: 14 },
            { header: 'Ara Toplam', key: 'toplamTutar', width: 16 },
            { header: 'KDV', key: 'kdvTutar', width: 14 },
            { header: 'Genel Toplam', key: 'genelToplam', width: 18 },
            { header: 'Genel Toplam', key: 'genelToplam', width: 18 },
            { header: 'Döviz', key: 'dovizCinsi', width: 10 },
            { header: 'Kur', key: 'dovizKuru', width: 12 },
            { header: 'Döviz Toplam', key: 'dovizToplam', width: 18 },
            { header: 'Durum', key: 'durum', width: 14 },
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
                faturaNo: f.faturaNo,
                tarih: f.tarih ? new Date(f.tarih).toLocaleDateString('tr-TR') : '',
                cariKodu: f.cari?.cariKodu || '',
                cariUnvan: f.cari?.unvan || '',
                vade: f.vade ? new Date(f.vade).toLocaleDateString('tr-TR') : '',
                toplamTutar: Number(f.toplamTutar),
                kdvTutar: Number(f.kdvTutar),
                genelToplam: Number(f.genelToplam),
                dovizCinsi: (f as any).dovizCinsi || 'TRY',
                dovizKuru: (f as any).dovizKuru ? Number((f as any).dovizKuru) : 1,
                dovizToplam: (f as any).dovizToplam ? Number((f as any).dovizToplam) : Number(f.genelToplam),
                durum: durumLabels[f.durum] || f.durum,
                satisElemani: (f as any).satisElemani?.adSoyad || '',
            });
        });

        // Number formatting for currency columns
        ['toplamTutar', 'kdvTutar', 'genelToplam'].forEach((key) => {
            const col = worksheet.getColumn(key);
            col.numFmt = '#,##0.00 ₺';
        });

        // Add totals row
        const lastRow = faturalar.length + 2;
        const totalsRow = worksheet.getRow(lastRow);
        totalsRow.getCell('cariUnvan').value = 'TOPLAM';
        totalsRow.getCell('cariUnvan').font = { bold: true };
        totalsRow.getCell('toplamTutar').value = { formula: `SUM(F2:F${lastRow - 1})` };
        totalsRow.getCell('kdvTutar').value = { formula: `SUM(G2:G${lastRow - 1})` };
        totalsRow.getCell('genelToplam').value = { formula: `SUM(H2:H${lastRow - 1})` };
        totalsRow.font = { bold: true };

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
