import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateMaasPlanDto } from './dto/create-maas-plan.dto';
import { UpdateMaasPlanDto } from './dto/update-maas-plan.dto';
import { MaasDurum } from '@prisma/client';

@Injectable()
export class MaasPlanService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
    ) { }

    /**
     * Personel için 12 aylık maaş planı oluşturur
     * Personelin işe başlama tarihinden itibaren planlar doldurulur
     */
    async createPlanForPersonel(createDto: CreateMaasPlanDto) {
        const personel = await this.prisma.personel.findUnique({
            where: { id: createDto.personelId },
        });

        if (!personel) {
            throw new NotFoundException('Personel bulunamadı');
        }

        // Maaş ve prim bilgilerini al (DTO'dan veya personelden)
        const maas = createDto.maas ?? personel.maas ?? 0;
        const prim = createDto.prim ?? personel.prim ?? 0;
        const toplam = Number(maas) + Number(prim);

        // İşe başlama tarihi
        const iseBaslamaTarihi = personel.iseBaslamaTarihi
            ? new Date(personel.iseBaslamaTarihi)
            : new Date();
        const baslamaAy = iseBaslamaTarihi.getMonth() + 1; // 1-12

        // Mevcut planları kontrol et
        const mevcutPlanlar = await this.prisma.maasPlani.findMany({
            where: {
                personelId: createDto.personelId,
                yil: createDto.yil,
            },
        });

        if (mevcutPlanlar.length > 0) {
            throw new BadRequestException(
                `${createDto.yil} yılı için plan zaten mevcut`,
            );
        }

        // 12 aylık plan oluştur
        const planlar: any[] = [];
        for (let ay = 1; ay <= 12; ay++) {
            // Personel bu ayda çalışıyor mu?
            const ayinYili = createDto.yil;
            const personelCalisiyorMu =
                ayinYili > iseBaslamaTarihi.getFullYear() ||
                (ayinYili === iseBaslamaTarihi.getFullYear() && ay >= baslamaAy);

            // Çıkış tarihi varsa kontrol et
            let aktif = personelCalisiyorMu;
            if (personel.istenCikisTarihi) {
                const cikisTarihi = new Date(personel.istenCikisTarihi);
                const cikisYili = cikisTarihi.getFullYear();
                const cikisAyi = cikisTarihi.getMonth() + 1;

                if (
                    ayinYili > cikisYili ||
                    (ayinYili === cikisYili && ay > cikisAyi)
                ) {
                    aktif = false;
                }
            }

            const planMaas = aktif ? maas : 0;
            const planPrim = aktif ? prim : 0;
            const planToplam = Number(planMaas) + Number(planPrim);

            planlar.push({
                personelId: createDto.personelId,
                yil: createDto.yil,
                ay,
                maas: planMaas,
                prim: planPrim,
                toplam: planToplam,
                durum: MaasDurum.ODENMEDI,
                odenenTutar: 0,
                kalanTutar: planToplam,
                aktif,
            });
        }

        // Toplu oluştur
        const result = await this.prisma.maasPlani.createMany({
            data: planlar,
        });

        return {
            message: `${createDto.yil} yılı için 12 aylık plan oluşturuldu`,
            count: result.count,
            yil: createDto.yil,
            personelId: createDto.personelId,
        };
    }

    /**
     * Personelin yıllık planını getir
     */
    async getPlanByPersonel(personelId: string, yil: number) {
        const tenantId = await this.tenantResolver.resolveForQuery();

        const personel = await this.prisma.personel.findFirst({
            where: {
                id: personelId,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
        });

        if (!personel) {
            throw new NotFoundException('Personel bulunamadı');
        }

        const planlar = await this.prisma.maasPlani.findMany({
            where: {
                personelId,
                yil,
            },
            include: {
                odemeler: {
                    include: {
                        odemeDetaylari: {
                            include: {
                                kasa: { select: { id: true, kasaAdi: true } },
                                bankaHesap: { select: { id: true, hesapAdi: true } },
                            },
                        },
                        createdByUser: {
                            select: { id: true, fullName: true },
                        },
                    },
                    orderBy: { tarih: 'desc' },
                },
                mahsuplasmalar: {
                    include: {
                        avans: {
                            select: { id: true, tutar: true, tarih: true },
                        },
                    },
                },
            },
            orderBy: { ay: 'asc' },
        });

        return {
            personel: {
                id: personel.id,
                ad: personel.ad,
                soyad: personel.soyad,
                personelKodu: personel.personelKodu,
                maas: personel.maas,
                prim: personel.prim,
            },
            yil,
            planlar,
        };
    }

    /**
     * Tek plan detayı
     */
    async getPlanById(id: string) {
        const plan = await this.prisma.maasPlani.findUnique({
            where: { id },
            include: {
                personel: {
                    select: {
                        id: true,
                        ad: true,
                        soyad: true,
                        personelKodu: true,
                    },
                },
                odemeler: {
                    include: {
                        odemeDetaylari: {
                            include: {
                                kasa: { select: { id: true, kasaAdi: true } },
                                bankaHesap: { select: { id: true, hesapAdi: true } },
                            },
                        },
                        createdByUser: {
                            select: { id: true, fullName: true },
                        },
                    },
                    orderBy: { tarih: 'desc' },
                },
                mahsuplasmalar: {
                    include: {
                        avans: true,
                    },
                },
            },
        });

        if (!plan) {
            throw new NotFoundException('Plan bulunamadı');
        }

        return plan;
    }

    /**
     * Plan güncelle
     */
    async updatePlan(id: string, updateDto: UpdateMaasPlanDto) {
        const existing = await this.prisma.maasPlani.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('Plan bulunamadı');
        }

        const updateData: any = { ...updateDto };

        // Maaş veya prim değiştiyse toplam ve kalan tutarı yeniden hesapla
        if (updateDto.maas !== undefined || updateDto.prim !== undefined) {
            const yeniMaas = updateDto.maas ?? existing.maas;
            const yeniPrim = updateDto.prim ?? existing.prim;
            updateData.toplam = Number(yeniMaas) + Number(yeniPrim);
            updateData.kalanTutar =
                Number(updateData.toplam) - Number(existing.odenenTutar);
        }

        return this.prisma.maasPlani.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Belirli aydaki ödenecek maaşları getir
     */
    async getOdenecekMaaslar(yil: number, ay: number) {
        console.log(`getOdenecekMaaslar called for ${yil}/${ay}`);
        try {
            const tenantId = await this.tenantResolver.resolveForQuery();
            console.log('Tenant resolved:', tenantId);


            const planlar = await this.prisma.maasPlani.findMany({
                where: {
                    yil,
                    ay,
                    aktif: true,
                    durum: {
                        in: [MaasDurum.ODENMEDI, MaasDurum.KISMI_ODENDI],
                    },
                    personel: {
                        ...buildTenantWhereClause(tenantId ?? undefined),
                        aktif: true,
                    },
                },
                include: {
                    personel: {
                        select: {
                            id: true,
                            ad: true,
                            soyad: true,
                            personelKodu: true,
                            departman: true,
                        },
                    },
                },
                orderBy: {
                    personel: {
                        ad: 'asc',
                    },
                },
            });

            // Decimal alanları number'a çevir
            const safePlanlar = planlar.map(p => ({
                ...p,
                maas: Number(p.maas),
                prim: Number(p.prim),
                toplam: Number(p.toplam),
                odenenTutar: Number(p.odenenTutar),
                kalanTutar: Number(p.kalanTutar),
            }));

            const toplam = planlar.reduce(
                (sum, plan) => sum + Number(plan.kalanTutar),
                0,
            );

            return {
                yil,
                ay,
                planlar: safePlanlar,
                toplamOdenecek: toplam,
                personelSayisi: planlar.length,
            };
        } catch (error) {
            console.error('getOdenecekMaaslar ERROR:', error);
            throw error;
        }
    }

    /**
     * Planı sil
     */
    async deletePlan(id: string) {
        const plan = await this.prisma.maasPlani.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { odemeler: true },
                },
            },
        });

        if (!plan) {
            throw new NotFoundException('Plan bulunamadı');
        }

        if (plan._count.odemeler > 0) {
            throw new BadRequestException(
                'Bu plana ait ödeme kayıtları var. Önce ödemeleri silmeniz gerekir.',
            );
        }

        return this.prisma.maasPlani.delete({
            where: { id },
        });
    }

    /**
     * Yıllık planı sil (tüm aylar)
     */
    async deleteYillikPlan(personelId: string, yil: number) {
        const planlar = await this.prisma.maasPlani.findMany({
            where: { personelId, yil },
            include: {
                _count: { select: { odemeler: true } },
            },
        });

        const odemeliPlanlar = planlar.filter((p) => p._count.odemeler > 0);
        if (odemeliPlanlar.length > 0) {
            throw new BadRequestException(
                'Bazı planlara ait ödeme kayıtları var. Önce ödemeleri silmeniz gerekir.',
            );
        }

        const result = await this.prisma.maasPlani.deleteMany({
            where: { personelId, yil },
        });

        return {
            message: `${yil} yılı planı silindi`,
            count: result.count,
        };
    }
}
