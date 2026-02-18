import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Collapse,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
    Visibility
} from '@mui/icons-material';
import axios from '@/lib/axios';
import CreditPlanDialog from './CreditPlanDialog';

// Interfaces
export interface KrediPlan {
    id: string;
    taksitNo: number;
    vadeTarihi: string;
    tutar: number;
    odenen: number;
    durum: 'BEKLIYOR' | 'ODENDI' | 'GECIKMEDE' | 'KISMI_ODENDI';
}

export interface Kredi {
    id: string;
    tutar: number;
    toplamGeriOdeme: number;
    taksitSayisi: number;
    baslangicTarihi: string;
    aciklama?: string;
    durum: 'AKTIF' | 'KAPANDI' | 'IPTAL';
    createdAt: string;
    planlar?: KrediPlan[];
}

interface CreditLoanListProps {
    hesapId: string;
    refreshTrigger: number;
}

function Row({ row, onPlanClick }: { row: Kredi; onPlanClick: (kredi: Kredi) => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState<Kredi | null>(null);

    const loadDetails = async () => {
        if (details || loading) return;
        try {
            setLoading(true);
            const res = await axios.get(`/banka/kredi/${row.id}`);
            setDetails(res.data);
        } catch (error) {
            console.error('Kredi detayları yüklenemedi', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExpand = () => {
        const newOpen = !open;
        setOpen(newOpen);
        if (newOpen && !details) {
            loadDetails();
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(val));
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('tr-TR');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AKTIF': return 'primary';
            case 'KAPANDI': return 'success';
            case 'IPTAL': return 'error';
            default: return 'default';
        }
    };

    const getPlanStatusColor = (status: string) => {
        switch (status) {
            case 'ODENDI': return 'success';
            case 'GECIKMEDE': return 'error';
            case 'KISMI_ODENDI': return 'warning';
            default: return 'default';
        }
    };

    // Calculate end date from plans if available, or fallback to start date + installments
    const calculateEndDate = () => {
        if (row.planlar && row.planlar.length > 0) {
            return row.planlar[row.planlar.length - 1].vadeTarihi;
        }

        // Fallback: Add (taksitSayisi - 1) months to start date
        // Since first installment is usually 1 month after start date
        try {
            const date = new Date(row.baslangicTarihi);
            date.setMonth(date.getMonth() + (row.taksitSayisi || 1));
            return date.toISOString();
        } catch (e) {
            return null;
        }
    };

    const bitisTarihi = calculateEndDate();

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={handleExpand}
                    >
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {formatDate(row.baslangicTarihi)}
                </TableCell>
                <TableCell>
                    {bitisTarihi ? formatDate(bitisTarihi) : '-'}
                </TableCell>
                <TableCell align="right">{formatCurrency(row.tutar)}</TableCell>
                <TableCell align="right">{formatCurrency(row.toplamGeriOdeme)}</TableCell>
                <TableCell align="right">
                    {formatCurrency((row.planlar || []).reduce((sum, p) => sum + (Number(p.tutar) - Number(p.odenen || 0)), 0))}
                </TableCell>
                <TableCell align="right">{row.taksitSayisi}</TableCell>
                <TableCell>{row.aciklama || '-'}</TableCell>
                <TableCell>
                    <Chip label={row.durum} color={getStatusColor(row.durum) as any} size="small" />
                </TableCell>
                <TableCell align="center">
                    <IconButton
                        size="small"
                        onClick={() => onPlanClick(row)}
                        title="Ödeme Planı"
                        color="primary"
                    >
                        <Visibility fontSize="small" />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem' }}>
                                Ödeme Planı
                            </Typography>
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : details ? (
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Taksit No</TableCell>
                                            <TableCell>Vade Tarihi</TableCell>
                                            <TableCell align="right">Tutar</TableCell>
                                            <TableCell align="right">Ödenen</TableCell>
                                            <TableCell align="center">Durum</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {details.planlar?.map((plan) => (
                                            <TableRow key={plan.id}>
                                                <TableCell>{plan.taksitNo}</TableCell>
                                                <TableCell>{formatDate(plan.vadeTarihi)}</TableCell>
                                                <TableCell align="right">{formatCurrency(plan.tutar)}</TableCell>
                                                <TableCell align="right">{formatCurrency(plan.odenen)}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={plan.durum}
                                                        color={getPlanStatusColor(plan.durum) as any}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <Alert severity="warning">Plan detayları bulunamadı.</Alert>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function CreditLoanList({ hesapId, refreshTrigger }: CreditLoanListProps) {
    const [krediler, setKrediler] = useState<Kredi[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedKrediId, setSelectedKrediId] = useState<string | null>(null);

    const selectedKrediForPlan = useMemo(() =>
        krediler.find(k => k.id === selectedKrediId),
        [krediler, selectedKrediId]
    );

    const fetchKrediler = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/banka/hesap/${hesapId}/krediler`);
            setKrediler(res.data);
        } catch (error) {
            console.error('Krediler yüklenemedi', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hesapId) fetchKrediler();
    }, [hesapId, refreshTrigger]);

    if (loading && krediler.length === 0) return null; // Only hide initial load
    if (!loading && krediler.length === 0) return null;

    return (
        <Card sx={{ borderRadius: 3, mb: 4 }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Krediler</Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Başlangıç Tarihi</TableCell>
                                <TableCell>Bitiş Tarihi</TableCell>
                                <TableCell align="right">Kredi Tutarı</TableCell>
                                <TableCell align="right">Toplam Borç</TableCell>
                                <TableCell align="right">Kalan Borç</TableCell>
                                <TableCell align="right">Taksit</TableCell>
                                <TableCell>Açıklama</TableCell>
                                <TableCell>Durum</TableCell>
                                <TableCell align="center">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {krediler.map((kredi) => (
                                <Row
                                    key={kredi.id}
                                    row={kredi}
                                    onPlanClick={(k) => setSelectedKrediId(k.id)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Credit Plan Dialog */}
                {selectedKrediId && selectedKrediForPlan && (
                    <CreditPlanDialog
                        open={true}
                        onClose={() => setSelectedKrediId(null)}
                        onUpdate={fetchKrediler}
                        kredi={selectedKrediForPlan as any}
                    />
                )}
            </CardContent>
        </Card>
    );
}
