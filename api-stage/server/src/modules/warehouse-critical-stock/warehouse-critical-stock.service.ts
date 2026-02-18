import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';

@Injectable()
export class WarehouseCriticalStockService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
    ) { }

    async bulkCreateForProduct(productId: string, criticalQty: number) {
        const tenantId = await this.tenantResolver.resolveForQuery();

        // Get all active warehouses
        const warehouses = await this.prisma.warehouse.findMany({
            where: {
                active: true,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
        });

        // Create critical stock records for all warehouses
        const createPromises = warehouses.map((warehouse) =>
            this.prisma.warehouseCriticalStock.upsert({
                where: {
                    warehouseId_productId: {
                        warehouseId: warehouse.id,
                        productId,
                    },
                },
                create: {
                    warehouseId: warehouse.id,
                    productId,
                    criticalQty,
                },
                update: {
                    criticalQty,
                },
            }),
        );

        return Promise.all(createPromises);
    }

    async updateCriticalStock(warehouseId: string, productId: string, criticalQty: number) {
        return this.prisma.warehouseCriticalStock.upsert({
            where: {
                warehouseId_productId: {
                    warehouseId,
                    productId,
                },
            },
            create: {
                warehouseId,
                productId,
                criticalQty,
            },
            update: {
                criticalQty,
            },
        });
    }

    async getCriticalStockReport() {
        const tenantId = await this.tenantResolver.resolveForQuery();

        // 1. Get all active warehouses
        const warehouses = await this.prisma.warehouse.findMany({
            where: {
                active: true,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
            select: { id: true, name: true, code: true },
        });

        // 2. Get all products with their current stock levels
        const currentStocks = await this.prisma.productLocationStock.findMany({
            where: {
                warehouse: {
                    ...buildTenantWhereClause(tenantId ?? undefined),
                },
            },
            include: {
                product: {
                    select: { id: true, stokKodu: true, stokAdi: true, birim: true, marka: true },
                },
            },
        });

        // 3. Get all critical stock settings
        const criticalStocks = await this.prisma.warehouseCriticalStock.findMany({
            where: {
                warehouse: {
                    ...buildTenantWhereClause(tenantId ?? undefined),
                },
            },
        });

        // 4. Build product matrix
        const productMatrix: Record<string, any> = {};

        // Initialize with current stocks
        currentStocks.forEach((stock) => {
            const pId = stock.productId;
            if (!productMatrix[pId]) {
                productMatrix[pId] = {
                    productId: pId,
                    stokKodu: stock.product.stokKodu,
                    stokAdi: stock.product.stokAdi,
                    birim: stock.product.birim,
                    marka: stock.product.marka,
                    warehouses: {},
                    overallStatus: 'NORMAL',
                };
                // Initialize all warehouses
                warehouses.forEach((w) => {
                    productMatrix[pId].warehouses[w.id] = {
                        currentStock: 0,
                        criticalStock: 0,
                        status: 'NORMAL',
                    };
                });
            }
            productMatrix[pId].warehouses[stock.warehouseId].currentStock += stock.qtyOnHand;
        });

        // Apply critical stock thresholds
        criticalStocks.forEach((cs) => {
            if (productMatrix[cs.productId]) {
                productMatrix[cs.productId].warehouses[cs.warehouseId].criticalStock = cs.criticalQty;
            }
        });

        // Calculate statuses
        Object.values(productMatrix).forEach((product: any) => {
            let hasCritical = false;
            let hasEqual = false;

            Object.values(product.warehouses).forEach((wh: any) => {
                if (wh.currentStock < wh.criticalStock) {
                    wh.status = 'BELOW';
                    hasCritical = true;
                } else if (wh.currentStock === wh.criticalStock) {
                    wh.status = 'EQUAL';
                    hasEqual = true;
                } else {
                    wh.status = 'ABOVE';
                }
            });

            if (hasCritical) {
                product.overallStatus = 'CRITICAL';
            } else if (hasEqual) {
                product.overallStatus = 'WARNING';
            } else {
                product.overallStatus = 'NORMAL';
            }
        });

        return {
            warehouses,
            report: Object.values(productMatrix),
        };
    }

    async bulkUpdateFromExcel(data: { stokKodu: string; ambarKodu: string; criticalQty: number }[]) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const tenantWhere = buildTenantWhereClause(tenantId ?? undefined);

        // 1. Get all active warehouses to map codes to IDs
        const warehouses = await this.prisma.warehouse.findMany({
            where: {
                active: true,
                ...tenantWhere,
            },
            select: { id: true, code: true },
        });

        // Create a map for exact matches and a normalized map (numeric -> id)
        const warehouseMap = new Map<string, string>();
        const warehouseNumericMap = new Map<string, string>();

        warehouses.forEach(w => {
            const code = w.code.trim().toUpperCase();
            warehouseMap.set(code, w.id);

            // If code is numeric (e.g., "01"), store its integer representation as a string ("1")
            const numericValue = parseInt(code, 10);
            if (!isNaN(numericValue)) {
                warehouseNumericMap.set(numericValue.toString(), w.id);
            }
        });

        // 2. Get all involved products to map codes to IDs
        const rawStokKodlari = data.map((d) => d.stokKodu?.toString().trim().toUpperCase()).filter(Boolean);
        const stokKodlari = [...new Set(rawStokKodlari)];

        // Find products exactly matching provided codes
        const products = await this.prisma.stok.findMany({
            where: {
                stokKodu: { in: stokKodlari },
                ...tenantWhere,
            },
            select: { id: true, stokKodu: true },
        });

        const productMap = new Map(products.map((p) => [p.stokKodu.trim().toUpperCase(), p.id]));

        // 3. Process updates
        const results = {
            updated: 0,
            skipped: 0,
            errors: [] as string[],
        };

        const updatePromises = data.map(async (row) => {
            const wCodeRaw = row.ambarKodu?.toString().trim().toUpperCase();
            const pCodeRaw = row.stokKodu?.toString().trim().toUpperCase();

            if (!wCodeRaw || !pCodeRaw) {
                results.skipped++;
                results.errors.push(`Geçersiz satır: Ambar=${wCodeRaw || 'Boş'}, Stok=${pCodeRaw || 'Boş'}`);
                return;
            }

            // Warehouse matching: try exact then normalized numeric
            let wId = warehouseMap.get(wCodeRaw);
            if (!wId) {
                const numericCode = parseInt(wCodeRaw, 10);
                if (!isNaN(numericCode)) {
                    wId = warehouseNumericMap.get(numericCode.toString());
                }
            }

            // Product matching: exact match
            const pId = productMap.get(pCodeRaw);

            if (!wId || !pId) {
                results.skipped++;
                if (!wId) results.errors.push(`Ambar kodu bulunamadı: ${wCodeRaw}`);
                if (!pId) results.errors.push(`Stok kodu bulunamadı: ${pCodeRaw}`);
                return;
            }

            try {
                await this.prisma.warehouseCriticalStock.upsert({
                    where: {
                        warehouseId_productId: {
                            warehouseId: wId,
                            productId: pId,
                        },
                    },
                    create: {
                        warehouseId: wId,
                        productId: pId,
                        criticalQty: Number(row.criticalQty),
                    },
                    update: {
                        criticalQty: Number(row.criticalQty),
                    },
                });
                results.updated++;
            } catch (error) {
                results.errors.push(`${pCodeRaw} @ ${wCodeRaw} güncellenirken hata: ${error.message}`);
            }
        });

        await Promise.all(updatePromises);
        return results;
    }
}
