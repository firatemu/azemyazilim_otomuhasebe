import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCekSenetDto, UpdateCekSenetDto } from './dto/create-cek-senet.dto';
import { CekSenetIslemDto } from './dto/cek-senet-islem.dto';
import { CekSenetTip, CekSenetDurum } from '@prisma/client';
import { ClsService } from '../../common/services/cls.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';

@Injectable()
export class CekSenetService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
    ) { }

    async findAll(query: any) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const { durum, tip, borclu, vadeBaslangic, vadeBitis } = query;
        const where: any = {
            ...buildTenantWhereClause(tenantId ?? undefined),
            deletedAt: null,
        };

        if (durum) where.durum = durum;
        if (tip) where.tip = tip;
        if (borclu) where.cari = { unvan: { contains: borclu, mode: 'insensitive' as const } };
        if (vadeBaslangic || vadeBitis) {
            where.vade = {};
            if (vadeBaslangic) where.vade.gte = new Date(vadeBaslangic);
            if (vadeBitis) where.vade.lte = new Date(vadeBitis);
        }

        return this.prisma.extended.cekSenet.findMany({
            where,
            orderBy: { vade: 'asc' },
            include: {
                cari: { select: { unvan: true } },
            },
        });
    }

    async findOne(id: string) {
        const cekSenet = await this.prisma.extended.cekSenet.findFirst({
            where: { id, deletedAt: null },
            include: {
                logs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                cari: true
            }
        });

        if (!cekSenet) throw new NotFoundException('Çek/Senet bulunamadı');
        return cekSenet;
    }

    // Tekil çek oluşturma (Genelde Giriş Bordrosu içinde kullanılır)
    async create(dto: CreateCekSenetDto, bordroId?: string) {
        return this.prisma.extended.cekSenet.create({
            data: {
                tip: dto.tip,
                portfoyTip: 'ALACAK', // Default
                cariId: bordroId || '', // Requires cariId
                tutar: dto.tutar,
                vade: new Date(dto.vadeTarihi),
                banka: dto.banka,
                sube: dto.sube,
                hesapNo: dto.hesapNo,
                cekNo: dto.evrakNo, // Use evrakNo as cekNo
                durum: CekSenetDurum.PORTFOYDE,
                aciklama: dto.aciklama,
            }
        });
    }

    async update(id: string, dto: UpdateCekSenetDto, userId?: string) {
        const data: any = {};
        if (dto.evrakNo !== undefined) data.cekNo = dto.evrakNo;
        if (dto.vadeTarihi !== undefined) data.vade = new Date(dto.vadeTarihi);
        if (dto.banka !== undefined) data.banka = dto.banka;
        if (dto.sube !== undefined) data.sube = dto.sube;
        if (dto.hesapNo !== undefined) data.hesapNo = dto.hesapNo;
        if (dto.aciklama !== undefined) data.aciklama = dto.aciklama;
        if (userId) data.updatedBy = userId;
        return this.prisma.extended.cekSenet.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, userId: string) {
        const cek = await this.prisma.extended.cekSenet.findUnique({
            where: { id },
            include: { cari: { select: { unvan: true } } },
        });
        if (!cek) throw new NotFoundException('Çek/Senet bulunamadı');
        if (cek.deletedAt) throw new BadRequestException('Evrak zaten silinmiş');
        const cariUnvan = (cek.cari as any)?.unvan?.trim() || 'Bilinmeyen';
        await this.prisma.extended.$transaction([
            this.prisma.extended.deletedCekSenet.create({
                data: {
                    originalId: cek.id,
                    tip: cek.tip,
                    portfoyTip: cek.portfoyTip,
                    cariId: cek.cariId,
                    cariUnvan,
                    tutar: cek.tutar,
                    vade: cek.vade,
                    banka: cek.banka,
                    sube: cek.sube,
                    hesapNo: cek.hesapNo,
                    cekNo: cek.cekNo,
                    seriNo: cek.seriNo,
                    durum: cek.durum ?? CekSenetDurum.PORTFOYDE,
                    tahsilTarihi: cek.tahsilTarihi,
                    tahsilKasaId: cek.tahsilKasaId,
                    ciroEdildi: cek.ciroEdildi,
                    ciroTarihi: cek.ciroTarihi,
                    ciroEdilen: cek.ciroEdilen,
                    aciklama: cek.aciklama,
                    originalCreatedBy: cek.createdBy,
                    originalUpdatedBy: cek.updatedBy,
                    originalCreatedAt: cek.createdAt,
                    originalUpdatedAt: cek.updatedAt,
                    deletedBy: userId,
                },
            }),
            this.prisma.extended.cekSenet.update({
                where: { id },
                data: { deletedAt: new Date(), deletedBy: userId },
            }),
        ]);
        return { success: true };
    }

    // Durum Değiştirme ve Kısmi Tahsilat İşlemi
    async islemYap(dto: CekSenetIslemDto, userId: string) {
        const cek = await this.findOne(dto.cekSenetId);
        const tenantId = ClsService.getTenantId();

        // 1. Durum Kontrolü
        // Örneğin: Tahsil edilmiş bir çeki tekrar tahsil edemeyiz
        if (cek.durum === CekSenetDurum.TAHSIL_EDILDI && dto.yeniDurum === CekSenetDurum.TAHSIL_EDILDI) {
            throw new BadRequestException('Bu çek zaten tamamen tahsil edilmiş.');
        }

        // 2. Kısmi Tahsilat Mantığı
        let yeniKalanTutar = Number(cek.kalanTutar);
        let islemTipi = 'DURUM_DEGISIKLIGI';

        if (dto.islemTutari > 0 && (dto.yeniDurum === CekSenetDurum.TAHSIL_EDILDI || dto.yeniDurum === CekSenetDurum.PORTFOYDE)) {
            // Tahsilat işlemi (Kısmi veya Tam)
            if (dto.islemTutari > yeniKalanTutar) {
                throw new BadRequestException('İşlem tutarı kalan tutardan büyük olamaz.');
            }

            yeniKalanTutar -= dto.islemTutari;
            islemTipi = yeniKalanTutar === 0 ? 'TAHSIL' : 'KISMI_TAHSIL';

            if (yeniKalanTutar > 0) {
                dto.yeniDurum = CekSenetDurum.PORTFOYDE;
            } else {
                dto.yeniDurum = CekSenetDurum.TAHSIL_EDILDI;
            }
        } else {
            islemTipi = dto.yeniDurum || 'UPDATE';
        }

        // 3. Finansal Entegrasyon (Kasa/Banka)
        let bankaIslemId: string | null = null;
        let kasaIslemId: string | null = null;

        if (dto.islemTutari > 0) {
            if (dto.kasaId) {
                // Kasaya Giriş
                const description = `${cek.cekNo || cek.seriNo} nolu Çek Tahsilatı (${islemTipi})`;
                const kasaHareket = await this.prisma.extended.kasaHareket.create({
                    data: {
                        kasaId: dto.kasaId,
                        hareketTipi: 'TAHSILAT',
                        tutar: dto.islemTutari,
                        bakiye: 0, // Trigger/Service hesaplar
                        netTutar: dto.islemTutari,
                        aciklama: description,
                        belgeNo: cek.cekNo || cek.seriNo,
                        belgeTipi: 'CEK_TAHSILAT',
                        cariId: cek.cariId,
                        createdBy: userId,
                    }
                });
                // Kasa bakiye güncelleme servisi normalde burada çağrılır
                // Şimdilik basitçe bırakıyoruz veya KasaService kullanılır
                kasaIslemId = kasaHareket.id;
            } else if (dto.bankaHesapId) {
                // Bankaya Giriş
                const description = `${cek.cekNo || cek.seriNo} nolu Çek Tahsilatı (${islemTipi})`;
                const bankaHareket = await this.prisma.extended.bankaHesapHareket.create({
                    data: {
                        hesapId: dto.bankaHesapId,
                        hareketTipi: 'GELEN',
                        tutar: dto.islemTutari,
                        bakiye: 0, // Trigger/Service hesaplar
                        aciklama: description,
                        referansNo: cek.cekNo || cek.seriNo,
                        cariId: cek.cariId,
                    }
                });
                bankaIslemId = bankaHareket.id;
            }
        }

        // 4. Update Çek ve Create Log
        const [updatedCek, log] = await this.prisma.extended.$transaction([
            this.prisma.extended.cekSenet.update({
                where: { id: dto.cekSenetId },
                data: {
                    durum: dto.yeniDurum,
                    kalanTutar: yeniKalanTutar,
                }
            }),
            this.prisma.extended.cekSenetLog.create({
                data: {
                    cekSenetId: dto.cekSenetId,
                    actionType: 'UPDATE',
                    changes: JSON.stringify({
                        islemTipi,
                        yeniDurum: dto.yeniDurum,
                        tutar: dto.islemTutari,
                        tarih: dto.tarih,
                        aciklama: dto.aciklama,
                        kasaIslemId,
                        bankaIslemId,
                    }),
                    userId,
                }
            })
        ]);

        return updatedCek;
    }

    async getYaklasanCekler(baslangic: Date, bitis: Date) {
        return this.prisma.extended.cekSenet.findMany({
            where: {
                deletedAt: null,
                vade: {
                    gte: baslangic,
                    lte: bitis,
                },
                durum: {
                    in: [
                        CekSenetDurum.PORTFOYDE,
                        CekSenetDurum.BANKA_TAHSILDE,
                        CekSenetDurum.BANKA_TEMINATTA,
                    ],
                },
                kalanTutar: {
                    gt: 0,
                },
            },
            include: {
                cari: true,
            },
            orderBy: {
                vade: 'asc',
            },
        });
    }
}

