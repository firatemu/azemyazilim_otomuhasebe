'use client';

import axios from '@/lib/axios';

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Box, Typography, Stack } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './WarehouseTransferPrintForm.css';

interface WarehouseTransferItem {
    id: string;
    stok: {
        stokKodu: string;
        stokAdi: string;
        birim: string;
    };
    miktar: number;
    fromLocation?: { code: string };
    toLocation?: { code: string };
}

interface WarehouseTransfer {
    id: string;
    transferNo: string;
    tarih: string;
    durum: string;
    fromWarehouse: { name: string };
    toWarehouse: { name: string };
    driverName?: string;
    vehiclePlate?: string;
    aciklama?: string;
    kalemler: WarehouseTransferItem[];
    hazirlayanUser?: { fullName: string };
    onaylayanUser?: { fullName: string };
}

interface WarehouseTransferPrintFormProps {
    open: boolean;
    transfer: WarehouseTransfer | null;
    onClose: () => void;
}

const WarehouseTransferPrintForm: React.FC<WarehouseTransferPrintFormProps> = ({ open, transfer, onClose }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [companyInfo, setCompanyInfo] = React.useState<any>(null);

    React.useEffect(() => {
        if (open) {
            // Fetch company settings
            axios.get('/tenants/settings')
                .then(res => setCompanyInfo(res.data))
                .catch(err => console.error('Failed to fetch company settings', err));
        }
    }, [open]);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Transfer_${transfer?.transferNo || 'Belge'}`,
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
        pdf.save(`Transfer_${transfer?.transferNo || 'Belge'}.pdf`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!transfer) return null;

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
                    bgcolor: '#f5f5f5'
                }
            }}
        >
            <DialogContent sx={{ p: 4, overflow: 'auto' }}>
                <div ref={printRef} className="print-content A4-vertical modern-compact">
                    {/* Header with Company Info & Meta Data Side-by-Side */}
                    <div className="modern-header">
                        <div className="header-left">
                            {companyInfo?.logoUrl && (
                                <img src={companyInfo.logoUrl} alt="Logo" className="company-logo" />
                            )}
                            <div className="company-details">
                                <h1>{companyInfo?.companyName || 'Firma Adı'}</h1>
                                <p>{companyInfo?.address}</p>
                                <p>{companyInfo?.phone} {companyInfo?.email && `| ${companyInfo?.email}`}</p>
                            </div>
                        </div>
                        <div className="header-right">
                            <h2 className="doc-title">AMBAR TRANSFER FİŞİ</h2>
                            <table className="meta-table">
                                <tbody>
                                    <tr>
                                        <td className="label">Fiş No:</td>
                                        <td className="value">{transfer.transferNo}</td>
                                    </tr>
                                    <tr>
                                        <td className="label">Tarih:</td>
                                        <td className="value">{formatDate(transfer.tarih)}</td>
                                    </tr>
                                    <tr>
                                        <td className="label">Oluşturan:</td>
                                        <td className="value">{transfer.hazirlayanUser?.fullName || '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Warehouse Route Compact */}
                    <div className="route-section">
                        <div className="route-box from">
                            <span className="route-label">ÇIKIŞ AMBARI</span>
                            <span className="route-value">{transfer.fromWarehouse.name}</span>
                        </div>
                        <div className="route-arrow">➔</div>
                        <div className="route-box to">
                            <span className="route-label">GİRİŞ AMBARI</span>
                            <span className="route-value">{transfer.toWarehouse.name}</span>
                        </div>
                    </div>

                    {/* Driver / Vehicle Info Row */}
                    {(transfer.driverName || transfer.vehiclePlate) && (
                        <div className="logistics-row">
                            {transfer.driverName && (
                                <div className="logistic-pill">
                                    <span className="icon">👤</span> <span>{transfer.driverName}</span>
                                </div>
                            )}
                            {transfer.vehiclePlate && (
                                <div className="logistic-pill">
                                    <span className="icon">🚛</span> <span>{transfer.vehiclePlate}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Items Table */}
                    <div className="items-section compact-table">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '4%' }}>#</th>
                                    <th style={{ width: '20%' }}>Kod</th>
                                    <th style={{ width: '20%' }}>Marka</th>
                                    <th style={{ width: '40%' }}>Stok Adı</th>
                                    <th style={{ width: '16%', textAlign: 'right' }}>Miktar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfer.kalemler.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td className="code">{item.stok.stokKodu}</td>
                                        <td>{(item.stok as any).marka || '-'}</td>
                                        <td>{item.stok.stokAdi}</td>
                                        <td className="qty">
                                            {item.miktar} {item.stok.birim}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Notes */}
                    {transfer.aciklama && (
                        <div className="notes-section">
                            <strong>Açıklama:</strong> {transfer.aciklama}
                        </div>
                    )}

                    {/* Signatures Compact */}
                    <div className="signatures-grid">
                        <div className="sig-box">
                            <div className="sig-title">Sevk Eden</div>
                            <div className="sig-name">{transfer.onaylayanUser?.fullName || '...........................'}</div>
                        </div>
                        <div className="sig-box">
                            <div className="sig-title">Teslim Eden (Sürücü)</div>
                            <div className="sig-name">{transfer.driverName || '...........................'}</div>
                        </div>
                        <div className="sig-box">
                            <div className="sig-title">Teslim Alan</div>
                            <div className="sig-name">...........................</div>
                        </div>
                    </div>

                    <div className="print-footer-simple">
                        Otomatik Sistem Fişi • {new Date().toLocaleString('tr-TR')}
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

export default WarehouseTransferPrintForm;
