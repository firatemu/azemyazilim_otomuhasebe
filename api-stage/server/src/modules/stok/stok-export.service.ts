
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as ExcelJS from 'exceljs';
import { StokService } from './stok.service';

@Injectable()
export class StokExportService {
    constructor(
        private readonly prisma: PrismaService,
        // Circular dependency might be an issue here if StokService injects StokExportService.
        // For now, let's assume we can query data directly or use PrismaService to avoid circular dep.
        // Or we can inject StokService with @Inject(forwardRef(() => StokService)) if needed.
        // But direct Prisma query is safer for a simple export to avoid complexity.
    ) { }

    async generateEslesmeExcel(tenantId: string): Promise<Buffer> {
        // Fetch all stocks for the tenant
        const stoks = await this.prisma.stok.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                esdegerGrup: {
                    include: {
                        urunler: {
                            select: { stokKodu: true, stokAdi: true }
                        }
                    }
                }
            }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ürün Eşleşmeleri');

        // Headers
        worksheet.columns = [
            { header: 'Stok Kodu', key: 'stokKodu', width: 20 },
            { header: 'Stok Adı', key: 'stokAdi', width: 40 },
            { header: 'Marka', key: 'marka', width: 15 },
            { header: 'OEM', key: 'oem', width: 20 },
            { header: 'Eşleşme Durumu', key: 'durum', width: 15 },
            { header: 'Eşleşen Ürünler', key: 'eslesenler', width: 50 },
        ];

        // Style headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };

        // Data
        stoks.forEach((stok) => {
            let durum = 'Eşleşme Yok';
            let eslesenler = '';

            if (stok.esdegerGrup) {
                const digerUrunler = stok.esdegerGrup.urunler.filter(u => u.stokKodu !== stok.stokKodu);
                if (digerUrunler.length > 0) {
                    durum = 'Eşleşti';
                    eslesenler = digerUrunler.map(u => `${u.stokKodu} (${u.stokAdi})`).join(', ');
                }
            }

            const row = worksheet.addRow({
                stokKodu: stok.stokKodu,
                stokAdi: stok.stokAdi,
                marka: stok.marka || '-',
                oem: stok.oem || '-',
                durum: durum,
                eslesenler: eslesenler,
            });

            // Conditional formatting
            if (durum === 'Eşleşti') {
                row.getCell('durum').font = { color: { argb: 'FF008000' }, bold: true }; // Green
            } else {
                row.getCell('durum').font = { color: { argb: 'FF808080' } }; // Gray
            }
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
