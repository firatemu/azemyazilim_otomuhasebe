import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CreateMaasOdemeDto } from './dto/create-maas-odeme.dto';
import { MaasDurum, OdemeTipi } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { SystemParameterService } from '../system-parameter/system-parameter.service';
import { sayiyiYaziyaCevir } from '../../common/utils/number-to-text.util';
const PdfPrinter = require('pdfmake');

@Injectable()
export class MaasOdemeService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
        private systemParameterService: SystemParameterService,
    ) { }

    /**
     * Maaş ödemesi oluştur (çoklu ödeme yöntemi desteği)
     */
    async createOdeme(createDto: CreateMaasOdemeDto, userId: string) {
        // Parametre kontrolü
        const allowNegativeBalance = await this.systemParameterService.getParameterAsBoolean('ALLOW_NEGATIVE_CASH_BALANCE', false);

        // Plan kontrolü
        const plan = await this.prisma.maasPlani.findUnique({
            where: { id: createDto.planId },
            include: {
                personel: true,
            },
        });

        if (!plan) {
            throw new NotFoundException('Maaş planı bulunamadı');
        }

        if (!plan.personel.aktif) {
            throw new BadRequestException('Pasif personele ödeme yapılamaz');
        }

        // Ödeme tutarı kontrolü
        if (createDto.tutar > Number(plan.kalanTutar)) {
            throw new BadRequestException(
                `Ödeme tutarı kalan tutardan (${plan.kalanTutar}) fazla olamaz`,
            );
        }

        // Ödeme detayları toplam kontrolü
        const detayToplam = createDto.odemeDetaylari.reduce(
            (sum, detay) => sum + detay.tutar,
            0,
        );

        if (Math.abs(detayToplam - createDto.tutar) > 0.01) {
            throw new BadRequestException(
                `Ödeme detayları toplamı (${detayToplam}) ödeme tutarı (${createDto.tutar}) ile eşleşmiyor`,
            );
        }

        // Ödeme detayları validasyonu
        for (const detay of createDto.odemeDetaylari) {
            if (detay.odemeTipi === 'NAKIT' && !detay.kasaId) {
                throw new BadRequestException('Nakit ödeme için kasa seçilmelidir');
            }
            if (detay.odemeTipi === 'BANKA_HAVALESI' && !detay.bankaHesapId) {
                throw new BadRequestException(
                    'Banka havalesi için banka hesabı seçilmelidir',
                );
            }

            // Kasa/Banka hesap kontrolü
            if (detay.kasaId) {
                const kasa = await this.prisma.kasa.findUnique({
                    where: { id: detay.kasaId },
                });
                if (!kasa || !kasa.aktif) {
                    throw new NotFoundException('Geçerli bir kasa bulunamadı');
                }
            }

            if (detay.bankaHesapId) {
                const bankaHesap = await this.prisma.bankaHesabi.findUnique({
                    where: { id: detay.bankaHesapId },
                });
                if (!bankaHesap || !bankaHesap.aktif) {
                    throw new NotFoundException('Geçerli bir banka hesabı bulunamadı');
                }
            }
        }

        // Transaction ile ödeme oluştur
        return this.prisma.$transaction(async (prisma) => {
            const tarih = createDto.tarih ? new Date(createDto.tarih) : new Date();

            // 1. Ödeme kaydı oluştur
            const odeme = await prisma.maasOdeme.create({
                data: {
                    planId: createDto.planId,
                    personelId: createDto.personelId,
                    tutar: createDto.tutar,
                    tarih,
                    aciklama: createDto.aciklama,
                    createdBy: userId,
                },
            });

            // 2. Ödeme detaylarını oluştur ve kasa/banka bakiyelerini güncelle
            for (const detay of createDto.odemeDetaylari) {
                await prisma.maasOdemeDetay.create({
                    data: {
                        odemeId: odeme.id,
                        odemeTipi: detay.odemeTipi as OdemeTipi,
                        tutar: detay.tutar,
                        kasaId: detay.kasaId || null,
                        bankaHesapId: detay.bankaHesapId || null,
                        referansNo: detay.referansNo || null,
                        aciklama: detay.aciklama || null,
                    },
                });

                // Kasa bakiyesini güncelle
                if (detay.kasaId) {
                    const kasa = await prisma.kasa.findUnique({
                        where: { id: detay.kasaId },
                    });

                    if (kasa) {
                        const yeniKasaBakiye = Number(kasa.bakiye) - detay.tutar;

                        // Negatif bakiye kontrolü
                        if (!allowNegativeBalance && yeniKasaBakiye < 0) {
                            throw new BadRequestException(
                                `${kasa.kasaAdi} kasasında yeterli bakiye yok! Mevcut: ${kasa.bakiye}, İstenen: ${detay.tutar} (Negatif bakiye izni kapalı)`,
                            );
                        }

                        await prisma.kasa.update({
                            where: { id: detay.kasaId },
                            data: { bakiye: yeniKasaBakiye },
                        });
                    }
                }

                // Banka hesap bakiyesini güncelle
                if (detay.bankaHesapId) {
                    const bankaHesap = await prisma.bankaHesabi.findUnique({
                        where: { id: detay.bankaHesapId },
                    });

                    if (bankaHesap) {
                        const yeniBakiye = Number(bankaHesap.bakiye) - detay.tutar;

                        if (yeniBakiye < 0) {
                            throw new BadRequestException(
                                `${bankaHesap.hesapAdi} hesabında yeterli bakiye yok`,
                            );
                        }

                        await prisma.bankaHesabi.update({
                            where: { id: detay.bankaHesapId },
                            data: { bakiye: yeniBakiye },
                        });
                    }
                }
            }

            // 3. Plan durumunu güncelle
            const yeniOdenenTutar = Number(plan.odenenTutar) + createDto.tutar;
            const yeniKalanTutar = Number(plan.toplam) - yeniOdenenTutar;

            let yeniDurum: MaasDurum;
            if (yeniKalanTutar <= 0.01) {
                yeniDurum = MaasDurum.TAMAMEN_ODENDI;
            } else if (yeniOdenenTutar > 0) {
                yeniDurum = MaasDurum.KISMI_ODENDI;
            } else {
                yeniDurum = MaasDurum.ODENMEDI;
            }

            await prisma.maasPlani.update({
                where: { id: createDto.planId },
                data: {
                    odenenTutar: yeniOdenenTutar,
                    kalanTutar: yeniKalanTutar,
                    durum: yeniDurum,
                },
            });

            // Ödemeyi detaylarıyla birlikte getir
            return prisma.maasOdeme.findUnique({
                where: { id: odeme.id },
                include: {
                    plan: {
                        include: {
                            personel: {
                                select: {
                                    id: true,
                                    ad: true,
                                    soyad: true,
                                    personelKodu: true,
                                },
                            },
                        },
                    },
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
            });
        });
    }

    /**
     * Plana ait ödemeleri getir
     */
    async getOdemelerByPlan(planId: string) {
        return this.prisma.maasOdeme.findMany({
            where: { planId },
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
        });
    }

    /**
     * Personelin yıllık ödemelerini getir
     */
    async getOdemelerByPersonel(personelId: string, yil: number) {
        return this.prisma.maasOdeme.findMany({
            where: {
                personelId,
                plan: {
                    yil,
                },
            },
            include: {
                plan: {
                    select: {
                        yil: true,
                        ay: true,
                        toplam: true,
                    },
                },
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
        });
    }

    /**
     * Excel Raporu Oluştur (Maaş Listesi)
     */
    async exportExcel(yil: number, ay: number) {
        const planlar = await this.prisma.maasPlani.findMany({
            where: { yil, ay },
            include: {
                personel: true,
            },
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${ay}-${yil} Maaş Listesi`);

        worksheet.columns = [
            { header: 'Personel Kodu', key: 'kodu', width: 15 },
            { header: 'Ad Soyad', key: 'adsoyad', width: 25 },
            { header: 'Dönem', key: 'donem', width: 15 },
            { header: 'Maaş', key: 'maas', width: 15 },
            { header: 'Prim', key: 'prim', width: 15 },
            { header: 'Toplam', key: 'toplam', width: 15 },
            { header: 'Ödenen', key: 'odenen', width: 15 },
            { header: 'Kalan', key: 'kalan', width: 15 },
            { header: 'Durum', key: 'durum', width: 15 },
        ];

        planlar.forEach((p) => {
            worksheet.addRow({
                kodu: p.personel.personelKodu,
                adsoyad: `${p.personel.ad} ${p.personel.soyad}`,
                donem: `${p.ay}/${p.yil}`,
                maas: Number(p.maas),
                prim: Number(p.prim),
                toplam: Number(p.toplam),
                odenen: Number(p.odenenTutar),
                kalan: Number(p.kalanTutar),
                durum: p.durum,
            });
        });

        // Stil (Başlıklar bold)
        worksheet.getRow(1).font = { bold: true };

        return workbook;
    }

    /**
     * Ödeme Makbuzu Oluştur (PDF)
     * Basit bir metin tabanlı PDF oluşturur
     */
    async generateMakbuz(odemeId: string) {
        const odeme = await this.prisma.maasOdeme.findUnique({
            where: { id: odemeId },
            include: {
                personel: true,
                plan: true,
                odemeDetaylari: {
                    include: {
                        kasa: true,
                        bankaHesap: true,
                    },
                },
                tenant: {
                    include: {
                        settings: true,
                    },
                },
            },
        });

        if (!odeme) throw new NotFoundException('Ödeme bulunamadı');

        // PDF font tanımlamaları (vfs_fonts kullanarak Türkçe karakter desteği)
        const vfs = require('pdfmake/build/vfs_fonts.js');
        const fonts = {
            Roboto: {
                normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
                bold: Buffer.from(vfs['Roboto-Medium.ttf'] || vfs['Roboto-Regular.ttf'], 'base64'),
                italics: Buffer.from(vfs['Roboto-Italic.ttf'] || vfs['Roboto-Regular.ttf'], 'base64'),
                bolditalics: Buffer.from(vfs['Roboto-MediumItalic.ttf'] || vfs['Roboto-Regular.ttf'], 'base64'),
            },
        };

        const printer = new (PdfPrinter as any)(fonts);

        const companyName = odeme.tenant?.settings?.companyName || odeme.tenant?.name || 'OTOMUHASEBE';
        const companyAddress = odeme.tenant?.settings?.address || '';
        const companyCity = odeme.tenant?.settings?.city || '';
        const companyTax = odeme.tenant?.settings?.taxNumber ? `VKN: ${odeme.tenant.settings.taxNumber}` : '';
        const companyPhone = odeme.tenant?.settings?.['phone'] || '';

        const amountInWords = sayiyiYaziyaCevir(Number(odeme.tutar));

        const docDefinition: any = {
            pageSize: 'A4',
            pageMargins: [30, 30, 30, 30],
            content: [
                // Header / Şirket Bilgileri (Premium bradning)
                {
                    columns: [
                        {
                            stack: [
                                { text: companyName, style: 'companyHeader' },
                                { text: companyAddress, style: 'companyDetail' },
                                { text: `${companyCity} ${companyPhone}`, style: 'companyDetail' },
                                { text: companyTax, style: 'companyDetail' },
                            ],
                            width: '*'
                        },
                        {
                            stack: [
                                { text: 'MAAŞ ÖDEME MAKBUZU', style: 'documentTitle', alignment: 'right' },
                                { text: `Belge Tarihi: ${new Date(odeme.tarih).toLocaleDateString('tr-TR')}`, alignment: 'right', margin: [0, 2, 0, 0], fontSize: 10 },
                                { text: `Referans: ${odeme.id.substring(0, 8).toUpperCase()}`, alignment: 'right', fontSize: 9, color: '#999' },
                            ],
                            width: '*'
                        }
                    ]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 535, y2: 10, lineWidth: 0.5, lineColor: '#cbd5e1' }], margin: [0, 5, 0, 15] },

                // Summary Net Pay (Highlighted Box)
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: 'NET ÖDEME TUTARI', alignment: 'center', fontSize: 9, color: '#64748b', bold: true },
                                        { text: `₺ ${Number(odeme.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, alignment: 'center', fontSize: 22, bold: true, color: '#0f172a', margin: [0, 2, 0, 2] },
                                        { text: `Yalnızca: ${amountInWords}`, alignment: 'center', fontSize: 9, italic: true, color: '#475569' }
                                    ],
                                    fillColor: '#f8fafc',
                                    padding: [10, 10, 10, 10]
                                }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: () => 1,
                        vLineWidth: () => 1,
                        hLineColor: () => '#e2e8f0',
                        vLineColor: () => '#e2e8f0',
                    },
                    margin: [0, 0, 0, 15]
                },

                // Sections (Boxed Payer & Payee)
                {
                    columns: [
                        {
                            stack: [
                                { text: 'KURUM / ÖDEMEYİ YAPAN', style: 'sectionHeader' },
                                {
                                    table: {
                                        widths: ['*'],
                                        body: [
                                            [{
                                                stack: [
                                                    { text: companyName, style: 'sectionContentBold' },
                                                    { text: companyTax, style: 'sectionContentSmall' }
                                                ],
                                                padding: [10, 8, 10, 8]
                                            }]
                                        ]
                                    },
                                    layout: {
                                        hLineWidth: () => 0.5,
                                        vLineWidth: () => 0.5,
                                        hLineColor: () => '#cbd5e1',
                                        vLineColor: () => '#cbd5e1',
                                    }
                                }
                            ],
                            width: '*'
                        },
                        { width: 10, text: '' },
                        {
                            stack: [
                                { text: 'PERSONEL / ÖDEME YAPILAN', style: 'sectionHeader' },
                                {
                                    table: {
                                        widths: ['*'],
                                        body: [
                                            [{
                                                stack: [
                                                    { text: `${odeme.personel.ad} ${odeme.personel.soyad}`, style: 'sectionContentBold' },
                                                    { text: `TCKN: ${odeme.personel.tcKimlikNo || '-'}`, style: 'sectionContentSmall' },
                                                    { text: `Kod: ${odeme.personel.personelKodu || '-'}`, style: 'sectionContentSmall' }
                                                ],
                                                padding: [10, 8, 10, 8]
                                            }]
                                        ]
                                    },
                                    layout: {
                                        hLineWidth: () => 0.5,
                                        vLineWidth: () => 0.5,
                                        hLineColor: () => '#cbd5e1',
                                        vLineColor: () => '#cbd5e1',
                                    }
                                }
                            ],
                            width: '*'
                        }
                    ],
                    margin: [0, 0, 0, 15]
                },

                // Details (Dönem ve Açıklama)
                {
                    table: {
                        widths: [100, '*'],
                        body: [
                            [
                                { text: 'Hizmet Dönemi:', style: 'infoLabel' },
                                { text: `${odeme.plan.ay}/${odeme.plan.yil} / Maaş Hakedişi`, style: 'infoValue' }
                            ],
                            [
                                { text: 'Ödeme Açıklaması:', style: 'infoLabel' },
                                { text: odeme.aciklama || `${odeme.plan.ay} / ${odeme.plan.yil} dönemi hak edilen maaş ödemesi personelin hesabına aktarılmıştır.`, style: 'infoValue' }
                            ]
                        ]
                    },
                    layout: 'noBorders',
                    margin: [0, 0, 0, 15]
                },

                // Payment Breakdown Table
                { text: 'ÖDEME KALEMLERİ VE KAYNAKLARI', style: 'sectionHeader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', 'auto'],
                        body: [
                            [
                                { text: 'İŞLEM TİPİ', style: 'tableHeader' },
                                { text: 'KAYNAK HESAP', style: 'tableHeader' },
                                { text: 'TUTAR', style: 'tableHeader', alignment: 'right' }
                            ],
                            ...odeme.odemeDetaylari.map((d, index) => [
                                { text: d.odemeTipi === 'NAKIT' ? 'Nakden Ödeme' : 'Banka Transferi', style: 'tableRow', fillColor: index % 2 === 0 ? '#f8fafc' : null },
                                { text: d.kasa ? `Merkez Kasa: ${d.kasa.kasaAdi}` : (d.bankaHesap ? `Banka: ${d.bankaHesap.hesapAdi}` : '-'), style: 'tableRow', fillColor: index % 2 === 0 ? '#f8fafc' : null },
                                { text: `₺ ${Number(d.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, style: 'tableRow', alignment: 'right', bold: true, fillColor: index % 2 === 0 ? '#f8fafc' : null }
                            ])
                        ]
                    },
                    layout: {
                        hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
                        vLineWidth: () => 0,
                        hLineColor: (i) => (i === 0 || i === 1) ? '#64748b' : '#e2e8f0',
                        paddingTop: () => 8,
                        paddingBottom: () => 8,
                    }
                },

                // Signature Footer
                {
                    columns: [
                        {
                            stack: [
                                { text: 'TESLİM EDEN (ŞİRKET YETKİLİSİ)', style: 'signatureTitle' },
                                { canvas: [{ type: 'rect', x: 20, y: 10, w: 120, h: 50, r: 2, lineColor: '#e2e8f0' }], margin: [0, 5] },
                                { text: 'İmza / Kaşe', style: 'signatureSubtitle' }
                            ],
                            alignment: 'center'
                        },
                        {
                            stack: [
                                { text: 'TESLİM ALAN (PERSONEL)', style: 'signatureTitle' },
                                { canvas: [{ type: 'rect', x: 20, y: 10, w: 120, h: 50, r: 2, lineColor: '#e2e8f0' }], margin: [0, 5] },
                                { text: `${odeme.personel.ad} ${odeme.personel.soyad}\nİmza`, style: 'signatureSubtitle' }
                            ],
                            alignment: 'center'
                        }
                    ],
                    margin: [0, 20, 0, 0]
                },

                // Legal Note
                {
                    text: 'İşbu makbuz, personelin hak ettiği maaş ödemesinin yapıldığına dair düzenlenmiştir. Elektronik kayıtlar esastır.',
                    style: 'legalNote',
                    margin: [0, 40, 0, 0]
                }
            ],
            styles: {
                companyHeader: { fontSize: 13, bold: true, color: '#1e293b' },
                companyDetail: { fontSize: 8, color: '#64748b' },
                documentTitle: { fontSize: 15, bold: true, color: '#0f172a' },
                sectionHeader: { fontSize: 9, bold: true, color: '#475569', margin: [0, 10, 0, 4] },
                sectionContentBold: { fontSize: 10, bold: true, color: '#1e293b' },
                sectionContentSmall: { fontSize: 9, color: '#64748b' },
                infoLabel: { fontSize: 9, color: '#64748b' },
                infoValue: { fontSize: 9, bold: true, color: '#1e293b' },
                tableHeader: { fontSize: 9, bold: true, color: '#f8fafc', fillColor: '#334155', margin: [0, 4, 0, 4] },
                tableRow: { fontSize: 9, color: '#334155' },
                signatureTitle: { fontSize: 9, bold: true, color: '#475569' },
                signatureSubtitle: { fontSize: 8, color: '#94a3b8' },
                legalNote: { fontSize: 7, color: '#94a3b8', alignment: 'center' }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        return pdfDoc;
    }
}
