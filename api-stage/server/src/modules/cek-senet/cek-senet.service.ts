import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCekSenetDto, UpdateCekSenetDto } from './dto/create-cek-senet.dto';
import { CekSenetIslemDto } from './dto/cek-senet-islem.dto';
import { CekSenetTip, CekSenetDurum } from '@prisma/client';
import { ClsService } from '../../common/services/cls.service';

@Injectable()
export class CekSenetService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: any) {
        const { durum, tip, borclu, vadeBaslangic, vadeBitis } = query;
        const where: any = {};

        if (durum) where.durum = durum;
        if (tip) where.tip = tip;
        if (borclu) where.borclu = { contains: borclu, mode: 'insensitive' };
        if (vadeBaslangic || vadeBitis) {
            where.vade = {};
            if (vadeBaslangic) where.vade.gte = new Date(vadeBaslangic);
            if (vadeBitis) where.vade.lte = new Date(vadeBitis);
        }

        return this.prisma.cekSenet.findMany({
            where,
            orderBy: { vade: 'asc' },
            include: {
                // sonBordro: { include: { cari: true } } // Relation does not exist
            }
        });
    }

    async findOne(id: string) {
        const cekSenet = await this.prisma.cekSenet.findUnique({
            where: { id },
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
        const tenantId = ClsService.getTenantId();

        return this.prisma.cekSenet.create({
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
                tenantId: tenantId!,
            }
        });
    }

    async update(id: string, dto: UpdateCekSenetDto) {
        return this.prisma.cekSenet.update({
            where: { id },
            data: dto
        });
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
                const kasaHareket = await this.prisma.kasaHareket.create({
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
                const bankaHareket = await this.prisma.bankaHesapHareket.create({
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
        const [updatedCek, log] = await this.prisma.$transaction([
            this.prisma.cekSenet.update({
                where: { id: dto.cekSenetId },
                data: {
                    durum: dto.yeniDurum,
                    kalanTutar: yeniKalanTutar,
                }
            }),
            this.prisma.cekSenetLog.create({
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
        const tenantId = ClsService.getTenantId();

        return this.prisma.cekSenet.findMany({
            where: {
                tenantId: tenantId!,
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

