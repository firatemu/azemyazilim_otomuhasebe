'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Box, Stack } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from '@/lib/axios';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import './ExpensePrintForm.css';

interface Masraf {
    id: string;
    date: string;
    amount: number;
    notes?: string;
    referenceNo?: string;
    paymentType?: string;
    category?: {
        name: string;
    };
}

interface ExpensePrintFormProps {
    open: boolean;
    expenses: Masraf[];
    onClose: () => void;
    dateRange?: { start: string; end: string };
}

const ExpensePrintForm: React.FC<ExpensePrintFormProps> = ({ open, expenses, onClose, dateRange }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [companyInfo, setCompanyInfo] = useState<any>(null);

    useEffect(() => {
        if (open) {
            axios.get('/tenants/settings')
                .then(res => setCompanyInfo(res.data))
                .catch(err => console.error('Failed to fetch company settings', err));
        }
    }, [open]);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Masraf_Raporu_${format(new Date(), 'yyyyMMdd')}`,
    });

    const handleDownloadPDF = async () => {
        if (!printRef.current) return;

        const canvas = await html2canvas(printRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Masraf_Raporu_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            fullWidth
            PaperProps={{
                sx: {
                    maxWidth: '850px',
                    maxHeight: '95vh',
                    m: 2,
                    bgcolor: 'var(--muted)'
                }
            }}
        >
            <DialogContent sx={{ p: 4, bgcolor: '#f5f5f5', overflow: 'auto' }}>
                <div ref={printRef} className="print-content A4-vertical modern-compact">
                    {/* Header Row */}
                    <div className="modern-header">
                        <div className="header-left">
                            {companyInfo?.logoUrl && (
                                <img src={companyInfo.logoUrl} alt="Logo" className="company-logo" />
                            )}
                            <div className="company-details">
                                <h1>{companyInfo?.companyName || 'OTOMUHASEBE'}</h1>
                                <p>{companyInfo?.address || 'Şirket Adresi Belirtilmemiş'}</p>
                                <p>{companyInfo?.phone || ''} {companyInfo?.email && `| ${companyInfo?.email}`}</p>
                            </div>
                        </div>
                        <div className="header-right">
                            <h2 className="doc-title">MASRAF RAPORU</h2>
                            <table className="meta-table">
                                <tbody>
                                    <tr>
                                        <td className="label">Rapor Tarihi:</td>
                                        <td className="value">{format(new Date(), 'dd MMMM yyyy', { locale: tr })}</td>
                                    </tr>
                                    <tr>
                                        <td className="label">Kayıt Sayısı:</td>
                                        <td className="value">{expenses.length}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Banner */}
                    <div className="summary-section">
                        <div className="summary-item">
                            <span className="summary-label">TARİH ARALIĞI</span>
                            <span className="summary-value">
                                {dateRange?.start ? format(new Date(dateRange.start), 'dd.MM.yyyy') : 'Tümü'} -
                                {dateRange?.end ? format(new Date(dateRange.end), 'dd.MM.yyyy') : 'Tümü'}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">TOPLAM HARCAMA</span>
                            <span className="summary-value total-spent">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="items-section compact-table">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '12%' }}>Tarih</th>
                                    <th style={{ width: '20%' }}>Kategori</th>
                                    <th style={{ width: '33%' }}>Açıklama</th>
                                    <th style={{ width: '15%' }}>Fiş No</th>
                                    <th style={{ width: '20%', textAlign: 'right' }}>Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((m, index) => (
                                    <tr key={m.id || index}>
                                        <td>{format(new Date(m.date), 'dd.MM.yy')}</td>
                                        <td>{m.category?.name || '-'}</td>
                                        <td>{m.notes || '-'}</td>
                                        <td>{m.referenceNo || '-'}</td>
                                        <td className="amount-col">{formatCurrency(m.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Signatures */}
                    <div className="signatures-grid">
                        <div className="sig-box">
                            <div className="sig-title">Hazırlayan</div>
                            <div className="sig-name">...........................</div>
                        </div>
                        <div className="sig-box">
                            <div className="sig-title">Onaylayan</div>
                            <div className="sig-name">...........................</div>
                        </div>
                    </div>

                    {/* Page Footer */}
                    <div className="print-footer-simple">
                        Bu rapor OtoMuhasebe sistemi tarafından otomatik olarak oluşturulmuştur.
                    </div>
                </div>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #ddd', bgcolor: 'white' }}>
                <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button onClick={onClose} variant="outlined" startIcon={<CloseIcon />}>Kapat</Button>
                    <Stack direction="row" spacing={1}>
                        <Button onClick={handleDownloadPDF} variant="contained" color="info" startIcon={<DownloadIcon />}>PDF İndir</Button>
                        <Button onClick={() => handlePrint()} variant="contained" color="primary" startIcon={<PrintIcon />}>Yazdır</Button>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default ExpensePrintForm;
