import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    TextField,
    Chip,
    Typography,
    Box,
    Stack,
    Paper,
    Divider,
    Alert,
    Tooltip,
    alpha,
    Grid
} from '@mui/material';
import {
    Edit,
    Save,
    Close,
    CalendarMonth,
    Delete,
    AddCircle,
    Info,
    ReceiptLong,
    TrendingFlat,
    Payment
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from '@/lib/axios';
import PayInstallmentDialog from './PayInstallmentDialog';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

interface Plan {
    id: string;
    taksitNo: number;
    vadeTarihi: string;
    odenen: number;
    durum: string;
    tutar: number;
}

interface CreditPlanDialogProps {
    open: boolean;
    onClose: () => void;
    onUpdate: () => void;
    kredi: {
        id: string;
        tutar: number; // Ana para
        toplamGeriOdeme: number;
        planlar?: Plan[];
    };
}

export default function CreditPlanDialog({ open, onClose, onUpdate, kredi }: CreditPlanDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editValues, setEditValues] = useState<{ tutar: string; vadeTarihi: string }>({
        tutar: '',
        vadeTarihi: new Date().toISOString().split('T')[0]
    });
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<Plan | null>(null);

    // Mernis-style sorting: Closest date first
    const sortedPlans = useMemo(() => {
        return [...(kredi.planlar || [])].sort((a, b) =>
            new Date(a.vadeTarihi).getTime() - new Date(b.vadeTarihi).getTime()
        );
    }, [kredi.planlar]);

    const totalPlanned = useMemo(() => {
        return (kredi.planlar || []).reduce((sum, p) => sum + Number(p.tutar), 0);
    }, [kredi.planlar]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEditClick = (plan: Plan) => {
        setEditingId(plan.id);
        const date = new Date(plan.vadeTarihi);
        setEditValues({
            tutar: plan.tutar.toString(),
            vadeTarihi: date.toISOString().split('T')[0]
        });
    };

    const handleSave = async (id: string) => {
        try {
            await axios.put(`/banka/kredi-plan/${id}`, {
                tutar: parseFloat(editValues.tutar),
                vadeTarihi: editValues.vadeTarihi
            });
            enqueueSnackbar('Taksit güncellendi', { variant: 'success' });
            setEditingId(null);
            onUpdate();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Hata oluştu', { variant: 'error' });
        }
    };

    const handleAdd = async () => {
        try {
            await axios.post(`/banka/kredi/${kredi.id}/plan`, {
                tutar: parseFloat(editValues.tutar),
                vadeTarihi: editValues.vadeTarihi
            });
            enqueueSnackbar('Yeni taksit eklendi', { variant: 'success' });
            setIsAdding(false);
            setEditValues({ tutar: '', vadeTarihi: new Date().toISOString().split('T')[0] });
            onUpdate();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Taksit eklenemedi', { variant: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu taksiti silmek istediğinize emin misiniz?')) return;
        try {
            await axios.delete(`/banka/kredi-plan/${id}`);
            enqueueSnackbar('Taksit silindi', { variant: 'success' });
            onUpdate();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.message || 'Taksit silinemedi', { variant: 'error' });
        }
    };

    const handleExcelExport = () => {
        if (!sortedPlans.length) return;

        const dataToExport = sortedPlans.map(p => ({
            'Taksit No': p.taksitNo,
            'Vade Tarihi': formatDate(p.vadeTarihi),
            'Tutar': p.tutar,
            'Ödenen': p.odenen,
            'Kalan': p.tutar - p.odenen,
            'Durum': p.durum
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ödeme Planı");
        XLSX.writeFile(wb, `kredi_${kredi.id}_odeme_plani.xlsx`);
    };

    const handlePdfExport = async () => {
        if (!sortedPlans.length) return;

        const doc = new jsPDF();

        // Fontları yükle
        try {
            const fontUrl = '/fonts/Roboto-Regular.ttf';
            const fontBoldUrl = '/fonts/Roboto-Bold.ttf';

            console.log('Fontlar yükleniyor...', { fontUrl, fontBoldUrl });

            const fontRes = await fetch(fontUrl);
            const fontBoldRes = await fetch(fontBoldUrl);

            if (!fontRes.ok || !fontBoldRes.ok) {
                throw new Error(`Font dosyaları yüklenemedi: ${fontRes.status} / ${fontBoldRes.status}`);
            }

            const fontBytes = await fontRes.arrayBuffer();
            const fontBoldBytes = await fontBoldRes.arrayBuffer();

            console.log('Font bytes alındı:', { regular: fontBytes.byteLength, bold: fontBoldBytes.byteLength });

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
            console.log('Fontlar başarıyla yüklendi ve atandı.');
        } catch (e) {
            console.error("Font yükleme hatası:", e);
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
        const title = 'KREDİ ÖDEME PLANI';
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, pageWidth - margin - titleWidth, y + 10);

        doc.setFontSize(10);
        doc.setTextColor(lightTextColor);
        doc.setFont('Roboto', 'normal');
        const dateStr = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
        const dateWidth = doc.getTextWidth(dateStr);
        doc.text(dateStr, pageWidth - margin - dateWidth, y + 16);

        y += 30; // Header bitişi

        // --- Kredi Bilgileri Kartı ---
        // Arka plan
        doc.setFillColor(secondaryColor);
        doc.roundedRect(margin, y, pageWidth - (margin * 2), 25, 3, 3, 'F');

        // Sol Kolon: Kredi ID
        let infoY = y + 10;
        doc.setFontSize(8);
        doc.setTextColor(lightTextColor);
        doc.text('KREDİ ID', margin + 5, infoY);

        doc.setFontSize(11);
        doc.setTextColor(textColor);
        doc.setFont('Roboto', 'bold');
        doc.text(kredi.id.split('-')[0].toUpperCase(), margin + 5, infoY + 6);

        // Orta Kolon: Taksit Sayısı
        const midX = pageWidth / 2;
        doc.setFontSize(8);
        doc.setTextColor(lightTextColor);
        doc.setFont('Roboto', 'normal');
        doc.text('TAKSİT SAYISI', midX, infoY);

        doc.setFontSize(11);
        doc.setTextColor(textColor);
        doc.setFont('Roboto', 'bold');
        doc.text(`${sortedPlans.length} Taksit`, midX, infoY + 6);

        // Sağ Kolon: Toplam Tutar
        const rightX = pageWidth - margin - 5;
        doc.setFontSize(8);
        doc.setTextColor(lightTextColor);
        doc.setFont('Roboto', 'normal');
        const tutarLabel = 'TOPLAM TUTAR';
        const tutarLabelW = doc.getTextWidth(tutarLabel);
        doc.text(tutarLabel, rightX - tutarLabelW, infoY);

        doc.setFontSize(14);
        doc.setTextColor(primaryColor);
        doc.setFont('Roboto', 'bold');
        const tutarStr = formatCurrency(kredi.toplamGeriOdeme);
        const tutarW = doc.getTextWidth(tutarStr);
        doc.text(tutarStr, rightX - tutarW, infoY + 7);

        y += 35; // Kart bitişi

        // --- Tablo Başlıkları ---
        const colX = {
            no: margin,
            date: margin + 20,
            amount: margin + 60,
            paid: margin + 100,
            per: margin + 140, // Yüzde
            status: pageWidth - margin
        };

        doc.setFillColor(primaryColor);
        doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');

        doc.setFontSize(9);
        doc.setTextColor('#ffffff');
        doc.setFont('Roboto', 'bold');

        doc.text('NO', colX.no + 2, y + 5.5);
        doc.text('VADE TARİHİ', colX.date + 2, y + 5.5);
        doc.text('TUTAR', colX.amount - 2, y + 5.5, { align: 'right' });
        doc.text('ÖDENEN', colX.paid - 2, y + 5.5, { align: 'right' });
        doc.text('DURUM', colX.status - 2, y + 5.5, { align: 'right' });

        y += 10;

        // --- Satırlar ---
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(textColor);

        sortedPlans.forEach((plan, index) => {
            // Sayfa sonu kontrolü
            if (y > pageHeight - margin - 20) {
                doc.addPage();
                y = margin + 10;

                // Başlıkları tekrar yaz
                doc.setFillColor(primaryColor);
                doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
                doc.setFontSize(9);
                doc.setTextColor('#ffffff');
                doc.setFont('Roboto', 'bold');
                doc.text('NO', colX.no + 2, y + 5.5);
                doc.text('VADE TARİHİ', colX.date + 2, y + 5.5);
                doc.text('TUTAR', colX.amount - 2, y + 5.5, { align: 'right' });
                doc.text('ÖDENEN', colX.paid - 2, y + 5.5, { align: 'right' });
                doc.text('DURUM', colX.status - 2, y + 5.5, { align: 'right' });
                y += 10;

                doc.setFont('Roboto', 'normal');
                doc.setTextColor(textColor);
            }

            // Zebra stili
            if (index % 2 === 1) {
                doc.setFillColor(secondaryColor);
                doc.rect(margin, y - 4, pageWidth - (margin * 2), 9, 'F');
            }

            const rowY = y + 2;

            doc.text(plan.taksitNo.toString(), colX.no + 2, rowY);
            doc.text(new Date(plan.vadeTarihi).toLocaleDateString('tr-TR'), colX.date + 2, rowY);
            doc.text(formatCurrency(plan.tutar), colX.amount - 2, rowY, { align: 'right' });

            // Ödenen Tutar (Varsa yeşil)
            if (plan.odenen > 0) {
                doc.setTextColor('#16a34a');
            }
            doc.text(formatCurrency(plan.odenen), colX.paid - 2, rowY, { align: 'right' });
            doc.setTextColor(textColor);

            // Durum
            let durumText = plan.durum;
            let durumColor = textColor;
            switch (plan.durum) {
                case 'ODENDI': durumText = 'ÖDENDİ'; durumColor = '#16a34a'; break;
                case 'GECIKMEDE': durumText = 'GECİKTİ'; durumColor = '#dc2626'; break;
                case 'KISMI_ODENDI': durumText = 'KISMI ÖDENDİ'; durumColor = '#ca8a04'; break;
                case 'BEKLIYOR': durumText = 'BEKLİYOR'; durumColor = '#6b7280'; break;
            }
            doc.setTextColor(durumColor);
            doc.setFont('Roboto', 'bold');
            doc.text(durumText, colX.status - 2, rowY, { align: 'right' });
            doc.setFont('Roboto', 'normal');
            doc.setTextColor(textColor);

            y += 9;
        });

        // --- Footer ---
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(lightTextColor);
            doc.text(`Sayfa ${i} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            doc.text(`Bu belge ${new Date().toLocaleString('tr-TR')} tarihinde oluşturulmuştur.`, margin, pageHeight - 10);
            doc.setDrawColor(secondaryColor);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        }

        doc.save(`kredi_${kredi.id}_odeme_plani.pdf`);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, bgcolor: '#f8fafc' }
            }}
        >
            <DialogTitle sx={{
                p: 3,
                pb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'white',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha('#2563eb', 0.1),
                        color: '#2563eb',
                        display: 'flex'
                    }}>
                        <ReceiptLong />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="700">Ödeme Planı Yönetimi</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Kredi ID: {kredi.id.split('-')[0]}...
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReceiptLong />}
                        onClick={handleExcelExport}
                    >
                        Excel
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReceiptLong />}
                        onClick={handlePdfExport}
                    >
                        PDF
                    </Button>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, mt: 1 }}>
                {/* Summary Header Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="600">ANA PARA</Typography>
                            <Typography variant="h6" fontWeight="700" color="primary">{formatCurrency(kredi.tutar)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="600">PLANLANAN TOPLAM</Typography>
                            <Typography variant="h6" fontWeight="700" color="success.main">{formatCurrency(totalPlanned)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: alpha('#f59e0b', 0.05) }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="600">FAİZ YÜKÜ</Typography>
                            <Typography variant="h6" fontWeight="700" color="warning.main">
                                {formatCurrency(totalPlanned - kredi.tutar)}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Taksitler <Chip label={sortedPlans.length} size="small" sx={{ fontWeight: 700 }} />
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddCircle />}
                        onClick={() => {
                            setIsAdding(true);
                            setEditingId(null);
                        }}
                        disabled={isAdding}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        Yeni Taksit Ekle
                    </Button>
                </Box>

                <Stack spacing={2}>
                    {/* Add Mode Form */}
                    {isAdding && (
                        <Paper sx={{ p: 2, border: '2px dashed', borderColor: 'primary.main', bgcolor: alpha('#2563eb', 0.02) }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 12, sm: 5 }}>
                                    <TextField
                                        label="Vade Tarihi"
                                        type="date"
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        value={editValues.vadeTarihi}
                                        onChange={(e) => setEditValues({ ...editValues, vadeTarihi: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Taksit Tutarı"
                                        type="number"
                                        fullWidth
                                        size="small"
                                        value={editValues.tutar}
                                        onChange={(e) => setEditValues({ ...editValues, tutar: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', gap: 1 }}>
                                    <Button fullWidth variant="contained" color="primary" onClick={handleAdd}>Ekle</Button>
                                    <Button fullWidth variant="outlined" color="inherit" onClick={() => setIsAdding(false)}>İptal</Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {sortedPlans.map((plan, index) => (
                        <Paper
                            key={plan.id}
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: editingId === plan.id ? 'primary.main' : 'divider',
                                position: 'relative',
                                bgcolor: 'white',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    borderColor: editingId === plan.id ? 'primary.main' : 'primary.light'
                                }
                            }}
                        >
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 1 }}>
                                    <Typography variant="h6" color="text.secondary" fontWeight="800" sx={{ opacity: 0.3 }}>
                                        {index + 1}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 11, sm: 4 }}>
                                    {editingId === plan.id ? (
                                        <TextField
                                            type="date"
                                            size="small"
                                            fullWidth
                                            value={editValues.vadeTarihi}
                                            onChange={(e) => setEditValues({ ...editValues, vadeTarihi: e.target.value })}
                                        />
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarMonth sx={{ color: 'text.secondary', fontSize: 20 }} />
                                            <Typography fontWeight="600">{formatDate(plan.vadeTarihi)}</Typography>
                                        </Box>
                                    )}
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    {editingId === plan.id ? (
                                        <TextField
                                            type="number"
                                            size="small"
                                            fullWidth
                                            value={editValues.tutar}
                                            onChange={(e) => setEditValues({ ...editValues, tutar: e.target.value })}
                                        />
                                    ) : (
                                        <Typography fontWeight="700" color="primary">{formatCurrency(plan.tutar)}</Typography>
                                    )}
                                </Grid>
                                <Grid size={{ xs: 6, sm: 2 }}>
                                    <Chip
                                        label={plan.durum === 'ODENDI' ? 'Ödendi' : 'Bekliyor'}
                                        size="small"
                                        color={plan.durum === 'ODENDI' ? 'success' : 'warning'}
                                        variant={plan.durum === 'ODENDI' ? 'filled' : 'outlined'}
                                        sx={{ borderRadius: 1.5, fontWeight: 700, fontSize: '0.7rem' }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    {plan.durum !== 'ODENDI' && (
                                        editingId === plan.id ? (
                                            <>
                                                <Tooltip title="Kaydet"><IconButton color="primary" onClick={() => handleSave(plan.id)}><Save /></IconButton></Tooltip>
                                                <Tooltip title="İptal"><IconButton onClick={() => setEditingId(null)}><Close /></IconButton></Tooltip>
                                            </>
                                        ) : (
                                            <>
                                                <Tooltip title="Ödeme Yap">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => {
                                                            setSelectedPlanForPayment(plan);
                                                            setPaymentDialogOpen(true);
                                                        }}
                                                        sx={{
                                                            bgcolor: alpha('#10b981', 0.1),
                                                            '&:hover': { bgcolor: alpha('#10b981', 0.2) }
                                                        }}
                                                    >
                                                        <Payment fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Düzenle"><IconButton size="small" onClick={() => handleEditClick(plan)}><Edit fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Sil"><IconButton size="small" color="error" onClick={() => handleDelete(plan.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                                            </>
                                        )
                                    )}
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}

                    {sortedPlans.length === 0 && !isAdding && (
                        <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                            Henüz bir ödeme planı oluşturulmamış. Yeni taksit ekleyerek başlayabilirsiniz.
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ mr: 'auto', color: 'text.secondary' }}>
                    <Info fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Taksitlerde yapılan değişiklikler ana kredi bakiyesini etkiler.
                </Typography>
                <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, px: 4 }}>Kapat</Button>
            </DialogActions>

            {selectedPlanForPayment && (
                <PayInstallmentDialog
                    open={paymentDialogOpen}
                    onClose={() => {
                        setPaymentDialogOpen(false);
                        setSelectedPlanForPayment(null);
                    }}
                    onSuccess={() => {
                        onUpdate();
                    }}
                    plan={selectedPlanForPayment}
                />
            )}
        </Dialog>
    );
}
// End of file
