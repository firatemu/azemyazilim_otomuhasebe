'use client';
/**
 * CEO / Executive Dashboard — /yonetim/dashboard
 *
 * Gerçek zamanlı KPI kartları ve grafikleri.
 * - useExecutiveDashboard hook ile SSE bağlantısı (otomatik reconnect)
 * - TanStack Query ile initial data fetch
 * - Recharts ile Nakit Akışı AreaChart + Servis Kapasitesi PieChart
 */
import MainLayout from '@/components/Layout/MainLayout';
import { useExecutiveDashboard } from '@/hooks/useExecutiveDashboard';
import axiosInstance from '@/lib/axios';
import {
    AccountBalance,
    CloudOff,
    CloudQueue,
    DirectionsCar,
    Receipt,
    TrendingDown,
    TrendingUp,
    Warning,
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Skeleton,
    Tooltip,
    Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Tenant ID — gerçek uygulamada auth context'ten alınır
const getTenantId = () =>
    typeof window !== 'undefined'
        ? (localStorage.getItem('tenantId') ?? 'demo')
        : 'demo';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        maximumFractionDigits: 0,
    }).format(value);

const formatK = (value: number) =>
    value >= 1_000_000
        ? `${(value / 1_000_000).toFixed(1)}M₺`
        : `${(value / 1000).toFixed(0)}K₺`;

// ─────────────────────────────────────────────────
// KPI Kart Bileşeni
// ─────────────────────────────────────────────────

interface KpiCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down';
    trendLabel?: string;
    loading?: boolean;
}

function KpiCard({ title, value, subtitle, icon, color, trend, trendLabel, loading }: KpiCardProps) {
    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 4 },
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${color}22`, color, width: 44, height: 44 }}>{icon}</Avatar>
                    {trend && trendLabel && (
                        <Chip
                            size="small"
                            icon={trend === 'up' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                            label={trendLabel}
                            sx={{
                                bgcolor: trend === 'up' ? '#e8f5e9' : '#ffebee',
                                color: trend === 'up' ? '#2e7d32' : '#c62828',
                                fontWeight: 600,
                                fontSize: 11,
                            }}
                        />
                    )}
                </Box>

                {loading ? (
                    <>
                        <Skeleton width="60%" height={36} />
                        <Skeleton width="40%" height={20} />
                    </>
                ) : (
                    <>
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// ─────────────────────────────────────────────────
// Ana Sayfa
// ─────────────────────────────────────────────────

export default function ExecutiveDashboardPage() {
    const tenantId = getTenantId();

    // SSE bağlantısı — KPI_UPDATE, CAPACITY_UPDATE eventleri gelince TQ cache'e yazılır
    const { status: sseStatus } = useExecutiveDashboard({ tenantId });

    // Initial KPI verisi
    const { data: kpis, isLoading: kpisLoading } = useQuery({
        queryKey: ['dashboard-kpis', tenantId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/dashboard/kpis/${tenantId}`);
            return res.data as {
                netCash: number;
                openReceivables: number;
                openPayables: number;
                bankBalance: number;
                activeWorkOrders: number;
                readyForDelivery: number;
                _computedAt: string;
            };
        },
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    // Aylık gelir/gider trend verisi
    const { data: trendData, isLoading: trendLoading } = useQuery({
        queryKey: ['cash-trend', tenantId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/dashboard/cash-trend/${tenantId}`);
            return res.data as Array<{ month: string; gelir: number; gider: number }>;
        },
        staleTime: 300_000,
    });

    const serviceCapacityData = kpis
        ? [
            { name: 'Devam Eden', value: Math.max(0, kpis.activeWorkOrders - kpis.readyForDelivery), color: '#1565c0' },
            { name: 'Teslime Hazır', value: kpis.readyForDelivery, color: '#2e7d32' },
        ]
        : [];

    const sseStatusConfig = {
        connected: { label: 'Canlı', color: 'success' as const, icon: <CloudQueue fontSize="small" /> },
        connecting: { label: 'Bağlanıyor', color: 'warning' as const, icon: <CloudQueue fontSize="small" /> },
        disconnected: { label: 'Çevrimdışı', color: 'default' as const, icon: <CloudOff fontSize="small" /> },
        error: { label: 'Bağlanamadı', color: 'error' as const, icon: <Warning fontSize="small" /> },
    };
    const sseConf = sseStatusConfig[sseStatus] ?? sseStatusConfig.disconnected;

    return (
        <MainLayout>
            <Box sx={{ p: { xs: 2, md: 3 } }}>

                {/* Başlık + SSE Durum */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            Yönetim Paneli
                        </Typography>
                        {kpis?._computedAt && (
                            <Typography variant="caption" color="text.secondary">
                                Son güncelleme: {new Date(kpis._computedAt).toLocaleString('tr-TR')}
                            </Typography>
                        )}
                    </Box>

                    <Tooltip
                        title={
                            sseStatus === 'connected'
                                ? 'Veriler gerçek zamanlı güncelleniyor'
                                : 'Canlı bağlantı yok — sayfa yenileyin'
                        }
                    >
                        <Chip
                            size="small"
                            icon={sseConf.icon}
                            label={sseConf.label}
                            color={sseConf.color}
                            variant="outlined"
                        />
                    </Tooltip>
                </Box>

                {/* KPI Kartları */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiCard
                            title="Net Nakit Pozisyonu"
                            value={kpis ? formatCurrency(kpis.netCash) : '—'}
                            subtitle="Banka + Alacaklar − Borçlar"
                            icon={<AccountBalance />}
                            color="#1565c0"
                            trend={kpis?.netCash != null ? (kpis.netCash >= 0 ? 'up' : 'down') : undefined}
                            trendLabel={kpis ? formatK(Math.abs(kpis.netCash)) : undefined}
                            loading={kpisLoading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiCard
                            title="Açık Alacaklar"
                            value={kpis ? formatCurrency(kpis.openReceivables) : '—'}
                            subtitle="Tahsil edilmemiş satış faturaları"
                            icon={<TrendingUp />}
                            color="#2e7d32"
                            loading={kpisLoading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiCard
                            title="Açık Borçlar"
                            value={kpis ? formatCurrency(kpis.openPayables) : '—'}
                            subtitle="Ödenmemiş alış faturaları"
                            icon={<Receipt />}
                            color="#c62828"
                            loading={kpisLoading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <KpiCard
                            title="Aktif İş Emirleri"
                            value={kpis ? String(kpis.activeWorkOrders) : '—'}
                            subtitle={kpis ? `${kpis.readyForDelivery} teslime hazır` : undefined}
                            icon={<DirectionsCar />}
                            color="#7b1fa2"
                            loading={kpisLoading}
                        />
                    </Grid>
                </Grid>

                {/* Grafikler */}
                <Grid container spacing={2}>

                    {/* Aylık Nakit Akışı */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Aylık Nakit Akışı
                            </Typography>

                            {trendLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : trendData && trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={trendData} margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gelirGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1565c0" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#1565c0" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="giderGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#c62828" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#c62828" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                        <YAxis tickFormatter={formatK} tick={{ fontSize: 12 }} />
                                        <RechartsTooltip
                                            formatter={(value: number, name: string) => [
                                                formatCurrency(value),
                                                name === 'gelir' ? 'Gelir' : 'Gider',
                                            ]}
                                        />
                                        <Legend formatter={(v) => (v === 'gelir' ? 'Gelir' : 'Gider')} />
                                        <Area type="monotone" dataKey="gelir" stroke="#1565c0" fill="url(#gelirGrad)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="gider" stroke="#c62828" fill="url(#giderGrad)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <Alert severity="info">Grafik verisi henüz mevcut değil.</Alert>
                            )}
                        </Card>
                    </Grid>

                    {/* Servis Kapasitesi Pie */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card
                            elevation={0}
                            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2, height: '100%' }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Servis Kapasitesi
                            </Typography>

                            {kpisLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={serviceCapacityData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={80}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {serviceCapacityData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                        {serviceCapacityData.map((item) => (
                                            <Box
                                                key={item.name}
                                                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box
                                                        sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }}
                                                    />
                                                    <Typography variant="caption">{item.name}</Typography>
                                                </Box>
                                                <Typography variant="caption" fontWeight="bold">
                                                    {item.value}
                                                </Typography>
                                            </Box>
                                        ))}

                                        {kpis && (
                                            <Alert severity="info" sx={{ mt: 1, py: 0.5 }}>
                                                Toplam {kpis.activeWorkOrders} aktif iş emri
                                            </Alert>
                                        )}
                                    </Box>
                                </>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </MainLayout>
    );
}
