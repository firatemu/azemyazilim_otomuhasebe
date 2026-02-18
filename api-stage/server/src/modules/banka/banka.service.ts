import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateBankaDto, UpdateBankaDto } from './dto/create-banka.dto';
import { CreateBankaHesapDto, UpdateBankaHesapDto } from './dto/create-hesap.dto';
import { CreateBankaHareketDto, CreatePosHareketDto } from './dto/create-hareket.dto';
import { CreateKrediKullanimDto } from './dto/create-kredi.dto';
import { PayCreditInstallmentDto, OdemeTipi } from './dto/pay-credit-installment.dto';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { BankaHareketTipi, BankaHareketAltTipi, KrediDurum, KrediPlanDurum, KrediTuru } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BankaService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantContext: TenantContextService,
    ) { }

    // ============ BANKA CRUD ============

    async create(createBankaDto: CreateBankaDto) {
        const tenantId = this.tenantContext.getTenantId();
        return this.prisma.banka.create({
            data: {
                ...createBankaDto,
                tenantId,
            },
            include: {
                hesaplar: true,
            },
        });
    }

    async findAll() {
        const tenantId = this.tenantContext.getTenantId();
        return this.prisma.banka.findMany({
            where: { tenantId },
            include: {
                hesaplar: {
                    select: {
                        id: true,
                        hesapAdi: true,
                        hesapTipi: true,
                        bakiye: true,
                        hesapNo: true,
                        iban: true,
                    }
                },
                _count: {
                    select: { hesaplar: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const tenantId = this.tenantContext.getTenantId();
        const banka = await this.prisma.banka.findFirst({
            where: { id, tenantId },
            include: {
                hesaplar: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        krediler: {
                            include: {
                                planlar: true
                            }
                        }
                    }
                },
            },
        });

        if (!banka) {
            throw new NotFoundException(`Banka #${id} bulunamadı`);
        }

        // Hesap bakiyelerini ve tip bazlı toplamları hesapla
        let toplamBakiye = new Decimal(0);
        const tipBazliToplam: Record<string, number> = {};

        banka.hesaplar.forEach(hesap => {
            let hesapBakiyesi = hesap.bakiye;

            // Kredi hesabı ise kredilerin toplam geri ödeme tutarını al
            if (hesap.hesapTipi === 'KREDI' && hesap['krediler']) {
                const toplamBorc = hesap['krediler'].reduce((sum: Decimal, k: any) => {
                    return sum.add(k.toplamGeriOdeme || 0);
                }, new Decimal(0));

                // Eğer kredi borcu varsa onu kullan, yoksa bakiyeyi kullan
                if (!toplamBorc.isZero()) {
                    hesapBakiyesi = toplamBorc;
                }
            }

            toplamBakiye = toplamBakiye.add(hesapBakiyesi);

            const tip = hesap.hesapTipi;
            const mevcuTipToplam = tipBazliToplam[tip] ? new Decimal(tipBazliToplam[tip]) : new Decimal(0);
            tipBazliToplam[tip] = mevcuTipToplam.add(hesapBakiyesi).toNumber();
        });

        return {
            ...banka,
            ozet: {
                toplamBakiye: toplamBakiye.toNumber(),
                tipBazliToplam
            }
        };
    }

    async update(id: string, updateBankaDto: UpdateBankaDto) {
        await this.findOne(id); // Verify ownership

        return this.prisma.banka.update({
            where: { id },
            data: updateBankaDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Verify ownership

        // Check if any account of this bank has historical data
        const bankAccounts = await this.prisma.bankaHesabi.findMany({
            where: { bankaId: id },
            select: { id: true }
        });

        const accountIds = bankAccounts.map(a => a.id);

        if (accountIds.length > 0) {
            const [hareketCount, havaleCount, tahsilatCount, maasCount, krediCount] = await Promise.all([
                this.prisma.bankaHesapHareket.count({ where: { hesapId: { in: accountIds } } }),
                this.prisma.bankaHavale.count({ where: { bankaHesabiId: { in: accountIds } } }),
                this.prisma.tahsilat.count({ where: { bankaHesapId: { in: accountIds } } }),
                this.prisma.maasOdemeDetay.count({ where: { bankaHesapId: { in: accountIds } } }),
                this.prisma.bankaKredi.count({ where: { bankaHesapId: { in: accountIds } } }),
            ]);

            if (hareketCount > 0 || havaleCount > 0 || tahsilatCount > 0 || maasCount > 0 || krediCount > 0) {
                throw new BadRequestException('Bu bankaya ait hesaplarda hareket bulunmaktadır, banka silinemez.');
            }
        }

        return this.prisma.banka.delete({
            where: { id },
        });
    }

    // ============ HESAP CRUD ============

    async createAccount(bankaId: string, createHesapDto: CreateBankaHesapDto) {
        await this.findOne(bankaId); // Ensure bank exists and belongs to tenant

        return this.prisma.bankaHesabi.create({
            data: {
                bankaId,
                hesapKodu: createHesapDto.hesapKodu || `ACC-${Date.now()}`,
                hesapAdi: createHesapDto.hesapAdi,
                hesapNo: createHesapDto.hesapNo,
                iban: createHesapDto.iban,
                hesapTipi: createHesapDto.hesapTipi,
                aktif: createHesapDto.aktif ?? true,
                komisyonOrani: createHesapDto.komisyonOrani,
                krediLimiti: createHesapDto.krediLimiti,
                kartLimiti: createHesapDto.kartLimiti,
                hesapKesimGunu: createHesapDto.hesapKesimGunu,
                sonOdemeGunu: createHesapDto.sonOdemeGunu,
            },
        });
    }

    async findAccount(hesapId: string) {
        const hesap = await this.prisma.bankaHesabi.findUnique({
            where: { id: hesapId },
            include: {
                banka: true,
                hareketler: {
                    orderBy: { tarih: 'desc' },
                    take: 100,
                    include: {
                        cari: {
                            select: { id: true, unvan: true, cariKodu: true }
                        }
                    }
                }
            },
        });

        if (!hesap) {
            throw new NotFoundException('Hesap bulunamadı');
        }

        // Verify tenant ownership through bank
        if (!this.tenantContext.isSuperAdmin() && hesap.banka.tenantId !== this.tenantContext.getTenantId()) {
            throw new NotFoundException('Hesap bulunamadı');
        }

        return hesap;
    }

    async updateAccount(hesapId: string, updateHesapDto: UpdateBankaHesapDto) {
        await this.findAccount(hesapId); // Verify ownership

        return this.prisma.bankaHesabi.update({
            where: { id: hesapId },
            data: {
                hesapAdi: updateHesapDto.hesapAdi,
                hesapNo: updateHesapDto.hesapNo,
                iban: updateHesapDto.iban,
                aktif: updateHesapDto.aktif,
                komisyonOrani: updateHesapDto.komisyonOrani,
                krediLimiti: updateHesapDto.krediLimiti,
                kartLimiti: updateHesapDto.kartLimiti,
                hesapKesimGunu: updateHesapDto.hesapKesimGunu,
                sonOdemeGunu: updateHesapDto.sonOdemeGunu,
            },
        });
    }

    async removeAccount(hesapId: string) {
        const hesap = await this.findAccount(hesapId);

        // Check for all types of transactions/relations
        const [hareketCount, havaleCount, tahsilatCount, maasCount, krediCount] = await Promise.all([
            this.prisma.bankaHesapHareket.count({ where: { hesapId } }),
            this.prisma.bankaHavale.count({ where: { bankaHesabiId: hesapId } }),
            this.prisma.tahsilat.count({ where: { bankaHesapId: hesapId } }),
            this.prisma.maasOdemeDetay.count({ where: { bankaHesapId: hesapId } }),
            this.prisma.bankaKredi.count({ where: { bankaHesapId: hesapId } }),
        ]);

        if (hareketCount > 0 || havaleCount > 0 || tahsilatCount > 0 || maasCount > 0 || krediCount > 0) {
            throw new BadRequestException('Bu hesapta hareket bulunmaktadır, silinemez.');
        }

        return this.prisma.bankaHesabi.delete({
            where: { id: hesapId },
        });
    }

    // ============ HAREKET İŞLEMLERİ ============

    async createHareket(hesapId: string, dto: CreateBankaHareketDto) {
        const hesap = await this.findAccount(hesapId);

        // Calculate new balance
        const tutar = new Decimal(dto.tutar);
        const mevcutBakiye = hesap.bakiye;
        const yeniBakiye = dto.hareketTipi === BankaHareketTipi.GELEN
            ? mevcutBakiye.add(tutar)
            : mevcutBakiye.sub(tutar);

        // Create transaction and update balance in a transaction
        const [hareket] = await this.prisma.$transaction([
            this.prisma.bankaHesapHareket.create({
                data: {
                    hesapId,
                    hareketTipi: dto.hareketTipi,
                    hareketAltTipi: dto.hareketAltTipi,
                    tutar: dto.tutar,
                    netTutar: dto.tutar, // No commission for regular transfers
                    bakiye: yeniBakiye,
                    aciklama: dto.aciklama,
                    referansNo: dto.referansNo,
                    cariId: dto.cariId,
                    tarih: dto.tarih ? new Date(dto.tarih) : new Date(),
                },
            }),
            this.prisma.bankaHesabi.update({
                where: { id: hesapId },
                data: { bakiye: yeniBakiye },
            }),
        ]);

        return hareket;
    }

    // POS Tahsilat - Komisyon Hesaplamalı
    async createPosHareket(hesapId: string, dto: CreatePosHareketDto) {
        const hesap = await this.findAccount(hesapId);

        if (hesap.hesapTipi !== 'POS') {
            throw new BadRequestException('Bu işlem sadece POS hesaplarında yapılabilir');
        }

        const komisyonOrani = hesap.komisyonOrani ? Number(hesap.komisyonOrani) : 0;
        const brutTutar = new Decimal(dto.tutar);
        const komisyonTutar = brutTutar.mul(komisyonOrani).div(100);
        const netTutar = brutTutar.sub(komisyonTutar);

        const mevcutBakiye = hesap.bakiye;
        const yeniBakiye = mevcutBakiye.add(netTutar); // Add net amount after commission

        const [hareket] = await this.prisma.$transaction([
            this.prisma.bankaHesapHareket.create({
                data: {
                    hesapId,
                    hareketTipi: BankaHareketTipi.GELEN,
                    hareketAltTipi: BankaHareketAltTipi.POS_TAHSILAT,
                    tutar: dto.tutar,
                    komisyonOrani,
                    komisyonTutar,
                    netTutar,
                    bakiye: yeniBakiye,
                    aciklama: dto.aciklama || `POS Tahsilat - Komisyon: %${komisyonOrani}`,
                    referansNo: dto.referansNo,
                    cariId: dto.cariId,
                    tarih: dto.tarih ? new Date(dto.tarih) : new Date(),
                },
            }),
            this.prisma.bankaHesabi.update({
                where: { id: hesapId },
                data: { bakiye: yeniBakiye },
            }),
        ]);

        return {
            ...hareket,
            hesaplama: {
                brutTutar: Number(brutTutar),
                komisyonOrani,
                komisyonTutar: Number(komisyonTutar),
                netTutar: Number(netTutar),
            }
        };
    }

    // Hesap Hareketleri Listesi
    async getHareketler(hesapId: string, options?: { baslangic?: Date; bitis?: Date; limit?: number }) {
        const hesap = await this.findAccount(hesapId);

        const where: any = { hesapId };
        if (options?.baslangic || options?.bitis) {
            where.tarih = {};
            if (options?.baslangic) where.tarih.gte = options.baslangic;
            if (options?.bitis) where.tarih.lte = options.bitis;
        }

        return this.prisma.bankaHesapHareket.findMany({
            where,
            include: {
                cari: {
                    select: { id: true, unvan: true, cariKodu: true }
                }
            },
            orderBy: { tarih: 'desc' },
            take: options?.limit || 500,
        });
    }

    // Rapor Özeti
    async getHesapOzet(hesapId: string) {
        const hesap = await this.findAccount(hesapId);

        // Calculate totals
        const [gelenToplam, gidenToplam, komisyonToplam] = await Promise.all([
            this.prisma.bankaHesapHareket.aggregate({
                where: { hesapId, hareketTipi: BankaHareketTipi.GELEN },
                _sum: { tutar: true },
            }),
            this.prisma.bankaHesapHareket.aggregate({
                where: { hesapId, hareketTipi: BankaHareketTipi.GIDEN },
                _sum: { tutar: true },
            }),
            this.prisma.bankaHesapHareket.aggregate({
                where: { hesapId, komisyonTutar: { not: null } },
                _sum: { komisyonTutar: true },
            }),
        ]);

        return {
            hesap: {
                id: hesap.id,
                hesapAdi: hesap.hesapAdi,
                hesapTipi: hesap.hesapTipi,
                bakiye: hesap.bakiye,
            },
            banka: hesap.banka,
            ozet: {
                gelenToplam: gelenToplam._sum.tutar || 0,
                gidenToplam: gidenToplam._sum.tutar || 0,
                komisyonToplam: komisyonToplam._sum.komisyonTutar || 0,
            }
        };
    }

    // Tüm bankaların özet bakiyeleri
    async getBankalarOzet() {
        const tenantId = this.tenantContext.getTenantId();

        const bankalar = await this.prisma.banka.findMany({
            where: { tenantId, durum: true },
            select: {
                id: true,
                ad: true,
                sube: true,
                hesaplar: {
                    where: { aktif: true },
                    select: {
                        id: true,
                        hesapAdi: true,
                        hesapKodu: true,
                        hesapNo: true,
                        hesapTipi: true,
                        bakiye: true,
                    }
                }
            }
        });

        // Calculate summary by account type
        let toplamBakiye = new Decimal(0);
        const tipBazliToplam: Record<string, Decimal> = {};

        for (const banka of bankalar) {
            for (const hesap of banka.hesaplar) {
                toplamBakiye = toplamBakiye.add(hesap.bakiye);
                const tip = hesap.hesapTipi;
                tipBazliToplam[tip] = (tipBazliToplam[tip] || new Decimal(0)).add(hesap.bakiye);
            }
        }

        return {
            bankalar,
            ozet: {
                toplamBakiye: Number(toplamBakiye),
                tipBazliToplam: Object.fromEntries(
                    Object.entries(tipBazliToplam).map(([k, v]) => [k, Number(v)])
                ),
            }
        };
    }

    // Tüm banka hesaplarını listele (tenant bazlı)
    async findAllAccounts() {
        const tenantId = this.tenantContext.getTenantId();
        return this.prisma.bankaHesabi.findMany({
            where: {
                banka: {
                    tenantId: tenantId,
                    durum: true
                },
                aktif: true
            },
            include: {
                banka: {
                    select: {
                        id: true,
                        ad: true,
                        sube: true
                    }
                }
            },
            orderBy: {
                hesapAdi: 'asc'
            }
        });
    }

    // ============ KREDİ İŞLEMLERİ ============

    async krediKullan(hesapId: string, dto: CreateKrediKullanimDto) {
        const hesap = await this.findAccount(hesapId);

        if (hesap.hesapTipi !== 'KREDI') {
            throw new BadRequestException('Bu işlem sadece Kredi hesaplarında yapılabilir');
        }

        const tutar = new Decimal(dto.tutar);
        const taksitSayisi = dto.taksitSayisi;
        const kullanimTarihi = new Date(dto.kullanimTarihi);
        const ilkTaksitTarihi = new Date(dto.ilkTaksitTarihi);
        const yillikFaizOrani = new Decimal(dto.yillikFaizOrani);
        const krediTuru = dto.krediTuru;
        const taksitTutari = new Decimal(dto.taksitTutari);

        let planlar: any[] = [];
        let toplamGeriOdeme = new Decimal(0);

        if (krediTuru === KrediTuru.ESIT_TAKSITLI) {
            // Eşit Taksitli: Taksit Tutarı * Vade
            toplamGeriOdeme = taksitTutari.mul(taksitSayisi);

            for (let i = 0; i < taksitSayisi; i++) {
                const vadeTarihi = new Date(ilkTaksitTarihi);
                vadeTarihi.setMonth(vadeTarihi.getMonth() + i);

                planlar.push({
                    taksitNo: i + 1,
                    vadeTarihi: vadeTarihi,
                    tutar: taksitTutari,
                    durum: KrediPlanDurum.BEKLIYOR,
                });
            }

        } else if (krediTuru === KrediTuru.ROTATIF) {
            // Rotatif: Tek ödeme planı (Vade yok, sadece ödeme sıklığı var)
            // Kullanıcı "3 ayda bir" seçerse, 3 ay sonra tek bir ödeme oluşur.
            const odemeSikligi = dto.odemeSikligi || 1; // Ay

            // Tek seferlik ödeme
            toplamGeriOdeme = taksitTutari;

            // Tek bir plan oluştur
            planlar.push({
                taksitNo: 1, // Tek taksit
                vadeTarihi: ilkTaksitTarihi, // Frontend'den hesaplanıp gelen tarih
                tutar: taksitTutari,
                durum: KrediPlanDurum.BEKLIYOR,
            });
        }

        const toplamFaiz = toplamGeriOdeme.minus(tutar);

        // Transaction: Kredi Kaydı + Planlar + Hesap Hareketi + Bakiye Güncelleme
        const [kredi] = await this.prisma.$transaction([
            this.prisma.bankaKredi.create({
                data: {
                    bankaHesapId: hesapId,
                    tutar: tutar,
                    toplamGeriOdeme: toplamGeriOdeme,
                    toplamFaiz: toplamFaiz,
                    krediTuru: krediTuru,
                    yillikFaizOrani: yillikFaizOrani,
                    odemeSikligi: dto.odemeSikligi || 1,
                    taksitSayisi: taksitSayisi, // Vade (Ay)
                    baslangicTarihi: ilkTaksitTarihi,
                    aciklama: dto.aciklama,
                    durum: KrediDurum.AKTIF,
                    planlar: {
                        create: planlar
                    }
                },
                include: { planlar: true }
            }),
            this.prisma.bankaHesapHareket.create({
                data: {
                    hesapId,
                    hareketTipi: BankaHareketTipi.GELEN,
                    hareketAltTipi: BankaHareketAltTipi.KREDI_KULLANIM,
                    tutar: tutar,
                    netTutar: tutar,
                    bakiye: hesap.bakiye.add(tutar),
                    aciklama: `Kredi Kullanımı - ${dto.krediTuru} - %${dto.yillikFaizOrani} Faiz`,
                    tarih: kullanimTarihi,
                }
            }),
            this.prisma.bankaHesabi.update({
                where: { id: hesapId },
                data: {
                    bakiye: { increment: tutar },
                    kullanilanLimit: { increment: tutar },
                }
            })
        ]);

        return kredi;
    }

    async getKrediler(hesapId: string) {
        return this.prisma.bankaKredi.findMany({
            where: { bankaHesapId: hesapId },
            orderBy: { createdAt: 'desc' },
            include: {
                planlar: {
                    orderBy: { taksitNo: 'asc' }
                }
            }
        });
    }

    // Tüm kredileri listele (tenant bazlı)
    async getAllKrediler() {
        const tenantId = this.tenantContext.getTenantId();

        return this.prisma.bankaKredi.findMany({
            where: {
                hesap: {
                    banka: {
                        tenantId: tenantId
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                planlar: {
                    orderBy: { taksitNo: 'asc' }
                },
                hesap: {
                    include: {
                        banka: {
                            select: {
                                id: true,
                                ad: true,
                                sube: true
                            }
                        }
                    }
                }
            }
        });
    }

    async getKrediDetay(krediId: string) {
        const kredi = await this.prisma.bankaKredi.findUnique({
            where: { id: krediId },
            include: {
                planlar: {
                    orderBy: { taksitNo: 'asc' }
                },
                hesap: true
            }
        });

        if (!kredi) {
            throw new NotFoundException('Kredi bulunamadı');
        }

        return kredi;
    }

    private async syncKrediTotals(tx: any, krediId: string) {
        const allPlans = await tx.bankaKrediPlan.findMany({
            where: { krediId }
        });

        const kredi = await tx.bankaKredi.findUnique({
            where: { id: krediId }
        });

        const totalRepayment = allPlans.reduce((sum, p) => sum + Number(p.tutar), 0);
        const totalInterest = totalRepayment - Number(kredi.tutar);

        return tx.bankaKredi.update({
            where: { id: krediId },
            data: {
                toplamGeriOdeme: totalRepayment,
                toplamFaiz: totalInterest
            }
        });
    }

    async addKrediPlan(krediId: string, dto: { tutar: number; vadeTarihi: Date }) {
        return this.prisma.$transaction(async (tx) => {
            const kredi = await tx.bankaKredi.findUnique({
                where: { id: krediId },
                include: { planlar: true }
            });

            if (!kredi) throw new NotFoundException('Kredi bulunamadı');

            const nextTaksitNo = kredi.planlar.length + 1;

            await tx.bankaKrediPlan.create({
                data: {
                    krediId,
                    taksitNo: nextTaksitNo,
                    tutar: dto.tutar,
                    vadeTarihi: dto.vadeTarihi
                }
            });

            await this.syncKrediTotals(tx, krediId);

            return this.getKrediler(kredi.bankaHesapId);
        });
    }

    async deleteKrediPlan(id: string) {
        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.bankaKrediPlan.findUnique({
                where: { id }
            });

            if (!plan) throw new NotFoundException('Plan bulunamadı');

            await tx.bankaKrediPlan.delete({
                where: { id }
            });

            await this.syncKrediTotals(tx, plan.krediId);

            // Taksit numaralarını yeniden düzenle
            const remainingPlans = await tx.bankaKrediPlan.findMany({
                where: { krediId: plan.krediId },
                orderBy: { vadeTarihi: 'asc' }
            });

            for (let i = 0; i < remainingPlans.length; i++) {
                await tx.bankaKrediPlan.update({
                    where: { id: remainingPlans[i].id },
                    data: { taksitNo: i + 1 }
                });
            }

            return { success: true };
        });
    }

    async updateKrediPlan(id: string, dto: { tutar?: number; vadeTarihi?: Date }) {
        return this.prisma.$transaction(async (tx) => {
            const plan = await tx.bankaKrediPlan.findUnique({
                where: { id },
                include: { kredi: true }
            });

            if (!plan) {
                throw new NotFoundException('Kredi planı bulunamadı');
            }

            await tx.bankaKrediPlan.update({
                where: { id },
                data: {
                    tutar: dto.tutar,
                    vadeTarihi: dto.vadeTarihi
                }
            });

            await this.syncKrediTotals(tx, plan.krediId);

            return tx.bankaKredi.findUnique({
                where: { id: plan.krediId },
                include: {
                    planlar: {
                        orderBy: { vadeTarihi: 'asc' }
                    }
                }
            });
        });
    }

    async getYaklasanTaksitler(baslangic: Date, bitis: Date) {
        const tenantId = this.tenantContext.getTenantId();

        return this.prisma.bankaKrediPlan.findMany({
            where: {
                vadeTarihi: {
                    gte: baslangic,
                    lte: bitis,
                },
                durum: {
                    not: 'ODENDI',
                },
                kredi: {
                    hesap: {
                        banka: {
                            tenantId: tenantId,
                        }
                    }
                }
            },
            include: {
                kredi: {
                    include: {
                        hesap: {
                            include: {
                                banka: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                vadeTarihi: 'asc',
            },
        });
    }

    async getUpcomingKrediKartiTarihleri(baslangic: Date, bitis: Date) {
        const tenantId = this.tenantContext.getTenantId();

        const cards = await this.prisma.bankaHesabi.findMany({
            where: {
                banka: {
                    tenantId,
                },
                hesapTipi: 'FIRMA_KREDI_KARTI',
                aktif: true,
            },
            include: {
                banka: true,
            },
        });

        const reminders: any[] = [];

        // Her kart için baslangic ve bitis aralığındaki tarihleri hesapla
        for (const card of cards) {
            if (!card.hesapKesimGunu && !card.sonOdemeGunu) continue;

            const start = new Date(baslangic);
            const end = new Date(bitis);

            // Ay bazında döngü kur (aralık bir ayı geçebilir)
            let current = new Date(start.getFullYear(), start.getMonth(), 1);
            while (current <= end) {
                const year = current.getFullYear();
                const month = current.getMonth();

                // Hesap Kesim Tarihi
                if (card.hesapKesimGunu) {
                    const kesimTarihi = new Date(year, month, card.hesapKesimGunu);
                    // Eğer ay 30 çekiyorsa ve kesim günü 31 ise, ayın son gününe yuvarla
                    if (kesimTarihi.getMonth() !== month) {
                        kesimTarihi.setDate(0);
                    }

                    if (kesimTarihi >= start && kesimTarihi <= end) {
                        reminders.push({
                            id: `${card.id}-kesim-${year}-${month}`,
                            cardId: card.id,
                            bankaAdi: card.banka.ad,
                            hesapAdi: card.hesapAdi,
                            tarih: kesimTarihi,
                            tip: 'HESAP_KESIM',
                            label: 'Hesap Kesim Günü'
                        });
                    }
                }

                // Son Ödeme Tarihi
                if (card.sonOdemeGunu) {
                    const odemeTarihi = new Date(year, month, card.sonOdemeGunu);
                    if (odemeTarihi.getMonth() !== month) {
                        odemeTarihi.setDate(0);
                    }

                    if (odemeTarihi >= start && odemeTarihi <= end) {
                        reminders.push({
                            id: `${card.id}-odeme-${year}-${month}`,
                            cardId: card.id,
                            bankaAdi: card.banka.ad,
                            hesapAdi: card.hesapAdi,
                            tarih: odemeTarihi,
                            tip: 'SON_ODEME',
                            label: 'Son Ödeme Tarihi'
                        });
                    }
                }

                current.setMonth(current.getMonth() + 1);
            }
        }

        return reminders.sort((a, b) => a.tarih.getTime() - b.tarih.getTime());
    }

    async payInstallment(planId: string, dto: PayCreditInstallmentDto) {
        const tenantId = this.tenantContext.getTenantId();

        console.log('[payInstallment] Starting payment for plan:', planId, 'tenant:', tenantId);

        return this.prisma.$transaction(async (tx) => {
            // 1. Taksit planını bul
            console.log('[payInstallment] Querying for plan:', planId);
            const plan = await tx.bankaKrediPlan.findUnique({
                where: { id: planId },
                include: {
                    kredi: {
                        include: {
                            hesap: {
                                include: {
                                    banka: true
                                }
                            }
                        }
                    }
                }
            });

            console.log('[payInstallment] Plan found:', !!plan);
            if (plan) {
                console.log('[payInstallment] Plan details:', {
                    id: plan.id,
                    taksitNo: plan.taksitNo,
                    hasKredi: !!plan.kredi,
                    hasHesap: !!plan.kredi?.hesap,
                    hasBanka: !!plan.kredi?.hesap?.banka,
                    bankaTenantId: plan.kredi?.hesap?.banka?.tenantId
                });
            }

            if (!plan) {
                throw new NotFoundException('Kredi taksiti bulunamadı');
            }

            // Tenant kontrolü (sadece tenant ID varsa)
            if (tenantId && plan.kredi.hesap.banka.tenantId !== tenantId) {
                throw new NotFoundException('Kredi taksiti bulunamadı');
            }

            // Kalan tutar kontrolü
            const kalanTutar = new Decimal(plan.tutar).sub(plan.odenen);
            if (kalanTutar.lessThanOrEqualTo(0)) {
                throw new BadRequestException('Bu taksit zaten ödenmiş');
            }

            if (new Decimal(dto.tutar).greaterThan(kalanTutar)) {
                throw new BadRequestException(`Ödeme tutarı kalan tutardan (${kalanTutar.toFixed(2)} TL) fazla olamaz`);
            }

            const odemeTarihi = dto.odemeTarihi ? new Date(dto.odemeTarihi) : new Date();

            // 2. Ödeme tipine göre işlem yap
            if (dto.odemeTipi === OdemeTipi.BANKA_HAVALESI) {
                if (!dto.bankaHesapId) {
                    throw new BadRequestException('Banka hesabı seçilmelidir');
                }

                // Banka hesabını kontrol et
                const hesap = await tx.bankaHesabi.findUnique({
                    where: { id: dto.bankaHesapId },
                    include: { banka: true }
                });

                if (!hesap || hesap.banka.tenantId !== tenantId) {
                    throw new NotFoundException('Banka hesabı bulunamadı');
                }

                // Bakiye kontrolü
                if (new Decimal(hesap.bakiye).lessThan(dto.tutar)) {
                    throw new BadRequestException('Banka hesabında yeterli bakiye yok');
                }

                // Banka hesap hareketi oluştur
                const yeniBakiye = new Decimal(hesap.bakiye).sub(dto.tutar);
                await tx.bankaHesapHareket.create({
                    data: {
                        hesapId: dto.bankaHesapId,
                        hareketTipi: BankaHareketTipi.GIDEN,
                        hareketAltTipi: BankaHareketAltTipi.KREDI_TAKSIT_ODEME,
                        tutar: new Decimal(dto.tutar),
                        bakiye: yeniBakiye,
                        aciklama: dto.aciklama || `Kredi Taksit Ödemesi - Taksit #${plan.taksitNo}`,
                        referansNo: planId,
                        tarih: odemeTarihi,
                    }
                });

                // Banka hesabı bakiyesini güncelle
                await tx.bankaHesabi.update({
                    where: { id: dto.bankaHesapId },
                    data: { bakiye: yeniBakiye }
                });

            } else if (dto.odemeTipi === OdemeTipi.NAKIT) {
                if (!dto.kasaId) {
                    throw new BadRequestException('Kasa seçilmelidir');
                }

                // Kasayı kontrol et
                const kasa = await tx.kasa.findUnique({
                    where: { id: dto.kasaId }
                });

                if (!kasa || kasa.tenantId !== tenantId) {
                    throw new NotFoundException('Kasa bulunamadı');
                }

                // Bakiye kontrolü
                if (new Decimal(kasa.bakiye).lessThan(dto.tutar)) {
                    throw new BadRequestException('Kasada yeterli bakiye yok');
                }

                // Kasa hareketi oluştur
                const yeniBakiye = new Decimal(kasa.bakiye).sub(dto.tutar);
                await tx.kasaHareket.create({
                    data: {
                        kasaId: dto.kasaId,
                        hareketTipi: 'ODEME',
                        tutar: new Decimal(dto.tutar),
                        bakiye: yeniBakiye,
                        aciklama: dto.aciklama || `Kredi Taksit Ödemesi - Taksit #${plan.taksitNo}`,
                        tarih: odemeTarihi,
                    }
                });

                // Kasa bakiyesini güncelle
                await tx.kasa.update({
                    where: { id: dto.kasaId },
                    data: { bakiye: yeniBakiye }
                });

            } else if (dto.odemeTipi === OdemeTipi.ELDEN) {
                // Elden ödeme - sadece taksit güncellenir, bakiye hareketi olmaz
            }

            // 3. Taksit planını güncelle
            const yeniOdenen = new Decimal(plan.odenen).add(dto.tutar);
            const tamOdendi = yeniOdenen.greaterThanOrEqualTo(plan.tutar);

            await tx.bankaKrediPlan.update({
                where: { id: planId },
                data: {
                    odenen: yeniOdenen,
                    durum: tamOdendi ? KrediPlanDurum.ODENDI : KrediPlanDurum.KISMI_ODENDI
                }
            });

            // 4. Ana kredi kaydını senkronize et
            await this.syncKrediTotals(tx, plan.krediId);

            // 5. Güncellenmiş krediyi döndür
            return tx.bankaKredi.findUnique({
                where: { id: plan.krediId },
                include: {
                    planlar: {
                        orderBy: { vadeTarihi: 'asc' }
                    }
                }
            });
        });
    }
}
