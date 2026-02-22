import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CreateCariDto, UpdateCariDto } from './dto';
import { CodeTemplateService } from '../code-template/code-template.service';
import { DeletionProtectionService } from '../../common/services/deletion-protection.service';
import * as ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CariService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
    private deletionProtection: DeletionProtectionService,
  ) { }

  async create(dto: CreateCariDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({ allowNull: true });

    // Eğer cariKodu girilmemişse veya boşsa otomatik üret
    let cariKodu = dto.cariKodu?.trim();
    if (!cariKodu || cariKodu.length === 0) {
      try {
        cariKodu = await this.codeTemplateService.getNextCode('CUSTOMER');
      } catch (error) {
        throw new BadRequestException(
          'Cari kodu girilmeli veya otomatik kod şablonu tanımlanmalı',
        );
      }
    }

    // unvan kontrolü (frontend'de de kontrol ediliyor ama backend'de de kontrol et)
    if (!dto.unvan || !dto.unvan.trim()) {
      throw new BadRequestException('Ünvan boş olamaz');
    }

    // tip verilmezse varsayılan olarak MUSTERI atanır
    const tip = dto.tip || 'MUSTERI';

    const finalTenantId = (dto as any).tenantId ?? tenantId ?? undefined;

    // Check uniqueness within tenant
    const existingWhere: any = { cariKodu };
    if (finalTenantId) existingWhere.tenantId = finalTenantId;
    const existing = await this.prisma.cari.findFirst({
      where: existingWhere,
    });
    if (existing) {
      throw new BadRequestException('Bu cari kodu zaten kullanılıyor');
    }

    const { yetkililer, ekAdresler, tedarikciBankalar, ...rest } = dto;

    // DEBUG LOG
    console.log('Cari Create DTO satisElemaniId:', dto.satisElemaniId, 'Type:', typeof dto.satisElemaniId);

    const finalData = { ...rest, cariKodu, tip, tenantId: finalTenantId, satisElemaniId: (dto.satisElemaniId && dto.satisElemaniId.trim() !== '') ? dto.satisElemaniId : null };

    // DEBUG LOG
    console.log('Cari Create Final Data satisElemaniId:', finalData.satisElemaniId);

    return this.prisma.cari.create({
      data: {
        ...finalData,
        yetkililer: yetkililer?.length ? { create: yetkililer } : undefined,
        ekAdresler: ekAdresler?.length ? { create: ekAdresler } : undefined,
        tedarikciBankalar: tedarikciBankalar?.length ? { create: tedarikciBankalar } : undefined,
      },
    });
  }

  async findAll(page = 1, limit = 50, search?: string, tip?: string, aktif?: boolean) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (aktif !== undefined) where.aktif = aktif;

    if (search) {
      where.OR = [
        { cariKodu: { contains: search, mode: 'insensitive' } },
        { unvan: { contains: search, mode: 'insensitive' } },
        { vergiNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tip) {
      where.tip = tip;
    }

    const [cariler, total] = await Promise.all([
      this.prisma.cari.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          satisElemani: {
            select: {
              adSoyad: true,
            },
          },
          _count: {
            select: {
              cariHareketler: true,
            },
          },
        },
      }),
      this.prisma.cari.count({ where }),
    ]);

    // Add hareketSayisi field for frontend
    const data = cariler.map((cari) => ({
      ...cari,
      hareketSayisi: cari._count.cariHareketler,
      _count: undefined, // Remove _count from response
    }));

    return {
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDebtCreditReport(query: any) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const { search, tip, satisElemaniId, durum, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;

    if (satisElemaniId) {
      where.satisElemaniId = satisElemaniId;
    }

    if (durum) {
      if (durum === 'BORC') {
        where.bakiye = { lt: 0 };
      } else if (durum === 'ALACAK') {
        where.bakiye = { gt: 0 };
      } else if (durum === 'SIFIR') {
        where.bakiye = 0;
      }
    }

    if (search) {
      where.OR = [
        { cariKodu: { contains: search, mode: 'insensitive' } },
        { unvan: { contains: search, mode: 'insensitive' } },
        { vergiNo: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tip) {
      where.tip = tip;
    }

    // Prisma doesn't support direct filtering on calculated fields like 'bakiye' easily without raw query or post-processing.
    // For scalability, we'll fetch ID/Balance via aggregation or use a raw query if performance dictates.
    // However, given the current schema storing 'bakiye' as a string/decimal on Cari might be optimal, 
    // but usually it's calculated. Let's assume 'bakiye' is stored or we calculate it. 
    // The previous 'findAll' didn't show 'bakiye' field on Cari model.
    // Let's check schema.prisma first to be sure about 'bakiye' field existence.
    // If 'bakiye' exists on Cari table, we can filter directly.

    // For now, I will proceed assuming I need to fetch and calculate or that 'bakiye' is available.
    // Wait, I recall seeing 'bakiye' in the frontend code: cari.bakiye. 
    // Let's assume it's a Decimal field on Cari model.


    const [cariler, total] = await Promise.all([
      this.prisma.cari.findMany({
        where,
        skip,
        take: limit,
        orderBy: { bakiye: 'desc' }, // Order by balance usually makes sense for this report
        select: {
          id: true,
          cariKodu: true,
          unvan: true,
          tip: true,
          bakiye: true,
          satisElemani: {
            select: {
              adSoyad: true,
            },
          },
        }
      }),
      this.prisma.cari.count({ where }),
    ]);

    // Calculate Summary Cards Data (aggregates over ALL matching records, not just current page)
    const aggregates = await this.prisma.cari.aggregate({
      where,
      _sum: {
        bakiye: true,
        // Assuming we have separate fields for totalDebt/totalCredit or we derive them. 
        // If Cari model only has 'bakiye', we might need to sum positive and negative values separately.
        // But Prisma aggregate doesn't support conditional sum easily.
        // We might need a raw query for efficient dashboard totals.
      },
      _count: {
        id: true
      }
    });

    // We likely need separate sums for Debt (Borç - Positive) and Credit (Alacak - Negative) or vice versa.
    // Attempting 2 aggregates for efficiency if native field exists, otherwise raw query.
    // Let's use two separate aggregates for now for simplicity and safety.

    const [totalDebt, totalCredit] = await Promise.all([
      this.prisma.cari.aggregate({
        where: { ...where, bakiye: { gt: 0 } },
        _sum: { bakiye: true }
      }),
      this.prisma.cari.aggregate({
        where: { ...where, bakiye: { lt: 0 } },
        _sum: { bakiye: true }
      })
    ]);

    const items = cariler.map((item) => {
      const balance = Number(item.bakiye || 0);
      return {
        id: item.id,
        cariKodu: item.cariKodu,
        unvan: item.unvan,
        tip: item.tip,
        balance,
        totalDebt: balance < 0 ? Math.abs(balance) : 0,
        totalCredit: balance > 0 ? balance : 0,
        satisElemani: item.satisElemani?.adSoyad || '-',
      };
    });

    return {
      items,
      summary: {
        totalDebt: Math.abs(Number(totalCredit._sum.bakiye || 0)), // Bakiye < 0 ise Borçludur (bizim sistemde bakiye - ise borç)
        totalCredit: Number(totalDebt._sum.bakiye || 0), // Bakiye > 0 ise Alacaklıdır
        netBalance: Number(aggregates._sum.bakiye || 0),
        count: aggregates._count.id,
      },
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const cari = await this.prisma.cari.findUnique({
      where: { id },
      include: {
        faturalar: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        tahsilatlar: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        cariHareketler: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        yetkililer: true,
        ekAdresler: true,
        tedarikciBankalar: true,
      },
    });

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    return cari;
  }

  async update(id: string, dto: UpdateCariDto) {
    await this.findOne(id);

    const { yetkililer, ekAdresler, tedarikciBankalar, ...rest } = dto;

    return this.prisma.cari.update({
      where: { id },
      data: {
        ...rest,
        satisElemaniId: rest.satisElemaniId === '' ? null : rest.satisElemaniId,
        yetkililer: yetkililer ? { deleteMany: {}, create: yetkililer } : undefined,
        ekAdresler: ekAdresler ? { deleteMany: {}, create: ekAdresler } : undefined,
        tedarikciBankalar: tedarikciBankalar ? { deleteMany: {}, create: tedarikciBankalar } : undefined,
      },
    });
  }

  async remove(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) throw new BadRequestException('Tenant ID bulunamadı.');

    await this.deletionProtection.checkCariDeletion(id, tenantId);

    return this.prisma.cari.delete({
      where: { id },
    });
  }

  async getHareketler(cariId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.cariHareket.findMany({
        where: { cariId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.cariHareket.count({ where: { cariId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportDebtCreditReportExcel(query: any): Promise<Buffer> {
    // Increase limit for export
    const { items: cariler, summary } = await this.getDebtCreditReport({ ...query, limit: 10000 });

    const tenantId = await this.tenantResolver.resolveForQuery();
    const tenantSettings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId: tenantId || '' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Borç Alacak Raporu');

    // Corporate Header
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = tenantSettings?.companyName || 'OTOMUHASEBE ERP';
    worksheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FF1F2937' } };

    worksheet.mergeCells('A2:G2');
    worksheet.getCell('A2').value = 'BORÇ ALACAK DURUM RAPORU';
    worksheet.getCell('A2').font = { size: 18, bold: true, color: { argb: 'FF8B5CF6' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.getCell('D4').value = 'Tarih:';
    worksheet.getCell('E4').value = new Date().toLocaleDateString('tr-TR');
    worksheet.getCell('D4').font = { bold: true };

    // Summary Section
    worksheet.getCell('A6').value = 'TOPLAM BORÇ';
    worksheet.getCell('B6').value = Number(summary.totalDebt);
    worksheet.getCell('B6').numFmt = '#,##0.00 ₺';
    worksheet.getCell('B6').font = { bold: true, color: { argb: 'FFEF4444' } };

    worksheet.getCell('C6').value = 'TOPLAM ALACAK';
    worksheet.getCell('D6').value = Number(summary.totalCredit);
    worksheet.getCell('D6').numFmt = '#,##0.00 ₺';
    worksheet.getCell('D6').font = { bold: true, color: { argb: 'FF10B981' } };

    worksheet.getCell('E6').value = 'NET BAKİYE';
    worksheet.getCell('F6').value = Number(summary.netBalance);
    worksheet.getCell('F6').numFmt = '#,##0.00 ₺';
    worksheet.getCell('F6').font = { bold: true };

    // Table Header
    const dataHeaderRow = worksheet.addRow([
      'Cari Kodu',
      'Ünvan',
      'Satış Elemanı',
      'Borç',
      'Alacak',
      'Bakiye',
    ]);
    dataHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    dataHeaderRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8B5CF6' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Data Rows
    cariler.forEach((item, index) => {
      const balance = item.balance;
      const debt = balance > 0 ? balance : 0;
      const credit = balance < 0 ? Math.abs(balance) : 0;

      const row = worksheet.addRow([
        item.cariKodu,
        item.unvan,
        item.satisElemani,
        debt || null,
        credit || null,
        Math.abs(balance),
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
      });

      if (debt > 0) row.getCell(4).font = { color: { argb: 'FFEF4444' } };
      if (credit > 0) row.getCell(5).font = { color: { argb: 'FF10B981' } };
      row.getCell(6).font = { bold: true };
    });

    worksheet.columns = [
      { width: 15 },
      { width: 40 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportDebtCreditReportPdf(query: any): Promise<Buffer> {
    const { items: cariler, summary } = await this.getDebtCreditReport({ ...query, limit: 10000 });

    const tenantId = await this.tenantResolver.resolveForQuery();
    const tenantSettings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId: tenantId || '' },
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
        bold: Buffer.from(vfs['Roboto-Medium.ttf'] || vfs['Roboto-Regular.ttf'], 'base64'),
        italics: Buffer.from(vfs['Roboto-Italic.ttf'] || vfs['Roboto-Regular.ttf'], 'base64'),
      },
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 140, 40, 60],
      header: (currentPage) => ({
        margin: [40, 20, 40, 0],
        stack: [
          {
            columns: [
              {
                width: '*',
                stack: [
                  logoBase64 ? { image: logoBase64, width: 80, margin: [0, 0, 0, 10] as any } : { text: '' },
                  { text: tenantSettings?.companyName || 'OTOMUHASEBE ERP', style: 'companyName' },
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
              {
                width: 'auto',
                stack: [
                  { text: 'BORÇ ALACAK RAPORU', style: 'docTitle', alignment: 'right' },
                  { text: `Tarih: ${new Date().toLocaleDateString('tr-TR')}`, style: 'docTag', alignment: 'right' },
                  { text: `Sayfa: ${currentPage}`, style: 'docTag', alignment: 'right', margin: [0, 2, 0, 0] },
                ],
              },
            ],
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 0, y1: 15,
                x2: 515, y2: 15,
                lineWidth: 1,
                lineColor: '#1e293b',
              },
            ],
          },
        ],
      }),
      content: [
        // Summary Cards Section
        {
          style: 'summarySection',
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  stack: [
                    { text: 'TOPLAM BORÇ', style: 'summaryLabel' },
                    { text: `${Number(summary.totalDebt).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValueDanger' }
                  ],
                  fillColor: '#fef2f2',
                  padding: [10, 10, 10, 10] as any
                },
                {
                  stack: [
                    { text: 'TOPLAM ALACAK', style: 'summaryLabel' },
                    { text: `${Number(summary.totalCredit).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValueSuccess' }
                  ],
                  fillColor: '#f0fdf4',
                  padding: [10, 10, 10, 10] as any
                },
                {
                  stack: [
                    { text: 'NET BAKİYE', style: 'summaryLabel' },
                    { text: `${Math.abs(Number(summary.netBalance)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL ${summary.netBalance < 0 ? '(B)' : summary.netBalance > 0 ? '(A)' : ''}`, style: 'summaryValue' }
                  ],
                  fillColor: '#f3f4f6',
                  padding: [10, 10, 10, 10] as any
                }
              ]
            ]
          },
          layout: 'noBorders'
        },
        // Data Table Section
        {
          style: 'transactionTable',
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'CARİ KODU', style: 'tableHeader' },
                { text: 'ÜNVAN', style: 'tableHeader' },
                { text: 'SATIŞ ELEMANI', style: 'tableHeader' },
                { text: 'BORÇ', style: 'tableHeader', alignment: 'right' },
                { text: 'ALACAK', style: 'tableHeader', alignment: 'right' },
                { text: 'BAKİYE', style: 'tableHeader', alignment: 'right' },
              ],
              ...cariler.map((item) => {
                const balance = item.balance;
                const debt = balance < 0 ? Math.abs(balance) : 0;
                const credit = balance > 0 ? balance : 0;
                return [
                  { text: item.cariKodu, style: 'tableCell' },
                  { text: item.unvan, style: 'tableCell' },
                  { text: item.satisElemani, style: 'tableCell' },
                  { text: debt > 0 ? debt.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-', style: 'tableCellDanger', alignment: 'right' },
                  { text: credit > 0 ? credit.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-', style: 'tableCellSuccess', alignment: 'right' },
                  {
                    text: `${Math.abs(balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${balance < 0 ? '(B)' : balance > 0 ? '(A)' : ''}`,
                    style: 'tableCellBold',
                    alignment: 'right'
                  },
                ]
              }),
            ],
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex > 0 && rowIndex % 2 === 0) ? '#f9fafb' : null,
            hLineWidth: (i: number) => 0.5,
            vLineWidth: (i: number) => 0.5,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
          }
        } as any,
      ],
      footer: (currentPage: number, pageCount: number) => ({
        text: `Sayfa ${currentPage} / ${pageCount} | OTOMUHASEBE ERP tarafından hazırlandı.`,
        alignment: 'center',
        fontSize: 7,
        color: '#94a3b8',
        margin: [0, 20, 0, 0]
      }),
      styles: {
        companyName: { fontSize: 13, bold: true, color: '#0f172a', margin: [0, 0, 0, 2] },
        companyAddress: { fontSize: 8, color: '#64748b', lineHeight: 1.2 },
        docTitle: { fontSize: 18, bold: true, color: '#1e293b', margin: [0, 0, 0, 4] },
        docTag: { fontSize: 8, color: '#94a3b8' },
        summarySection: { margin: [0, 0, 0, 20] },
        summaryLabel: { fontSize: 7, bold: true, color: '#64748b', margin: [0, 0, 0, 4] },
        summaryValue: { fontSize: 12, bold: true, color: '#1e293b' },
        summaryValueSuccess: { fontSize: 12, bold: true, color: '#15803d' },
        summaryValueDanger: { fontSize: 12, bold: true, color: '#b91c1c' },
        transactionTable: { margin: [0, 0, 0, 0] },
        tableHeader: { fontSize: 8, bold: true, color: '#ffffff', fillColor: '#1e293b', margin: [0, 4, 0, 4] },
        tableCell: { fontSize: 8, color: '#334155', margin: [0, 4, 0, 4] },
        tableCellBold: { fontSize: 8, bold: true, color: '#0f172a', margin: [0, 4, 0, 4] },
        tableCellSuccess: { fontSize: 8, color: '#15803d', margin: [0, 4, 0, 4] },
        tableCellDanger: { fontSize: 8, color: '#b91c1c', margin: [0, 4, 0, 4] },
      },
      defaultStyle: { font: 'Roboto' },
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];
        pdfDoc.on('data', chunk => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);
        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
