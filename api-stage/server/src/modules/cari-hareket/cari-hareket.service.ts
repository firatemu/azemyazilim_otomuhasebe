import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCariHareketDto, EkstreQueryDto } from './dto';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CariHareketService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateCariHareketDto) {
    // Cari'nin mevcut bakiyesini al
    const cari = await this.prisma.cari.findUnique({
      where: { id: dto.cariId },
    });

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    // Yeni bakiyeyi hesapla
    let yeniBakiye = Number(cari.bakiye);

    if (dto.tip === 'BORC') {
      yeniBakiye += Number(dto.tutar);
    } else if (dto.tip === 'ALACAK') {
      yeniBakiye -= Number(dto.tutar);
    } else if (dto.tip === 'DEVIR') {
      yeniBakiye = Number(dto.tutar);
    }

    // Transaction ile hem hareket hem cari bakiyesi güncelle
    const hareket = await this.prisma.$transaction(async (tx) => {
      // Hareket kaydı oluştur
      const yeniHareket = await tx.cariHareket.create({
        data: {
          cariId: dto.cariId,
          tip: dto.tip,
          tutar: new Prisma.Decimal(dto.tutar),
          bakiye: new Prisma.Decimal(yeniBakiye),
          belgeTipi: dto.belgeTipi,
          belgeNo: dto.belgeNo,
          tarih: dto.tarih ? new Date(dto.tarih) : new Date(),
          aciklama: dto.aciklama,
        },
        include: {
          cari: true,
        },
      });

      // Cari bakiyesini güncelle
      await tx.cari.update({
        where: { id: dto.cariId },
        data: { bakiye: new Prisma.Decimal(yeniBakiye) },
      });

      return yeniHareket;
    });

    return hareket;
  }

  async findAll(cariId: string, skip = 0, take = 100) {
    const [hareketler, total] = await Promise.all([
      this.prisma.cariHareket.findMany({
        where: { cariId },
        include: { cari: true },
        orderBy: { tarih: 'desc' },
        skip,
        take,
      }),
      this.prisma.cariHareket.count({ where: { cariId } }),
    ]);

    return { data: hareketler, total };
  }

  async getEkstre(query: EkstreQueryDto) {
    const where: any = { cariId: query.cariId };

    if (query.baslangicTarihi || query.bitisTarihi) {
      where.tarih = {};
      if (query.baslangicTarihi) {
        where.tarih.gte = new Date(query.baslangicTarihi);
      }
      if (query.bitisTarihi) {
        where.tarih.lte = new Date(query.bitisTarihi);
      }
    }

    const [cari, hareketler] = await Promise.all([
      this.prisma.cari.findUnique({
        where: { id: query.cariId },
      }),
      this.prisma.cariHareket.findMany({
        where,
        orderBy: { tarih: 'asc' },
      }),
    ]);

    return {
      cari,
      hareketler,
    };
  }

  async exportExcel(query: EkstreQueryDto): Promise<Buffer> {
    const { cari, hareketler } = await this.getEkstre(query);

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    // Tenant ve Ayarlarını al
    const tenantSettings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId: cari.tenantId || '' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cari Hesap Ekstresi');

    // Corporate Header
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = tenantSettings?.companyName || 'OTOMUHASEBE ERP';
    worksheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FF1F2937' } };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = 'CARİ HESAP EKSTRESİ';
    worksheet.getCell('A2').font = { size: 18, bold: true, color: { argb: 'FF527575' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Info Section
    worksheet.getCell('A4').value = 'Cari Ünvan:';
    worksheet.getCell('B4').value = cari.unvan;
    worksheet.getCell('A4').font = { bold: true };

    worksheet.getCell('A5').value = 'Cari Kodu:';
    worksheet.getCell('B5').value = cari.cariKodu;
    worksheet.getCell('A5').font = { bold: true };

    worksheet.getCell('D4').value = 'Tarih:';
    worksheet.getCell('E4').value = new Date().toLocaleDateString('tr-TR');
    worksheet.getCell('D4').font = { bold: true };

    if (cari.vergiNo) {
      worksheet.getCell('A6').value = 'V.D. / V.N.:';
      worksheet.getCell('B6').value = `${cari.vergiDairesi} / ${cari.vergiNo}`;
      worksheet.getCell('A6').font = { bold: true };
    }

    // Summary Section
    const toplamBorc = hareketler
      .filter((h) => h.tip === 'BORC')
      .reduce((sum, h) => sum + Number(h.tutar), 0);
    const toplamAlacak = hareketler
      .filter((h) => h.tip === 'ALACAK')
      .reduce((sum, h) => sum + Number(h.tutar), 0);

    worksheet.getCell('A8').value = 'TOPLAM BORÇ';
    worksheet.getCell('B8').value = toplamBorc;
    worksheet.getCell('B8').numFmt = '#,##0.00 ₺';
    worksheet.getCell('B8').font = { bold: true, color: { argb: 'FFEF4444' } };

    worksheet.getCell('C8').value = 'TOPLAM ALACAK';
    worksheet.getCell('D8').value = toplamAlacak;
    worksheet.getCell('D8').numFmt = '#,##0.00 ₺';
    worksheet.getCell('D8').font = { bold: true, color: { argb: 'FF10B981' } };

    worksheet.getCell('E8').value = 'NET BAKİYE';
    worksheet.getCell('F8').value = Number(cari.bakiye);
    worksheet.getCell('F8').numFmt = '#,##0.00 ₺';
    worksheet.getCell('F8').font = { bold: true };

    // Tablo başlıkları
    const headerRow = worksheet.addRow([]); // Boşluk
    const dataHeaderRow = worksheet.addRow([
      'Tarih',
      'Belge No',
      'Açıklama',
      'Borç',
      'Alacak',
      'Bakiye',
    ]);

    dataHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    dataHeaderRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF527575' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Veriler
    hareketler.forEach((hareket, index) => {
      const row = worksheet.addRow([
        new Date(hareket.tarih).toLocaleDateString('tr-TR'),
        hareket.belgeNo || '-',
        hareket.aciklama,
        hareket.tip === 'BORC' ? Number(hareket.tutar) : null,
        hareket.tip === 'ALACAK' ? Number(hareket.tutar) : null,
        Number(hareket.bakiye),
      ]);

      row.eachCell((cell, colNumber) => {
        if (colNumber >= 4) {
          cell.numFmt = '#,##0.00 ₺';
        }
        cell.alignment = { vertical: 'middle' };
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });

      // Renkli tutarlar
      if (hareket.tip === 'BORC') row.getCell(4).font = { color: { argb: 'FFEF4444' } };
      if (hareket.tip === 'ALACAK') row.getCell(5).font = { color: { argb: 'FF10B981' } };
      row.getCell(6).font = { bold: true };
    });

    // Sütun genişlikleri
    worksheet.columns = [
      { width: 15 }, // Tarih
      { width: 15 }, // Belge No
      { width: 50 }, // Açıklama
      { width: 15 }, // Borç
      { width: 15 }, // Alacak
      { width: 15 }, // Bakiye
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportPdf(query: EkstreQueryDto): Promise<Buffer> {
    const { cari, hareketler } = await this.getEkstre(query);

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    // Tenant ve Ayarlarını al
    const tenantSettings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId: cari.tenantId || '' },
    });

    let logoBase64: string | null = null;
    if (tenantSettings?.logoUrl) {
      try {
        if (tenantSettings.logoUrl.startsWith('/api/uploads/')) {
          // Local file resolution
          const fileName = tenantSettings.logoUrl.replace('/api/uploads/', '');
          const filePath = path.join(process.cwd(), 'uploads', fileName);
          if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            const ext = path.extname(fileName).toLowerCase().replace('.', '');
            logoBase64 = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buffer.toString('base64')}`;
          }
        } else if (tenantSettings.logoUrl.startsWith('data:image')) {
          logoBase64 = tenantSettings.logoUrl;
        } else {
          // Remote file resolution
          const response = await axios.get(tenantSettings.logoUrl, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data, 'binary');
          const ext = path.extname(tenantSettings.logoUrl).toLowerCase().replace('.', '') || 'png';
          logoBase64 = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buffer.toString('base64')}`;
        }
      } catch (error) {
        console.error('Logo yüklenirken hata oluştu:', error);
      }
    }

    const vfs = require('pdfmake/build/vfs_fonts.js');
    const fonts = {
      Roboto: {
        normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
        bold: Buffer.from(
          vfs['Roboto-Medium.ttf'] || vfs['Roboto-Regular.ttf'],
          'base64',
        ),
        italics: Buffer.from(
          vfs['Roboto-Italic.ttf'] || vfs['Roboto-Regular.ttf'],
          'base64',
        ),
      },
    };

    const printer = new PdfPrinter(fonts);

    // Summary Calculations
    const totalBorc = hareketler
      .filter((h) => h.tip === 'BORC')
      .reduce((sum, h) => sum + Number(h.tutar), 0);
    const totalAlacak = hareketler
      .filter((h) => h.tip === 'ALACAK')
      .reduce((sum, h) => sum + Number(h.tutar), 0);
    const netBakiye = Number(cari.bakiye);

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 140, 40, 60], // Top margin increased for header
      header: {
        margin: [40, 20, 40, 0],
        columns: [
          // Logo & Company Info
          {
            width: '*',
            stack: [
              logoBase64
                ? {
                  image: logoBase64,
                  width: 120,
                  margin: [0, 0, 0, 10],
                }
                : { text: '' },
              {
                text: tenantSettings?.companyName || 'OTOMUHASEBE ERP',
                style: 'companyName',
              },
              {
                text: [
                  tenantSettings?.address || '',
                  tenantSettings?.district ? ` ${tenantSettings.district}` : '',
                  tenantSettings?.city ? ` / ${tenantSettings.city}` : '',
                  '\n',
                  tenantSettings?.phone ? `Tel: ${tenantSettings.phone}` : '',
                  tenantSettings?.email ? ` | E-posta: ${tenantSettings.email}` : '',
                  tenantSettings?.website ? ` | Web: ${tenantSettings.website}` : '',
                  '\n',
                  tenantSettings?.taxOffice ? `V.Dairesi: ${tenantSettings.taxOffice}` : '',
                  tenantSettings?.taxNumber ? ` | Vergi No: ${tenantSettings.taxNumber}` : '',
                  tenantSettings?.tcNo ? ` | T.C. No: ${tenantSettings.tcNo}` : '',
                ].filter(Boolean).join(''),
                style: 'companyAddress',
              },
            ],
          },
          // Document Title & Date
          {
            width: 'auto',
            stack: [
              { text: 'CARİ HESAP EKSTRESİ', style: 'docTitle', alignment: 'right' },
              {
                text: `Tarih: ${new Date().toLocaleDateString('tr-TR')}`,
                style: 'docDate',
                alignment: 'right',
              },
              {
                text: `Sayfa: 1`, // Dynamic page number handled by footer usually
                style: 'docDate',
                alignment: 'right',
                margin: [0, 5, 0, 0]
              }
            ],
          },
        ],
      },
      content: [
        // Customer Info Box
        {
          style: 'customerBox',
          table: {
            widths: ['auto', '*', 'auto', 'auto'],
            body: [
              [
                { text: 'SAYIN:', style: 'labelBold', border: [false, false, false, false] },
                { text: cari.unvan, style: 'customerName', border: [false, false, false, false] },
                { text: 'CARİ KODU:', style: 'labelBold', border: [false, false, false, false] },
                { text: cari.cariKodu, style: 'value', border: [false, false, false, false] },
              ],
              [
                { text: 'VERGİ NO:', style: 'labelBold', border: [false, false, false, false] },
                {
                  text: cari.vergiNo ? `${cari.vergiDairesi} / ${cari.vergiNo}` : '',
                  style: 'value',
                  border: [false, false, false, false]
                },
                { text: 'BAKİYE:', style: 'labelBold', border: [false, false, false, false] },
                {
                  text: `${Math.abs(netBakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL (${netBakiye < 0 ? 'A' : netBakiye > 0 ? 'B' : '-'})`,
                  style: netBakiye < 0 ? 'valueSuccess' : netBakiye > 0 ? 'valueDanger' : 'value',
                  border: [false, false, false, false]
                }
              ],
            ],
          },
          layout: 'noBorders',
        },

        // Summary Table
        {
          style: 'summaryTable',
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'TOPLAM BORÇ', style: 'summaryHeader', alignment: 'center', fillColor: '#fef2f2' },
                { text: 'TOPLAM ALACAK', style: 'summaryHeader', alignment: 'center', fillColor: '#f0fdf4' },
                { text: 'NET BAKİYE', style: 'summaryHeader', alignment: 'center', fillColor: '#f3f4f6' },
              ],
              [
                { text: `${totalBorc.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValueDanger', alignment: 'center' },
                { text: `${totalAlacak.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValueSuccess', alignment: 'center' },
                { text: `${Math.abs(netBakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL ${netBakiye < 0 ? '(A)' : netBakiye > 0 ? '(B)' : ''}`, style: 'summaryValueBold', alignment: 'center' },
              ],
            ],
          },
          layout: {
            hLineWidth: (i: number) => (i === 0 || i === 2) ? 1 : 0,
            vLineWidth: (i: number) => (i === 0 || i === 3) ? 1 : 1,
            hLineColor: (i: number) => '#e5e7eb',
            vLineColor: (i: number) => '#e5e7eb',
          }
        },

        // Transactions Table
        {
          style: 'transactionTable',
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'TARİH', style: 'tableHeader' },
                { text: 'BELGE NO', style: 'tableHeader' },
                { text: 'AÇIKLAMA', style: 'tableHeader' },
                { text: 'BORÇ', style: 'tableHeader', alignment: 'right' },
                { text: 'ALACAK', style: 'tableHeader', alignment: 'right' },
                { text: 'BAKİYE', style: 'tableHeader', alignment: 'right' },
              ],
              ...hareketler.map((h, index) => [
                { text: new Date(h.tarih).toLocaleDateString('tr-TR'), style: 'tableCell' },
                { text: h.belgeNo || '-', style: 'tableCell' },
                { text: h.aciklama, style: 'tableCell' },
                {
                  text: h.tip === 'BORC' ? Number(h.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '',
                  style: 'tableCellDanger',
                  alignment: 'right',
                },
                {
                  text: h.tip === 'ALACAK' ? Number(h.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '',
                  style: 'tableCellSuccess',
                  alignment: 'right',
                },
                {
                  text: Number(h.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
                  style: 'tableCellBold',
                  alignment: 'right'
                },
              ]),
            ],
          },
          layout: {
            fillColor: (rowIndex: number) => {
              return (rowIndex > 0 && rowIndex % 2 === 0) ? '#f9fafb' : null;
            },
            hLineWidth: (i: number, node: any) => {
              return (i === 0 || i === node.table.body.length) ? 1 : 1;
            },
            vLineWidth: (i: number, node: any) => {
              return (i === 0 || i === node.table.widths.length) ? 1 : 1;
            },
            hLineColor: (i: number) => '#e5e7eb',
            vLineColor: (i: number) => '#e5e7eb',
          }
        } as any,
      ],
      footer: (currentPage: number, pageCount: number) => {
        return {
          text: `Sayfa ${currentPage} / ${pageCount}`,
          alignment: 'center',
          fontSize: 8,
          color: '#6b7280',
          margin: [0, 10, 0, 0],
        };
      },
      styles: {
        companyName: {
          fontSize: 16,
          bold: true,
          color: '#111827',
          margin: [0, 0, 0, 2],
        },
        companyAddress: {
          fontSize: 8,
          color: '#4b5563',
          lineHeight: 1.2,
        },
        docTitle: {
          fontSize: 18,
          bold: true,
          color: '#527575', // Corporate Color
          margin: [0, 0, 0, 2],
        },
        docDate: {
          fontSize: 9,
          color: '#6b7280',
        },
        customerBox: {
          margin: [0, 0, 0, 20],
        },
        labelBold: {
          fontSize: 8,
          bold: true,
          color: '#6b7280',
          margin: [0, 2, 0, 2],
        },
        customerName: {
          fontSize: 10,
          bold: true,
          color: '#111827',
          margin: [0, 2, 0, 2],
        },
        value: {
          fontSize: 9,
          color: '#111827',
          margin: [0, 2, 0, 2],
        },
        valueSuccess: {
          fontSize: 9,
          bold: true,
          color: '#059669',
          margin: [0, 2, 0, 2],
        },
        valueDanger: {
          fontSize: 9,
          bold: true,
          color: '#dc2626',
          margin: [0, 2, 0, 2],
        },
        summaryTable: {
          margin: [0, 0, 0, 20],
        },
        summaryHeader: {
          fontSize: 8,
          bold: true,
          color: '#374151',
          margin: [0, 5, 0, 5],
        },
        summaryValueSuccess: {
          fontSize: 10,
          bold: true,
          color: '#059669',
          margin: [0, 5, 0, 5],
        },
        summaryValueDanger: {
          fontSize: 10,
          bold: true,
          color: '#dc2626',
          margin: [0, 5, 0, 5],
        },
        summaryValueBold: {
          fontSize: 10,
          bold: true,
          color: '#111827',
          margin: [0, 5, 0, 5],
        },
        transactionTable: {
          margin: [0, 0, 0, 0],
        },
        tableHeader: {
          fontSize: 8,
          bold: true,
          color: '#ffffff',
          fillColor: '#527575', // Corporate Header
          margin: [0, 5, 0, 5],
        },
        tableCell: {
          fontSize: 8,
          color: '#374151',
          margin: [0, 5, 0, 5],
        },
        tableCellBold: {
          fontSize: 8,
          bold: true,
          color: '#111827',
          margin: [0, 5, 0, 5],
        },
        tableCellSuccess: {
          fontSize: 8,
          color: '#059669',
          margin: [0, 5, 0, 5],
        },
        tableCellDanger: {
          fontSize: 8,
          color: '#dc2626',
          margin: [0, 5, 0, 5],
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);

        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async delete(id: string) {
    // Hareket kaydını sil ve cari bakiyesini güncelle
    const hareket = await this.prisma.cariHareket.findUnique({
      where: { id },
    });

    if (!hareket) {
      throw new NotFoundException('Hareket kaydı bulunamadı');
    }

    // Cari'nin mevcut bakiyesini al
    const cari = await this.prisma.cari.findUnique({
      where: { id: hareket.cariId },
    });

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    // Bakiyeyi tersine çevir
    let yeniBakiye = Number(cari.bakiye);

    if (hareket.tip === 'BORC') {
      yeniBakiye -= Number(hareket.tutar);
    } else if (hareket.tip === 'ALACAK') {
      yeniBakiye += Number(hareket.tutar);
    }

    // Transaction ile sil ve güncelle
    await this.prisma.$transaction(async (tx) => {
      await tx.cariHareket.delete({
        where: { id },
      });

      await tx.cari.update({
        where: { id: hareket.cariId },
        data: { bakiye: new Prisma.Decimal(yeniBakiye) },
      });
    });

    return { message: 'Hareket kaydı silindi ve bakiye güncellendi' };
  }
}
