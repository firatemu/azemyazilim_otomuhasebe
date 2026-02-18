import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateBordroDto } from './dto/create-bordro.dto';
import { BordroTipi, CekSenetDurum } from '@prisma/client';
import { ClsService } from '../../common/services/cls.service';
import { CekSenetService } from './cek-senet.service';

@Injectable()
export class BordroService {
    constructor(
        private prisma: PrismaService,
        private cekSenetService: CekSenetService
    ) { }

    async findAll() {
        return this.prisma.bordro.findMany({
            orderBy: { tarih: 'desc' },
            include: {
                cari: { select: { unvan: true } },
                _count: { select: { cekSenetler: true } }
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.bordro.findUnique({
            where: { id },
            include: {
                cari: true,
                cekSenetler: true,
            }
        });
    }

    async create(dto: CreateBordroDto, userId: string) {
        const tenantId = ClsService.getTenantId();

        return this.prisma.$transaction(async (tx) => {
            // 1. Create Bordro
            const bordro = await tx.bordro.create({
                data: {
                    bordroNo: dto.bordroNo,
                    tip: dto.tip,
                    tarih: new Date(dto.tarih),
                    cariId: dto.cariId,
                    bankaHesabiId: dto.bankaHesabiId,
                    aciklama: dto.aciklama,
                    tenantId: tenantId!,
                    createdById: userId,
                }
            });

            // 2. Handle Logic based on Bordro Type
            switch (dto.tip) {
                case BordroTipi.MUSTERI_EVRAK_GIRISI:
                    if (dto.yeniCekler && dto.yeniCekler.length > 0) {
                        for (const cekDto of dto.yeniCekler) {
                            // Çek oluştur (Service içindeki create tx dışı olabilir, o yüzden tx.cekSenet kullanıyoruz veya service'i tx'e uyumlu yapıyoruz)
                            // Şimdilik service'i tx'e geçiremiyoruz kolayca, manuel create:
                            const cek = await tx.cekSenet.create({
                                data: {
                                    tip: cekDto.tip,
                                    portfoyTip: 'ALACAK',
                                    cariId: dto.cariId!,
                                    tutar: cekDto.tutar,
                                    kalanTutar: cekDto.tutar, // Initialize kalanTutar
                                    vade: new Date(cekDto.vadeTarihi),
                                    banka: cekDto.banka,
                                    sube: cekDto.sube,
                                    hesapNo: cekDto.hesapNo,
                                    cekNo: cekDto.evrakNo,
                                    durum: CekSenetDurum.PORTFOYDE,
                                    aciklama: cekDto.aciklama,
                                    tenantId: tenantId!,
                                    createdBy: userId,
                                    sonBordroId: bordro.id,
                                }
                            });

                            // Cari Alacak Kaydı
                            if (dto.cariId) {
                                const cari = await tx.cari.findUnique({ where: { id: dto.cariId } });
                                const yeniBakiye = Number(cari?.bakiye || 0) - Number(cekDto.tutar);
                                await tx.cariHareket.create({
                                    data: {
                                        cariId: dto.cariId,
                                        tip: 'ALACAK',
                                        tutar: cekDto.tutar,
                                        bakiye: yeniBakiye,
                                        aciklama: `Çek Girişi - ${cekDto.evrakNo} - Bordro: ${bordro.bordroNo}`,
                                        tarih: new Date(dto.tarih),
                                        belgeNo: bordro.bordroNo,
                                        belgeTipi: 'CEK_GIRIS',
                                    }
                                });
                                await tx.cari.update({ where: { id: dto.cariId }, data: { bakiye: yeniBakiye } });
                            }
                        }
                    }
                    break;

                case BordroTipi.BANKA_TAHSIL_CIROSU:
                case BordroTipi.BANKA_TEMINAT_CIROSU:
                    const yeniDurum = dto.tip === BordroTipi.BANKA_TAHSIL_CIROSU ? CekSenetDurum.BANKA_TAHSILDE : CekSenetDurum.BANKA_TEMINATTA;
                    if (dto.secilenCekIdleri && dto.secilenCekIdleri.length > 0) {
                        for (const cekId of dto.secilenCekIdleri) {
                            const cek = await tx.cekSenet.findUnique({ where: { id: cekId } });
                            if (!cek || cek.durum !== CekSenetDurum.PORTFOYDE) {
                                throw new BadRequestException(`Evrak portföyde bulunamadı: ${cek?.cekNo || cekId}`);
                            }
                            await tx.cekSenet.update({
                                where: { id: cekId },
                                data: { durum: yeniDurum, sonBordroId: bordro.id }
                            });
                            await tx.cekSenetLog.create({
                                data: {
                                    cekSenetId: cekId,
                                    actionType: 'UPDATE',
                                    changes: JSON.stringify({ yeniDurum, bordroId: bordro.id }),
                                    userId
                                }
                            });
                        }
                    }
                    break;

                case BordroTipi.CARIYE_EVRAK_CIROSU:
                    if (dto.secilenCekIdleri && dto.secilenCekIdleri.length > 0) {
                        for (const cekId of dto.secilenCekIdleri) {
                            const cek = await tx.cekSenet.findUnique({ where: { id: cekId } });
                            if (!cek || cek.durum !== CekSenetDurum.PORTFOYDE) {
                                throw new BadRequestException(`Evrak portföyde bulunamadı: ${cek?.cekNo || cekId}`);
                            }
                            await tx.cekSenet.update({
                                where: { id: cekId },
                                data: { durum: CekSenetDurum.CIRO_EDILDI, sonBordroId: bordro.id }
                            });

                            // Cari Borç Kaydı (Biz çeki verdik, cari bizden alacaklı duruma geçer ama hareket BORÇ olarak kaydedilir - yani bakiyemiz artar)
                            if (dto.cariId) {
                                const cari = await tx.cari.findUnique({ where: { id: dto.cariId } });
                                const yeniBakiye = Number(cari?.bakiye || 0) + Number(cek.tutar);
                                await tx.cariHareket.create({
                                    data: {
                                        cariId: dto.cariId,
                                        tip: 'BORC',
                                        tutar: cek.tutar,
                                        bakiye: yeniBakiye,
                                        aciklama: `Çek Cirosu - ${cek.cekNo} - Bordro: ${bordro.bordroNo}`,
                                        tarih: new Date(dto.tarih),
                                        belgeNo: bordro.bordroNo,
                                        belgeTipi: 'CEK_CIKIS',
                                    }
                                });
                                await tx.cari.update({ where: { id: dto.cariId }, data: { bakiye: yeniBakiye } });
                            }
                        }
                    }
                    break;

                case BordroTipi.BORC_EVRAK_CIKISI:
                    // Kendi çekimizi veriyoruz
                    if (dto.yeniCekler && dto.yeniCekler.length > 0) {
                        for (const cekDto of dto.yeniCekler) {
                            await tx.cekSenet.create({
                                data: {
                                    tip: cekDto.tip,
                                    portfoyTip: 'BORC',
                                    cariId: dto.cariId!,
                                    tutar: cekDto.tutar,
                                    kalanTutar: 0, // Borç senedi genelde ödendi olarak çıkılır veya takibi yapılır
                                    vade: new Date(cekDto.vadeTarihi),
                                    banka: cekDto.banka,
                                    sube: cekDto.sube,
                                    hesapNo: cekDto.hesapNo,
                                    cekNo: cekDto.evrakNo,
                                    durum: CekSenetDurum.ODENDI, // Kendi çekimiz verildiği an borçluyuz
                                    aciklama: cekDto.aciklama,
                                    tenantId: tenantId!,
                                    createdBy: userId,
                                    sonBordroId: bordro.id,
                                }
                            });

                            if (dto.cariId) {
                                const cari = await tx.cari.findUnique({ where: { id: dto.cariId } });
                                const yeniBakiye = Number(cari?.bakiye || 0) + Number(cekDto.tutar);
                                await tx.cariHareket.create({
                                    data: {
                                        cariId: dto.cariId,
                                        tip: 'BORC',
                                        tutar: cekDto.tutar,
                                        bakiye: yeniBakiye,
                                        aciklama: `Kendi Çekimiz - ${cekDto.evrakNo} - Bordro: ${bordro.bordroNo}`,
                                        tarih: new Date(dto.tarih),
                                        belgeNo: bordro.bordroNo,
                                        belgeTipi: 'CEK_CIKIS',
                                    }
                                });
                                await tx.cari.update({ where: { id: dto.cariId }, data: { bakiye: yeniBakiye } });
                            }
                        }
                    }
                    break;

                case BordroTipi.IADE_BORDROSU:
                    if (dto.secilenCekIdleri && dto.secilenCekIdleri.length > 0) {
                        for (const cekId of dto.secilenCekIdleri) {
                            const cek = await tx.cekSenet.findUnique({ where: { id: cekId } });
                            if (!cek) continue;

                            // İade mantığı: Eğer evrak ciro edildiyse PORTFOY'e geri döner
                            // Eğer evrak portföydeyse (yanlış giriş) iptal/iade (Cari Bakiyeyi geri düzelt)

                            const eskiDurum = cek.durum;
                            await tx.cekSenet.update({
                                where: { id: cekId },
                                data: { durum: CekSenetDurum.IADE_EDILDI, sonBordroId: bordro.id }
                            });

                            if (dto.cariId) {
                                const cari = await tx.cari.findUnique({ where: { id: dto.cariId } });
                                // İade tipine göre bakiye yönü değişir. 
                                // Şimdilik basitleştirilmiş: İade evrakı cariyi geri alacaklandırır veya borçlandırır.
                                // Genelde iade edilen evrak cari bakiyesini ilk işlemin tersi yönde etkiler.
                                // Müşteri çeki iade ediliyorsa: Cari Borçlanır (+).
                                const tipDirection = cek.portfoyTip === 'ALACAK' ? 1 : -1;
                                const yeniBakiye = Number(cari?.bakiye || 0) + (Number(cek.tutar) * tipDirection);

                                await tx.cariHareket.create({
                                    data: {
                                        cariId: dto.cariId,
                                        tip: tipDirection === 1 ? 'BORC' : 'ALACAK',
                                        tutar: cek.tutar,
                                        bakiye: yeniBakiye,
                                        aciklama: `Evrak İadesi - ${cek.cekNo} - Bordro: ${bordro.bordroNo}`,
                                        tarih: new Date(dto.tarih),
                                        belgeNo: bordro.bordroNo,
                                        belgeTipi: 'IADE',
                                    }
                                });
                                await tx.cari.update({ where: { id: dto.cariId }, data: { bakiye: yeniBakiye } });
                            }
                        }
                    }
                    break;
            }

            return bordro;
        });
    }
}
