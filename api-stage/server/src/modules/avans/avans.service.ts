import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateAvansDto } from './dto/create-avans.dto';
import { MahsuplastirAvansDto } from './dto/mahsuplastir-avans.dto';
import { AvansDurum } from '@prisma/client';

@Injectable()
export class AvansService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
    ) { }

    /**
     * Avans ver
     */
    async createAvans(createDto: CreateAvansDto, userId: string) {
        const personel = await this.prisma.personel.findUnique({
            where: { id: createDto.personelId },
        });

        if (!personel) {
            throw new NotFoundException('Personel bulunamadı');
        }

        if (!personel.aktif) {
            throw new BadRequestException('Pasif personele avans verilemez');
        }

        // Kasa kontrolü
        if (createDto.kasaId) {
            const kasa = await this.prisma.kasa.findUnique({
                where: { id: createDto.kasaId },
            });

            if (!kasa || !kasa.aktif) {
                throw new NotFoundException('Geçerli bir kasa bulunamadı');
            }
        }

        return this.prisma.$transaction(async (prisma) => {
            const tarih = createDto.tarih ? new Date(createDto.tarih) : new Date();

            // Avans kaydı oluştur
            const avans = await prisma.avans.create({
                data: {
                    personelId: createDto.personelId,
                    tutar: createDto.tutar,
                    tarih,
                    aciklama: createDto.aciklama,
                    kasaId: createDto.kasaId,
                    mahsupEdilen: 0,
                    kalan: createDto.tutar,
                    durum: AvansDurum.ACIK,
                    createdBy: userId,
                },
                include: {
                    personel: {
                        select: {
                            id: true,
                            ad: true,
                            soyad: true,
                            personelKodu: true,
                        },
                    },
                    kasa: {
                        select: { id: true, kasaAdi: true },
                    },
                    createdByUser: {
                        select: { id: true, fullName: true },
                    },
                },
            });

            // Kasadan düş
            if (createDto.kasaId) {
                const kasa = await prisma.kasa.findUnique({
                    where: { id: createDto.kasaId },
                });

                if (kasa) {
                    const yeniKasaBakiye = Number(kasa.bakiye) - createDto.tutar;

                    if (yeniKasaBakiye < 0) {
                        throw new BadRequestException('Kasada yeterli bakiye yok');
                    }

                    await prisma.kasa.update({
                        where: { id: createDto.kasaId },
                        data: { bakiye: yeniKasaBakiye },
                    });
                }
            }

            return avans;
        });
    }

    /**
     * Avans mahsuplaştır
     */
    async mahsuplastir(mahsupDto: MahsuplastirAvansDto) {
        const avans = await this.prisma.avans.findUnique({
            where: { id: mahsupDto.avansId },
            include: {
                personel: true,
            },
        });

        if (!avans) {
            throw new NotFoundException('Avans bulunamadı');
        }

        if (avans.durum === AvansDurum.KAPALI) {
            throw new BadRequestException('Bu avans zaten kapatılmış');
        }

        // Toplam mahsup tutarını hesapla
        const toplamMahsup = mahsupDto.planlar.reduce(
            (sum, plan) => sum + plan.tutar,
            0,
        );

        if (toplamMahsup > Number(avans.kalan)) {
            throw new BadRequestException(
                `Mahsup tutarı (${toplamMahsup}) kalan avanstan (${avans.kalan}) fazla olamaz`,
            );
        }

        // Planları kontrol et
        for (const planDto of mahsupDto.planlar) {
            const plan = await this.prisma.maasPlani.findUnique({
                where: { id: planDto.planId },
            });

            if (!plan) {
                throw new NotFoundException(`Plan bulunamadı: ${planDto.planId}`);
            }

            if (plan.personelId !== avans.personelId) {
                throw new BadRequestException(
                    'Plan farklı bir personele ait',
                );
            }
        }

        return this.prisma.$transaction(async (prisma) => {
            // Mahsuplaşmaları oluştur
            for (const planDto of mahsupDto.planlar) {
                await prisma.avansMahsuplasma.create({
                    data: {
                        avansId: mahsupDto.avansId,
                        planId: planDto.planId,
                        tutar: planDto.tutar,
                        aciklama: planDto.aciklama,
                    },
                });

                // Planın kalan tutarını azalt
                const plan = await prisma.maasPlani.findUnique({
                    where: { id: planDto.planId },
                });

                if (plan) {
                    const yeniKalanTutar = Number(plan.kalanTutar) - planDto.tutar;
                    await prisma.maasPlani.update({
                        where: { id: planDto.planId },
                        data: {
                            kalanTutar: yeniKalanTutar < 0 ? 0 : yeniKalanTutar,
                        },
                    });
                }
            }

            // Avans durumunu güncelle
            const yeniMahsupEdilen = Number(avans.mahsupEdilen) + toplamMahsup;
            const yeniKalan = Number(avans.tutar) - yeniMahsupEdilen;

            let yeniDurum: AvansDurum;
            if (yeniKalan <= 0.01) {
                yeniDurum = AvansDurum.KAPALI;
            } else if (yeniMahsupEdilen > 0) {
                yeniDurum = AvansDurum.KISMI;
            } else {
                yeniDurum = AvansDurum.ACIK;
            }

            return prisma.avans.update({
                where: { id: mahsupDto.avansId },
                data: {
                    mahsupEdilen: yeniMahsupEdilen,
                    kalan: yeniKalan,
                    durum: yeniDurum,
                },
                include: {
                    personel: {
                        select: {
                            id: true,
                            ad: true,
                            soyad: true,
                            personelKodu: true,
                        },
                    },
                    mahsuplasmalar: {
                        include: {
                            plan: {
                                select: {
                                    yil: true,
                                    ay: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }

    /**
     * Personel avanslarını getir
     */
    async getAvansByPersonel(personelId: string) {
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

        return this.prisma.avans.findMany({
            where: { personelId },
            include: {
                kasa: {
                    select: { id: true, kasaAdi: true },
                },
                mahsuplasmalar: {
                    include: {
                        plan: {
                            select: {
                                yil: true,
                                ay: true,
                            },
                        },
                    },
                },
                createdByUser: {
                    select: { id: true, fullName: true },
                },
            },
            orderBy: { tarih: 'desc' },
        });
    }

    /**
     * Avans detayı
     */
    async getAvansDetay(id: string) {
        const avans = await this.prisma.avans.findUnique({
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
                kasa: {
                    select: { id: true, kasaAdi: true },
                },
                mahsuplasmalar: {
                    include: {
                        plan: {
                            select: {
                                yil: true,
                                ay: true,
                                toplam: true,
                            },
                        },
                    },
                    orderBy: { tarih: 'desc' },
                },
                createdByUser: {
                    select: { id: true, fullName: true },
                },
            },
        });

        if (!avans) {
            throw new NotFoundException('Avans bulunamadı');
        }

        return avans;
    }
}
