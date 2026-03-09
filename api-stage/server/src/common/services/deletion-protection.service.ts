import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DeletionProtectionService {
    constructor(private prisma: PrismaService) { }

    /**
     * Cari kart silinebilir mi kontrol eder.
     * @param id Cari ID
     * @param tenantId Tenant ID
     * @throws BadRequestException Silinemezse hata fırlatır
     */
    async checkCariDeletion(id: string, tenantId: string) {
        // 1. Hareket kontrolü
        const hareketSayisi = await this.prisma.extended.accountMovement.count({
            where: { accountId: id, tenantId },
        });

        if (hareketSayisi > 0) {
            await this.logAttempt(id, 'Cari', tenantId, 'Hareket kayıtları bulunduğu için silme engellendi.');
            throw new BadRequestException(
                'Bu cari karta ait hareket kayıtları bulunduğu için silinemez. Lütfen pasife alınız.',
            );
        }

        // 2. Invoice kontrolü
        const faturaSayisi = await this.prisma.extended.invoice.count({
            where: { accountId: id, tenantId, deletedAt: null },
        });

        if (faturaSayisi > 0) {
            await this.logAttempt(id, 'Cari', tenantId, 'Invoice kayıtları bulunduğu için silme engellendi.');
            throw new BadRequestException(
                'Bu cari karta ait fatura kayıtları bulunduğu için silinemez. Lütfen pasife alınız.',
            );
        }

        // 3. Collection kontrolü
        const tahsilatSayisi = await this.prisma.extended.collection.count({
            where: { accountId: id, tenantId },
        });

        if (tahsilatSayisi > 0) {
            await this.logAttempt(id, 'Cari', tenantId, 'Collection/Ödeme kayıtları bulunduğu için silme engellendi.');
            throw new BadRequestException(
                'Bu cari karta ait tahsilat/ödeme kayıtları bulunduğu için silinemez. Lütfen pasife alınız.',
            );
        }

        return true;
    }

    /**
     * Stok kart silinebilir mi kontrol eder.
     * @param id Stok ID
     * @param tenantId Tenant ID
     */
    async checkStokDeletion(id: string, tenantId: string) {
        // 1. Stok hareketi
        const hareketSayisi = await this.prisma.extended.productMovement.count({
            where: { productId: id, tenantId },
        });

        if (hareketSayisi > 0) {
            await this.logAttempt(id, 'Stok', tenantId, 'Stok hareketleri bulunduğu için silme engellendi.');
            throw new BadRequestException(
                'Bu product kartına ait hareketler bulunduğu için silinemez. Lütfen pasife alınız.',
            );
        }

        // 2. Invoice itemsi
        const faturaKalemSayisi = await this.prisma.extended.invoiceItem.count({
            where: { productId: id, invoice: { tenantId, deletedAt: null } },
        });

        if (faturaKalemSayisi > 0) {
            await this.logAttempt(id, 'Stok', tenantId, 'Invoice itemsinde kullanıldığı için silme engellendi.');
            throw new BadRequestException(
                'Bu product kartı faturalarda işlem gördüğü için silinemez. Lütfen pasife alınız.',
            );
        }

        // 3. Stok transferleri/hareketleri (stock_moves)
        const stockMoveSayisi = await this.prisma.extended.stockMove.count({
            where: { productId: id, product: { tenantId } },
        });

        if (stockMoveSayisi > 0) {
            await this.logAttempt(id, 'Stok', tenantId, 'Depo hareketleri bulunduğu için silme engellendi.');
            throw new BadRequestException(
                'Bu product kartına ait depo hareketleri bulunduğu için silinemez. Lütfen pasife alınız.',
            );
        }

        return true;
    }

    /**
     * Invoice silinebilir mi kontrol eder.
     * @param id Invoice ID
     * @param tenantId Tenant ID
     */
    async checkFaturaDeletion(id: string, tenantId: string) {
        const fatura = await this.prisma.extended.invoice.findUnique({
            where: { id },
            select: { status: true, tenantId: true },
        });

        if (!fatura || fatura.tenantId !== tenantId) {
            throw new BadRequestException('Invoice bulunamadı.');
        }

        // 1. Onaylılık kontrolü
        if (fatura.status === 'APPROVED') {
            await this.logAttempt(id, 'Invoice', tenantId, 'Onaylı fatura silme denemesi engellendi.');
            throw new BadRequestException(
                'Onaylanmış (Kapatılmış) faturalar silinemez. Lütfen önce iptal ediniz veya statusunu değiştiriniz.',
            );
        }

        // 2. Collection kontrolü (FaturaTahsilat tablosu)
        const tahsilatSayisi = await this.prisma.extended.invoiceCollection.count({
            where: { invoiceId: id, tenantId },
        });

        if (tahsilatSayisi > 0) {
            await this.logAttempt(id, 'Invoice', tenantId, 'Collection kaydı olan fatura silme denemesi engellendi.');
            throw new BadRequestException(
                'Bu faturaya ait tahsilat kayıtları bulunduğu için silinemez. Lütfen önce collectionsı siliniz.',
            );
        }

        return true;
    }

    /**
     * Silme girişimini günlüğe kaydeder.
     */
    private async logAttempt(resourceId: string, resource: string, tenantId: string, reason: string) {
        try {
            await this.prisma.extended.auditLog.create({
                data: {
                    action: 'DELETE_BLOCKED',
                    resource,
                    resourceId,
                    tenantId,
                    metadata: { reason },
                },
            });
        } catch (error) {
            console.error('Deletion attempt log error:', error);
        }
    }
}
