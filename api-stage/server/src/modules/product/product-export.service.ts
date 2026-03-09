
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as ExcelJS from 'exceljs';
import { ProductService } from './product.service';

@Injectable()
export class ProductExportService {
    constructor(
        private readonly prisma: PrismaService,
        // Circular dependency might be an issue here if ProductService injects ProductExportService.
        // For now, let's assume we can query data directly or use PrismaService to avoid circular dep.
        // Or we can inject ProductService with @Inject(forwardRef(() => ProductService)) if needed.
        // But direct Prisma query is safer for a simple export to avoid complexity.
    ) { }

    async generateEslesmeExcel(tenantId: string): Promise<Buffer> {
        // Fetch all products for the tenant
        const products = await this.prisma.extended.product.findMany({
            where: {
                tenantId,
                isCategoryOnly: { not: true },
                isBrandOnly: { not: true },
            },
            orderBy: { createdAt: 'desc' },
            include: {
                equivalencyGroup: {
                    include: {
                        products: {
                            select: { code: true, name: true }
                        }
                    }
                }
            }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ürün Eşleşmeleri');

        // Headers
        worksheet.columns = [
            { header: 'Stok Kodu', key: 'code', width: 20 },
            { header: 'Stok Adı', key: 'name', width: 40 },
            { header: 'Marka', key: 'marka', width: 15 },
            { header: 'OEM', key: 'oem', width: 20 },
            { header: 'Eşleşme Durumu', key: 'status', width: 15 },
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
        products.forEach((product) => {
            let status = 'Eşleşme Yok';
            let eslesenler = '';

            if (product.equivalencyGroup) {
                const digerUrunler = product.equivalencyGroup.products.filter(u => u.code !== product.code);
                if (digerUrunler.length > 0) {
                    status = 'Eşleşti';
                    eslesenler = digerUrunler.map(u => `${u.code} (${u.name})`).join(', ');
                }
            }

            const row = worksheet.addRow({
                code: product.code,
                name: product.name,
                marka: product.brand || '-',
                oem: product.oem || '-',
                status: status,
                eslesenler: eslesenler,
            });

            // Conditional formatting
            if (status === 'Eşleşti') {
                row.getCell('status').font = { color: { argb: 'FF008000' }, bold: true }; // Green
            } else {
                row.getCell('status').font = { color: { argb: 'FF808080' } }; // Gray
            }
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
