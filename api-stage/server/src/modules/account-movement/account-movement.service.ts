import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAccountMovementDto, StatementQueryDto } from './dto';
import { Prisma, DebitCredit } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AccountMovementService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateAccountMovementDto) {
        const account = await this.prisma.extended.account.findUnique({
            where: { id: dto.accountId },
        });

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        let nextBalance = Number(account.balance);

        if (dto.type === 'DEBIT') {
            nextBalance += Number(dto.amount);
        } else if (dto.type === 'CREDIT') {
            nextBalance -= Number(dto.amount);
        } else if (dto.type === 'CARRY_FORWARD' || dto.type === 'CARRY_FORWARD') {
            nextBalance = Number(dto.amount);
        }

        const movement = await this.prisma.extended.$transaction(async (tx) => {
            const newMovement = await tx.accountMovement.create({
                data: {
                    accountId: dto.accountId,
                    type: dto.type as DebitCredit,
                    amount: new Prisma.Decimal(dto.amount),
                    balance: new Prisma.Decimal(nextBalance),
                    documentType: dto.documentType,
                    documentNo: dto.documentNo,
                    date: dto.date ? new Date(dto.date) : new Date(),
                    notes: dto.notes,
                },
                include: {
                    account: true,
                },
            });

            await tx.account.update({
                where: { id: dto.accountId },
                data: { balance: new Prisma.Decimal(nextBalance) },
            });

            return newMovement;
        });

        return movement;
    }

    async findAll(accountId: string, skip = 0, take = 100) {
        const [movements, total] = await Promise.all([
            this.prisma.extended.accountMovement.findMany({
                where: { accountId },
                include: { account: true },
                orderBy: { date: 'desc' },
                skip,
                take,
            }),
            this.prisma.extended.accountMovement.count({ where: { accountId } }),
        ]);

        return {
            data: movements,
            total,
        };
    }

    async getStatement(query: StatementQueryDto) {
        const where: any = { accountId: query.accountId };

        if (query.startDate || query.endDate) {
            where.date = {};
            if (query.startDate) {
                where.date.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.date.lte = new Date(query.endDate);
            }
        }

        const [account, movements] = await Promise.all([
            this.prisma.extended.account.findUnique({
                where: { id: query.accountId },
            }),
            this.prisma.extended.accountMovement.findMany({
                where,
                orderBy: { date: 'asc' },
            }),
        ]);

        return {
            account,
            movements,
        };
    }

    async exportExcel(query: StatementQueryDto): Promise<Buffer> {
        const { account, movements } = await this.getStatement(query);

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        const tenantSettings = await this.prisma.extended.tenantSettings.findUnique({
            where: { tenantId: account.tenantId || '' },
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Account Statement');

        worksheet.mergeCells('A1:F1');
        worksheet.getCell('A1').value = tenantSettings?.companyName || 'OTOMUHASEBE ERP';
        worksheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FF1F2937' } };

        worksheet.mergeCells('A2:F2');
        worksheet.getCell('A2').value = 'ACCOUNT STATEMENT';
        worksheet.getCell('A2').font = { size: 18, bold: true, color: { argb: 'FF527575' } };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        worksheet.getCell('A4').value = 'Account Title:';
        worksheet.getCell('B4').value = (account as any).title;
        worksheet.getCell('A4').font = { bold: true };

        worksheet.getCell('A5').value = 'Account Code:';
        worksheet.getCell('B5').value = (account as any).code;
        worksheet.getCell('A5').font = { bold: true };

        worksheet.getCell('D4').value = 'Date:';
        worksheet.getCell('E4').value = new Date().toLocaleDateString('tr-TR');
        worksheet.getCell('D4').font = { bold: true };

        if ((account as any).taxNumber) {
            worksheet.getCell('A6').value = 'Tax Office / Tax No:';
            worksheet.getCell('B6').value = `${(account as any).taxOffice || ''} / ${(account as any).taxNumber}`;
            worksheet.getCell('A6').font = { bold: true };
        }

        const totalDebt = movements
            .filter((h) => h.type === 'DEBIT')
            .reduce((sum, h) => sum + Number(h.amount), 0);
        const totalCredit = movements
            .filter((h) => h.type === 'CREDIT')
            .reduce((sum, h) => sum + Number(h.amount), 0);

        worksheet.getCell('A8').value = 'TOTAL DEBT';
        worksheet.getCell('B8').value = totalDebt;
        worksheet.getCell('B8').numFmt = '#,##0.00 ₺';
        worksheet.getCell('B8').font = { bold: true, color: { argb: 'FFEF4444' } };

        worksheet.getCell('C8').value = 'TOTAL CREDIT';
        worksheet.getCell('D8').value = totalCredit;
        worksheet.getCell('D8').numFmt = '#,##0.00 ₺';
        worksheet.getCell('D8').font = { bold: true, color: { argb: 'FF10B981' } };

        worksheet.getCell('E8').value = 'NET BALANCE';
        worksheet.getCell('F8').value = Number((account as any).balance);
        worksheet.getCell('F8').numFmt = '#,##0.00 ₺';
        worksheet.getCell('F8').font = { bold: true };

        const headerRow = worksheet.addRow([]);
        const dataHeaderRow = worksheet.addRow([
            'Date',
            'Document No',
            'Notes',
            'Debt',
            'Credit',
            'Balance',
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

        movements.forEach((movement, index) => {
            const row = worksheet.addRow([
                new Date(movement.date).toLocaleDateString('tr-TR'),
                movement.documentNo || '-',
                movement.notes,
                movement.type === 'DEBIT' ? Number(movement.amount) : null,
                movement.type === 'CREDIT' ? Number(movement.amount) : null,
                Number(movement.balance),
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

            if (movement.type === 'DEBIT') row.getCell(4).font = { color: { argb: 'FFEF4444' } };
            if (movement.type === 'CREDIT') row.getCell(5).font = { color: { argb: 'FF10B981' } };
            row.getCell(6).font = { bold: true };
        });

        worksheet.columns = [
            { width: 15 },
            { width: 15 },
            { width: 50 },
            { width: 15 },
            { width: 15 },
            { width: 15 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    async exportPdf(query: StatementQueryDto): Promise<Buffer> {
        const { account, movements } = await this.getStatement(query);

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        const tenantSettings = await this.prisma.extended.tenantSettings.findUnique({
            where: { tenantId: account.tenantId || '' },
        });

        let logoBase64: string | null = null;
        if (tenantSettings?.logoUrl) {
            try {
                if (tenantSettings.logoUrl.startsWith('/api/uploads/')) {
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
                    const response = await axios.get(tenantSettings.logoUrl, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data, 'binary');
                    const ext = path.extname(tenantSettings.logoUrl).toLowerCase().replace('.', '') || 'png';
                    logoBase64 = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buffer.toString('base64')}`;
                }
            } catch (error) {
                console.error('Error loading logo:', error);
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

        const totalDebt = movements
            .filter((h) => h.type === 'DEBIT')
            .reduce((sum, h) => sum + Number(h.amount), 0);
        const totalCredit = movements
            .filter((h) => h.type === 'CREDIT')
            .reduce((sum, h) => sum + Number(h.amount), 0);
        const netBalance = Number((account as any).balance);

        const docDefinition: TDocumentDefinitions = {
            pageSize: 'A4',
            pageMargins: [40, 140, 40, 60],
            header: {
                margin: [40, 20, 40, 0],
                columns: [
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
                                    tenantSettings?.email ? ` | Email: ${tenantSettings.email}` : '',
                                    tenantSettings?.website ? ` | Web: ${tenantSettings.website}` : '',
                                    '\n',
                                    tenantSettings?.taxOffice ? `Tax Office: ${tenantSettings.taxOffice}` : '',
                                    tenantSettings?.taxNumber ? ` | Tax No: ${tenantSettings.taxNumber}` : '',
                                    tenantSettings?.tcNo ? ` | National ID: ${tenantSettings.tcNo}` : '',
                                ].filter(Boolean).join(''),
                                style: 'companyAddress',
                            },
                        ],
                    },
                    {
                        width: 'auto',
                        stack: [
                            { text: 'ACCOUNT STATEMENT', style: 'docTitle', alignment: 'right' },
                            {
                                text: `Date: ${new Date().toLocaleDateString('tr-TR')}`,
                                style: 'docDate',
                                alignment: 'right',
                            },
                            {
                                text: `Page: 1`,
                                style: 'docDate',
                                alignment: 'right',
                                margin: [0, 5, 0, 0]
                            }
                        ],
                    },
                ],
            },
            content: [
                {
                    style: 'customerBox',
                    table: {
                        widths: ['auto', '*', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'ACCOUNT:', style: 'labelBold', border: [false, false, false, false] },
                                { text: (account as any).title, style: 'customerName', border: [false, false, false, false] },
                                { text: 'ACCOUNT CODE:', style: 'labelBold', border: [false, false, false, false] },
                                { text: (account as any).code, style: 'value', border: [false, false, false, false] },
                            ],
                            [
                                { text: 'TAX NO:', style: 'labelBold', border: [false, false, false, false] },
                                {
                                    text: (account as any).taxNumber ? `${(account as any).taxOffice || ''} / ${(account as any).taxNumber}` : '',
                                    style: 'value',
                                    border: [false, false, false, false]
                                },
                                { text: 'BALANCE:', style: 'labelBold', border: [false, false, false, false] },
                                {
                                    text: `${Math.abs(netBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL (${netBalance < 0 ? 'D' : netBalance > 0 ? 'C' : '-'})`,
                                    style: netBalance < 0 ? 'valueSuccess' : netBalance > 0 ? 'valueDanger' : 'value',
                                    border: [false, false, false, false]
                                }
                            ],
                        ],
                    },
                    layout: 'noBorders',
                },

                {
                    style: 'summaryTable',
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [
                                { text: 'TOTAL DEBT', style: 'summaryHeader', alignment: 'center', fillColor: '#fef2f2' },
                                { text: 'TOTAL CREDIT', style: 'summaryHeader', alignment: 'center', fillColor: '#f0fdf4' },
                                { text: 'NET BALANCE', style: 'summaryHeader', alignment: 'center', fillColor: '#f3f4f6' },
                            ],
                            [
                                { text: `${totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValueDanger', alignment: 'center' },
                                { text: `${totalCredit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValueSuccess', alignment: 'center' },
                                { text: `${Math.abs(netBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL ${netBalance < 0 ? '(D)' : netBalance > 0 ? '(C)' : ''}`, style: 'summaryValueBold', alignment: 'center' },
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

                {
                    style: 'transactionTable',
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'DATE', style: 'tableHeader' },
                                { text: 'DOCUMENT NO', style: 'tableHeader' },
                                { text: 'NOTES', style: 'tableHeader' },
                                { text: 'DEBT', style: 'tableHeader', alignment: 'right' },
                                { text: 'CREDIT', style: 'tableHeader', alignment: 'right' },
                                { text: 'BALANCE', style: 'tableHeader', alignment: 'right' },
                            ],
                            ...movements.map((h, index) => [
                                { text: new Date(h.date).toLocaleDateString('tr-TR'), style: 'tableCell' },
                                { text: h.documentNo || '-', style: 'tableCell' },
                                { text: h.notes, style: 'tableCell' },
                                {
                                    text: h.type === 'DEBIT' ? Number(h.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '',
                                    style: 'tableCellDanger',
                                    alignment: 'right',
                                },
                                {
                                    text: h.type === 'CREDIT' ? Number(h.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '',
                                    style: 'tableCellSuccess',
                                    alignment: 'right',
                                },
                                {
                                    text: Number(h.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 }),
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
                    text: `Page ${currentPage} / ${pageCount}`,
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
                    color: '#527575',
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
                    fillColor: '#527575',
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
        const movement = await this.prisma.extended.accountMovement.findUnique({
            where: { id },
        });

        if (!movement) {
            throw new NotFoundException('Movement record not found');
        }

        const account = await this.prisma.extended.account.findUnique({
            where: { id: movement.accountId },
        });

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        let nextBalance = Number(account.balance);

        if (movement.type === 'DEBIT') {
            nextBalance -= Number(movement.amount);
        } else if (movement.type === 'CREDIT') {
            nextBalance += Number(movement.amount);
        }

        await this.prisma.extended.$transaction(async (tx) => {
            await tx.accountMovement.delete({
                where: { id },
            });

            await tx.account.update({
                where: { id: movement.accountId },
                data: { balance: new Prisma.Decimal(nextBalance) },
            });
        });

        return { message: 'Movement record deleted and balance updated' };
    }
}
