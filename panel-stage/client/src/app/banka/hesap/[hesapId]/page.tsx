'use client';

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Grid,
    IconButton,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
    Skeleton,
    Paper,
    Divider,
    Alert,
    InputAdornment
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    Add,
    ArrowBack,
    TrendingUp,
    TrendingDown,
    AccountBalance,
    CreditCard,
    FileDownload,
    PictureAsPdf
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from '@/lib/axios';
import MainLayout from '@/components/Layout/MainLayout';
import CreateCreditDialog from '@/components/Banka/CreateCreditDialog';
// ... imports
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import CreditLoanList from '@/components/Banka/CreditLoanList';

// Interfaces
interface Cari {
    id: string;
    unvan: string;
    cariKodu: string;
}

interface BankaHesapHareket {
    id: string;
    hareketTipi: 'GELEN' | 'GIDEN';
    hareketAltTipi?: string;
    tutar: number;
    komisyonOrani?: number;
    komisyonTutar?: number;
    netTutar?: number;
    bakiye: number;
    aciklama?: string;
    referansNo?: string;
    cariId?: string;
    cari?: Cari;
    tarih: string;
    createdAt: string;
}

interface Banka {
    id: string;
    ad: string;
    sube?: string;
}

interface BankaHesabi {
    id: string;
    hesapAdi: string;
    hesapKodu: string;
    hesapTipi: 'VADESIZ' | 'POS' | 'KREDI' | 'FIRMA_KREDI_KARTI';
    hesapNo?: string;
    iban?: string;
    bakiye: number;
    aktif: boolean;
    komisyonOrani?: number;
    krediLimiti?: number;
    kartLimiti?: number;
    hesapKesimGunu?: number;
    sonOdemeGunu?: number;
    banka: Banka;
    hareketler: BankaHesapHareket[];
}

// API
const fetchHesapDetay = async (hesapId: string) => {
    const res = await axios.get(`/banka/hesap/${hesapId}`);
    return res.data;
};

const fetchHareketler = async (hesapId: string, params?: any) => {
    const res = await axios.get(`/banka/hesap/${hesapId}/hareketler`, { params });
    return res.data;
};

const createHareket = async (hesapId: string, data: any) => {
    const res = await axios.post(`/banka/hesap/${hesapId}/hareket`, data);
    return res.data;
};

const createPosTahsilat = async (hesapId: string, data: any) => {
    const res = await axios.post(`/banka/hesap/${hesapId}/pos-tahsilat`, data);
    return res.data;
};

// Validation Schema
// Validation Schema - Base types for form inputs (always strings/numbers from UI)
const hareketSchema = z.object({
    hareketTipi: z.enum(['GELEN', 'GIDEN']),
    tutar: z.any().transform(val => Number(val)).pipe(z.number().positive('Tutar pozitif olmalı')),
    aciklama: z.string().optional(),
    referansNo: z.string().optional(),
    tarih: z.string().optional(),
});

type HareketFormValues = {
    hareketTipi: 'GELEN' | 'GIDEN';
    tutar: number;
    aciklama?: string;
    referansNo?: string;
    tarih?: string;
};

const posHareketSchema = z.object({
    tutar: z.any().transform(val => Number(val)).pipe(z.number().positive('Tutar pozitif olmalı')),
    aciklama: z.string().optional(),
    referansNo: z.string().optional(),
    tarih: z.string().optional(),
});

type PosHareketFormValues = {
    tutar: number;
    aciklama?: string;
    referansNo?: string;
    tarih?: string;
};

export default function HesapDetayPage() {
    const router = useRouter();
    const params = useParams();
    const hesapId = params.hesapId as string;
    const { enqueueSnackbar } = useSnackbar();

    const [hesap, setHesap] = useState<BankaHesabi | null>(null);
    const [hareketler, setHareketler] = useState<BankaHesapHareket[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [posDialogOpen, setPosDialogOpen] = useState(false);
    const [creditDialogOpen, setCreditDialogOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [posHesaplama, setPosHesaplama] = useState<{ komisyon: number; net: number } | null>(null);

    const { control, handleSubmit, reset, watch } = useForm<HareketFormValues>({
        resolver: zodResolver(hareketSchema),
        defaultValues: {
            hareketTipi: 'GELEN',
            tutar: 0,
            aciklama: '',
            referansNo: '',
            tarih: new Date().toISOString().split('T')[0],
        },
    });

    const { control: posControl, handleSubmit: handlePosSubmit, reset: resetPos, watch: watchPos } = useForm<PosHareketFormValues>({
        resolver: zodResolver(posHareketSchema),
        defaultValues: {
            tutar: 0,
            aciklama: '',
            referansNo: '',
            tarih: new Date().toISOString().split('T')[0],
        },
    });

    const posTutar = watchPos('tutar');

    // Calculate POS commission on amount change
    useEffect(() => {
        if (hesap?.komisyonOrani && posTutar > 0) {
            const komisyon = (posTutar * Number(hesap.komisyonOrani)) / 100;
            const net = posTutar - komisyon;
            setPosHesaplama({ komisyon, net });
        } else {
            setPosHesaplama(null);
        }
    }, [posTutar, hesap?.komisyonOrani]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [hesapData, hareketData] = await Promise.all([
                fetchHesapDetay(hesapId),
                fetchHareketler(hesapId)
            ]);
            setHesap(hesapData);
            setHareketler(hareketData);
        } catch (error) {
            enqueueSnackbar('Hesap bilgileri yüklenemedi', { variant: 'error' });
            router.back();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hesapId) loadData();
    }, [hesapId]);

    const onSubmit = async (values: HareketFormValues) => {
        try {
            await createHareket(hesapId, values);
            enqueueSnackbar('Hareket kaydedildi', { variant: 'success' });
            setDialogOpen(false);
            loadData();
            reset();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'İşlem başarısız', { variant: 'error' });
        }
    };

    const onPosSubmit = async (values: PosHareketFormValues) => {
        try {
            const result = await createPosTahsilat(hesapId, values);
            enqueueSnackbar(`POS tahsilatı kaydedildi. Net tutar: ${formatCurrency(result.hesaplama.netTutar)}`, { variant: 'success' });
            setPosDialogOpen(false);
            loadData();
            resetPos();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'İşlem başarısız', { variant: 'error' });
        }
    };

    const handleCreditSubmit = async (data: any) => {
        try {
            await axios.post(`/banka/hesap/${hesapId}/kredi-kullan`, data);
            enqueueSnackbar('Kredi kullanımı başarıyla oluşturuldu', { variant: 'success' });
            setCreditDialogOpen(false);
            loadData();
            setRefreshTrigger(prev => prev + 1);
        } catch (error: any) {
            console.error('Kredi kullanımı hatası:', error);
            enqueueSnackbar(error.response?.data?.message || 'Kredi kullanımı oluşturulurken bir hata oluştu', { variant: 'error' });
        }
    };

    const handleExcelExport = () => {
        if (!hareketler.length) return;

        const dataToExport = hareketler.map(h => ({
            'Tarih': formatDate(h.tarih),
            'Tip': h.hareketTipi === 'GELEN' ? 'Gelen' : 'Giden',
            'Alt Tip': h.hareketAltTipi || '-',
            'Tutar': h.tutar,
            'Komisyon': h.komisyonTutar || 0,
            'Net Tutar': h.netTutar || h.tutar,
            'Bakiye': h.bakiye,
            'Açıklama': h.aciklama || '-',
            'Referans': h.referansNo || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Hesap Hareketleri");
        XLSX.writeFile(wb, `${hesap?.hesapAdi}_hareketler.xlsx`);
    };

    const handlePdfExport = async () => {
        if (!hareketler.length || !hesap) return;

        const doc = new jsPDF();

        // Fontları yükle
        try {
            const fontUrl = '/fonts/Roboto-Regular.ttf';
            const fontBoldUrl = '/fonts/Roboto-Bold.ttf';

            console.log('Hesap Ekstresi için fontlar yükleniyor...', { fontUrl, fontBoldUrl });

            const fontRes = await fetch(fontUrl);
            const fontBoldRes = await fetch(fontBoldUrl);

            if (!fontRes.ok || !fontBoldRes.ok) {
                throw new Error(`Font dosyaları yüklenemedi: ${fontRes.status} / ${fontBoldRes.status}`);
            }

            const fontBytes = await fontRes.arrayBuffer();
            const fontBoldBytes = await fontBoldRes.arrayBuffer();

            console.log('Hesap Ekstresi font bytes alındı:', { regular: fontBytes.byteLength, bold: fontBoldBytes.byteLength });

            // Base64'e çevir (Daha güvenli yöntem)
            const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
                const bytes = new Uint8Array(buffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return window.btoa(binary);
            };

            const fontBase64 = arrayBufferToBase64(fontBytes);
            const fontBoldBase64 = arrayBufferToBase64(fontBoldBytes);

            doc.addFileToVFS("Roboto-Regular.ttf", fontBase64);
            doc.addFileToVFS("Roboto-Bold.ttf", fontBoldBase64);

            doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
            doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

            doc.setFont("Roboto");
            console.log('Hesap Ekstresi fontları başarıyla yüklendi.');
        } catch (e) {
            console.error("Hesap Ekstresi font yükleme hatası:", e);
            doc.setFont("helvetica");
        }

        // Renkler
        const primaryColor = '#2563eb'; // Blue 600
        const secondaryColor = '#f3f4f6'; // Gray 100
        const textColor = '#1f2937'; // Gray 800
        const lightTextColor = '#6b7280'; // Gray 500

        // Sayfa Ayarları (A4)
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 15;
        let y = margin;

        // --- Header Başlangıç ---
        // Sol Üst: Logo / Firma Adı
        doc.setFontSize(24);
        doc.setTextColor(primaryColor);
        doc.setFont('Roboto', 'bold');
        doc.text('OTO MUHASEBE', margin, y + 10);

        doc.setFontSize(10);
        doc.setTextColor(lightTextColor);
        doc.setFont('Roboto', 'normal');
        doc.text('Finansal Yönetim Sistemi', margin, y + 16);

        // Sağ Üst: Başlık ve Tarih
        doc.setFontSize(16);
        doc.setTextColor(textColor);
        doc.setFont('Roboto', 'bold');
        const title = 'HESAP EKSTRESİ';
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, pageWidth - margin - titleWidth, y + 10);

        doc.setFontSize(10);
        doc.setTextColor(lightTextColor);
        doc.setFont('Roboto', 'normal');
        const dateStr = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
        const dateWidth = doc.getTextWidth(dateStr);
        doc.text(dateStr, pageWidth - margin - dateWidth, y + 16);

        y += 30; // Header bitişi
        // --- Header Bitiş ---

        // --- Hesap Bilgileri Kartı ---
        // Arka plan
        doc.setFillColor(secondaryColor);
        doc.roundedRect(margin, y, pageWidth - (margin * 2), 35, 3, 3, 'F');

        // Sol Kolon: Banka Bilgileri
        let infoY = y + 10;
        doc.setFontSize(8);
        doc.setTextColor(lightTextColor);
        doc.text('BANKA / ŞUBE', margin + 5, infoY);

        doc.setFontSize(11);
        doc.setTextColor(textColor);
        doc.setFont('Roboto', 'bold');
        doc.text(`${hesap.banka.ad} ${hesap.banka.sube ? `/ ${hesap.banka.sube}` : ''}`, margin + 5, infoY + 6);

        doc.setFontSize(8);
        doc.setTextColor(lightTextColor);
        doc.setFont('Roboto', 'normal');
        doc.text('HESAP ADI', margin + 5, infoY + 14);

        doc.setFontSize(11);
        doc.setTextColor(textColor);
        doc.setFont('Roboto', 'bold');
        doc.text(hesap.hesapAdi, margin + 5, infoY + 20);

        // Orta Kolon: Hesap Detayları
        const midX = pageWidth / 2;
        doc.setFontSize(8);
        doc.setTextColor(lightTextColor);
        doc.setFont('Roboto', 'normal');
        doc.text('HESAP TÜRÜ', midX, infoY);

        doc.setFontSize(11);
        doc.setTextColor(textColor);
        doc.setFont('Roboto', 'bold');
        const hesapTipiStr = {
            VADESIZ: 'Vadesiz Mevduat',
            POS: 'POS Hesabı',
            KREDI: 'Ticari Kredi',
            FIRMA_KREDI_KARTI: 'Kredi Kartı'
        }[hesap.hesapTipi] || hesap.hesapTipi;
        doc.text(hesapTipiStr, midX, infoY + 6);

        if (hesap.iban) {
            doc.setFontSize(8);
            doc.setTextColor(lightTextColor);
            doc.setFont('Roboto', 'normal');
            doc.text('IBAN', midX, infoY + 14);

            doc.setFontSize(11);
            doc.setTextColor(textColor);
            doc.setFont('Roboto', 'bold');
            doc.text(hesap.iban, midX, infoY + 20);
        }

        // Sağ Kolon: Bakiye (Vurgulu)
        const rightX = pageWidth - margin - 5;
        doc.setFontSize(8);
        doc.setTextColor(lightTextColor);
        doc.setFont('Roboto', 'normal');
        const bakiyeLabel = 'GÜNCEL BAKİYE';
        const bakiyeLabelW = doc.getTextWidth(bakiyeLabel);
        doc.text(bakiyeLabel, rightX - bakiyeLabelW, infoY);

        doc.setFontSize(16);
        doc.setTextColor(primaryColor); // Mavi renk
        doc.setFont('Roboto', 'bold');
        const bakiyeStr = formatCurrency(Number(hesap.bakiye));
        const bakiyeW = doc.getTextWidth(bakiyeStr);
        doc.text(bakiyeStr, rightX - bakiyeW, infoY + 8);

        y += 45; // Kart bitişi
        // --- Hesap Bilgileri Bitiş ---

        // --- Tablo Başlıkları ---
        const cellPadding = 3;
        // Tarih kolonunu genişlettim, diğerlerini öteledim
        const colX = { date: margin, type: margin + 30, desc: margin + 70, amount: pageWidth - margin - 35, bal: pageWidth - margin };

        doc.setFillColor(primaryColor);
        doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');

        doc.setFontSize(9);
        doc.setTextColor('#ffffff');
        doc.setFont('Roboto', 'bold');

        doc.text('TARİH', colX.date + 2, y + 5.5);
        doc.text('İŞLEM', colX.type + 2, y + 5.5);
        doc.text('AÇIKLAMA', colX.desc + 2, y + 5.5);
        doc.text('TUTAR', colX.amount - 2, y + 5.5, { align: 'right' });
        doc.text('BAKİYE', colX.bal - 2, y + 5.5, { align: 'right' });

        y += 10;
        // --- Tablo Başlıkları Bitiş ---

        // --- Satırlar ---
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(textColor);

        hareketler.forEach((h, index) => {
            // Sayfa sonu kontrolü
            if (y > pageHeight - margin - 20) {
                doc.addPage();
                y = margin + 10;

                // Yeni sayfada başlıkları tekrar yaz
                doc.setFillColor(primaryColor);
                doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
                doc.setFontSize(9);
                doc.setTextColor('#ffffff');
                doc.setFont('helvetica', 'bold');
                doc.text('TARİH', colX.date + 2, y + 5.5);
                doc.text('İŞLEM', colX.type + 2, y + 5.5);
                doc.text('AÇIKLAMA', colX.desc + 2, y + 5.5);
                doc.text('TUTAR', colX.amount - 2, y + 5.5, { align: 'right' });
                doc.text('BAKİYE', colX.bal - 2, y + 5.5, { align: 'right' });
                y += 10;

                doc.setFont('Roboto', 'normal');
                doc.setTextColor(textColor);
            }

            // Zebra stili arka plan
            if (index % 2 === 1) {
                doc.setFillColor(secondaryColor);
                doc.rect(margin, y - 4, pageWidth - (margin * 2), 14, 'F');
            }

            const rowY = y + 2;

            // Tarih (Sadece gün.ay.yıl)
            doc.text(new Date(h.tarih).toLocaleDateString('tr-TR'), colX.date + 2, rowY);

            // İşlem Tipi
            const typeStr = h.hareketTipi === 'GELEN' ? (h.hareketAltTipi === 'HAVALE_GELEN' ? 'Gelen Havale' : 'Giriş') : (h.hareketAltTipi === 'HAVALE_GIDEN' ? 'Giden Havale' : 'Çıkış');
            doc.text(typeStr, colX.type + 2, rowY);

            // Tutar
            const tutarStr = formatCurrency(h.tutar);
            if (h.hareketTipi === 'GELEN') {
                doc.setTextColor('#16a34a'); // Yeşil
                doc.text('+' + tutarStr, colX.amount - 2, rowY, { align: 'right' });
            } else {
                doc.setTextColor('#dc2626'); // Kırmızı
                doc.text('-' + tutarStr, colX.amount - 2, rowY, { align: 'right' });
            }
            doc.setTextColor(textColor); // Siyaha dön

            // Bakiye
            doc.text(formatCurrency(h.bakiye), colX.bal - 2, rowY, { align: 'right' });

            // Açıklama (Wrap text)
            const aciklama = h.aciklama || '-';
            const splitDesc = doc.splitTextToSize(aciklama, colX.amount - colX.desc - 5);
            doc.text(splitDesc, colX.desc + 2, rowY);

            // Satır yüksekliğini hesapla
            const lineHeight = Math.max(14, splitDesc.length * 5 + 4);
            y += lineHeight;
        });

        // --- Footer ---
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(lightTextColor);
            doc.text(`Sayfa ${i} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            doc.text(`Bu belge ${new Date().toLocaleString('tr-TR')} tarihinde oluşturulmuştur.`, margin, pageHeight - 10);

            // Alt çizgi
            doc.setDrawColor(secondaryColor);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        }

        doc.save(`${hesap.hesapAdi}_ekstre_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };



    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const columns: GridColDef[] = [
        {
            field: 'tarih',
            headerName: 'Tarih',
            width: 160,
            valueFormatter: (value) => formatDate(value),
        },
        {
            field: 'hareketTipi',
            headerName: 'Tip',
            width: 100,
            renderCell: (params) => (
                <Chip
                    icon={params.value === 'GELEN' ? <TrendingUp /> : <TrendingDown />}
                    label={params.value === 'GELEN' ? 'Gelen' : 'Giden'}
                    color={params.value === 'GELEN' ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'hareketAltTipi',
            headerName: 'Alt Tip',
            width: 130,
            valueFormatter: (value) => {
                const labels: Record<string, string> = {
                    HAVALE_GELEN: 'Gelen Havale',
                    HAVALE_GIDEN: 'Giden Havale',
                    POS_TAHSILAT: 'POS Tahsilat',
                    KREDI_KULLANIM: 'Kredi Kullanım',
                    KREDI_ODEME: 'Kredi Ödeme',
                    KART_HARCAMA: 'Kart Harcama',
                    KART_ODEME: 'Kart Ödeme',
                };
                return labels[value] || value || '-';
            }
        },
        {
            field: 'tutar',
            headerName: 'Tutar',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => (
                <Typography fontWeight="600" color={params.row.hareketTipi === 'GELEN' ? 'success.main' : 'error.main'}>
                    {params.row.hareketTipi === 'GELEN' ? '+' : '-'}{formatCurrency(Number(params.value))}
                </Typography>
            )
        },
        {
            field: 'komisyonTutar',
            headerName: 'Komisyon',
            width: 110,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (value) => value ? formatCurrency(Number(value)) : '-',
        },
        {
            field: 'netTutar',
            headerName: 'Net Tutar',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params) => params.value ? (
                <Typography fontWeight="600" color="primary">
                    {formatCurrency(Number(params.value))}
                </Typography>
            ) : '-'
        },
        {
            field: 'bakiye',
            headerName: 'Bakiye',
            width: 130,
            align: 'right',
            headerAlign: 'right',
            valueFormatter: (value) => formatCurrency(Number(value)),
        },
        {
            field: 'aciklama',
            headerName: 'Açıklama',
            flex: 1,
            minWidth: 200,
        },
        {
            field: 'referansNo',
            headerName: 'Referans',
            width: 120,
        },
    ];

    if (loading) {
        return (
            <MainLayout>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                    <Grid container spacing={3}>
                        {[1, 2, 3].map(i => (
                            <Grid key={i} size={{ xs: 12, md: 4 }}>
                                <Skeleton variant="rectangular" height={100} />
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </MainLayout>
        );
    }

    if (!hesap) return null;

    const hesapTipiLabels: Record<string, string> = {
        VADESIZ: 'Vadesiz Hesap',
        POS: 'POS Hesabı',
        KREDI: 'Ticari Kredi',
        FIRMA_KREDI_KARTI: 'Firma Kredi Kartı',
    };

    return (
        <MainLayout>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header Section */}
                <Box sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: 'var(--radius-md)',
                    bgcolor: 'var(--card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '200px',
                        height: '100%',
                        background: 'radial-gradient(circle at top right, color-mix(in srgb, var(--primary) 5%, transparent), transparent 70%)',
                        zIndex: 0
                    }} />

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => router.push(`/banka/${hesap.banka.id}`)}
                            sx={{
                                mb: 1,
                                color: 'var(--muted-foreground)',
                                '&:hover': { color: 'var(--primary)', bgcolor: 'color-mix(in srgb, var(--primary) 8%, transparent)' },
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                py: 0.5
                            }}
                        >
                            {hesap.banka.ad} Hesaplarına Dön
                        </Button>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant="h5" sx={{
                                    fontWeight: 800,
                                    color: 'var(--foreground)',
                                    letterSpacing: '-0.02em',
                                    mb: 0.5
                                }}>
                                    {hesap.hesapAdi}
                                </Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Chip
                                        label={hesapTipiLabels[hesap.hesapTipi]}
                                        sx={{
                                            bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                                            color: 'var(--primary)',
                                            fontWeight: 700,
                                            borderRadius: 'var(--radius-sm)',
                                            height: 22,
                                            fontSize: '0.6875rem'
                                        }}
                                    />
                                    <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                        Kod: <Box component="span" sx={{ color: 'var(--foreground)', fontWeight: 600 }}>{hesap.hesapKodu}</Box>
                                    </Typography>
                                    {hesap.iban && (
                                        <>
                                            <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                                IBAN: <Box component="span" sx={{ color: 'var(--foreground)', fontWeight: 600, letterSpacing: '0.02em' }}>{hesap.iban}</Box>
                                            </Typography>
                                        </>
                                    )}
                                </Stack>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                {hesap.hesapTipi === 'POS' ? (
                                    <Button
                                        variant="contained"
                                        size="medium"
                                        startIcon={<CreditCard />}
                                        onClick={() => {
                                            resetPos();
                                            setPosDialogOpen(true);
                                        }}
                                        sx={{
                                            bgcolor: 'var(--chart-2)',
                                            color: 'white',
                                            px: 3,
                                            height: 38,
                                            borderRadius: 'var(--radius-sm)',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            boxShadow: '0 2px 8px color-mix(in srgb, var(--chart-2) 20%, transparent)',
                                            '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-2) 90%, black)' }
                                        }}
                                    >
                                        POS Tahsilat
                                    </Button>
                                ) : hesap.hesapTipi === 'KREDI' ? (
                                    <Button
                                        variant="contained"
                                        size="medium"
                                        startIcon={<CreditCard />}
                                        onClick={() => {
                                            setCreditDialogOpen(true);
                                        }}
                                        sx={{
                                            bgcolor: 'var(--chart-4)',
                                            color: 'white',
                                            px: 3,
                                            height: 38,
                                            borderRadius: 'var(--radius-sm)',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            boxShadow: '0 2px 8px color-mix(in srgb, var(--chart-4) 20%, transparent)',
                                            '&:hover': { bgcolor: 'color-mix(in srgb, var(--chart-4) 90%, black)' }
                                        }}
                                    >
                                        Kredi Kullan
                                    </Button>
                                ) : hesap.hesapTipi === 'FIRMA_KREDI_KARTI' ? null : (
                                    <Button
                                        variant="contained"
                                        size="medium"
                                        startIcon={<Add />}
                                        onClick={() => {
                                            reset();
                                            setDialogOpen(true);
                                        }}
                                        sx={{
                                            bgcolor: 'var(--primary)',
                                            color: 'white',
                                            px: 3,
                                            height: 38,
                                            borderRadius: 'var(--radius-sm)',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 20%, transparent)',
                                            '&:hover': { bgcolor: 'color-mix(in srgb, var(--primary) 90%, black)' }
                                        }}
                                    >
                                        Yeni Hareket
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            borderLeft: '4px solid var(--primary)',
                            bgcolor: 'var(--card)',
                            boxShadow: 'var(--shadow-sm)',
                        }}>
                            <CardContent sx={{ p: 2 }}>
                                <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, mb: 0.5, display: 'block' }}>Güncel Bakiye</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                                    {formatCurrency(Number(hesap.bakiye))}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {hesap.hesapTipi === 'POS' && hesap.komisyonOrani && (
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                borderLeft: '4px solid var(--chart-3)',
                                bgcolor: 'var(--card)',
                                boxShadow: 'var(--shadow-sm)',
                            }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, mb: 0.5, display: 'block' }}>Komisyon Oranı</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--chart-3)', letterSpacing: '-0.02em' }}>
                                        %{Number(hesap.komisyonOrani)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    {hesap.hesapTipi === 'KREDI' && hesap.krediLimiti && (
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card sx={{
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                borderLeft: '4px solid var(--chart-4)',
                                bgcolor: 'var(--card)',
                                boxShadow: 'var(--shadow-sm)',
                            }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, mb: 0.5, display: 'block' }}>Kredi Limiti</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--chart-4)', letterSpacing: '-0.02em' }}>
                                        {formatCurrency(Number(hesap.krediLimiti))}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    {hesap.hesapTipi === 'FIRMA_KREDI_KARTI' && (
                        <>
                            {hesap.kartLimiti && (
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Card sx={{
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        borderLeft: '4px solid var(--chart-5)',
                                        bgcolor: 'var(--card)',
                                        boxShadow: 'var(--shadow-sm)',
                                    }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, mb: 0.5, display: 'block' }}>Kart Limiti</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--chart-5)', letterSpacing: '-0.02em' }}>
                                                {formatCurrency(Number(hesap.kartLimiti))}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Card sx={{
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    borderLeft: '4px solid var(--chart-1)',
                                    bgcolor: 'var(--card)',
                                    boxShadow: 'var(--shadow-sm)',
                                }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600, mb: 0.5, display: 'block' }}>Hesap Kesim / Son Ödeme</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--chart-1)', letterSpacing: '-0.02em' }}>
                                            {hesap.hesapKesimGunu}. gün / {hesap.sonOdemeGunu}. gün
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>

                {/* Credit Loan List */}
                {hesap.hesapTipi === 'KREDI' && (
                    <CreditLoanList hesapId={hesapId} refreshTrigger={refreshTrigger} />
                )}

                {/* Transactions List */}
                <Card sx={{
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    bgcolor: 'var(--card)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden'
                }}>
                    <CardContent sx={{ p: 0 }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 3,
                            borderBottom: '1px solid var(--border)',
                            bgcolor: 'color-mix(in srgb, var(--muted) 30%, transparent)'
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>Hesap Hareketleri</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" startIcon={<FileDownload />} variant="outlined" onClick={handleExcelExport}>
                                    Excel
                                </Button>
                                <Button size="small" startIcon={<PictureAsPdf />} variant="outlined" onClick={handlePdfExport}>
                                    PDF
                                </Button>
                            </Box>
                        </Box>

                        <DataGrid
                            rows={hareketler}
                            columns={columns}
                            autoHeight
                            pageSizeOptions={[10, 25, 50, 100]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 25 } },
                                sorting: { sortModel: [{ field: 'tarih', sort: 'desc' }] }
                            }}
                            disableRowSelectionOnClick
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    bgcolor: 'var(--muted)',
                                    color: 'var(--muted-foreground)',
                                    fontWeight: 700,
                                    borderBottom: '1px solid var(--border)',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid var(--border)',
                                    py: 1.5
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '1px solid var(--border)',
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Regular Transaction Dialog */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Yeni Hareket Ekle</DialogTitle>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogContent>
                            <Stack spacing={2.5}>
                                <Controller
                                    name="hareketTipi"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField select fullWidth label="Hareket Tipi" {...field}>
                                            <MenuItem value="GELEN">Gelen (Para Girişi)</MenuItem>
                                            <MenuItem value="GIDEN">Giden (Para Çıkışı)</MenuItem>
                                        </TextField>
                                    )}
                                />

                                <Controller
                                    name="tutar"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="number"
                                            label="Tutar"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₺</InputAdornment>
                                            }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="aciklama"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} fullWidth label="Açıklama" multiline rows={2} />
                                    )}
                                />

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="referansNo"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} fullWidth label="Referans No" />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="tarih"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} fullWidth type="date" label="Tarih" InputLabelProps={{ shrink: true }} />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={() => setDialogOpen(false)}>İptal</Button>
                            <Button type="submit" variant="contained">Kaydet</Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* POS Tahsilat Dialog */}
                <Dialog open={posDialogOpen} onClose={() => setPosDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>POS Tahsilatı</DialogTitle>
                    <form onSubmit={handlePosSubmit(onPosSubmit)}>
                        <DialogContent>
                            <Stack spacing={2.5}>
                                <Alert severity="info" sx={{ mb: 1 }}>
                                    Komisyon oranı: <strong>%{hesap?.komisyonOrani || 0}</strong>. Komisyon tutarı brüt tutardan düşülerek hesaba net tutar eklenecektir.
                                </Alert>

                                <Controller
                                    name="tutar"
                                    control={posControl}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="number"
                                            label="Brüt Tahsilat Tutarı"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₺</InputAdornment>
                                            }}
                                        />
                                    )}
                                />

                                {posHesaplama && (
                                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 4 }}>
                                                <Typography variant="caption" color="text.secondary">Brüt Tutar</Typography>
                                                <Typography fontWeight="600">{formatCurrency(posTutar)}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 4 }}>
                                                <Typography variant="caption" color="text.secondary">Komisyon</Typography>
                                                <Typography fontWeight="600" color="error.main">
                                                    -{formatCurrency(posHesaplama.komisyon)}
                                                </Typography>
                                            </Grid>
                                            <Grid size={{ xs: 4 }}>
                                                <Typography variant="caption" color="text.secondary">Net Tutar</Typography>
                                                <Typography fontWeight="bold" color="success.main">
                                                    {formatCurrency(posHesaplama.net)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                )}

                                <Controller
                                    name="aciklama"
                                    control={posControl}
                                    render={({ field }) => (
                                        <TextField {...field} fullWidth label="Açıklama" multiline rows={2} />
                                    )}
                                />

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="referansNo"
                                            control={posControl}
                                            render={({ field }) => (
                                                <TextField {...field} fullWidth label="Referans No" />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Controller
                                            name="tarih"
                                            control={posControl}
                                            render={({ field }) => (
                                                <TextField {...field} fullWidth type="date" label="Tarih" InputLabelProps={{ shrink: true }} />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={() => setPosDialogOpen(false)}>İptal</Button>
                            <Button type="submit" variant="contained" color="success">Tahsilat Kaydet</Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Credit Usage Dialog */}
                <CreateCreditDialog
                    open={creditDialogOpen}
                    onClose={() => setCreditDialogOpen(false)}
                    onSubmit={handleCreditSubmit}
                />
            </Container>
        </MainLayout>
    );
}
