'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    LinearProgress,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    DirectionsCar,
    Build,
    Schedule,
    CheckCircle,
    Settings,
    LocalCarWash,
    Refresh,
    Fullscreen,
    FullscreenExit,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

// Customer-friendly status labels (no internal terminology)
const getPublicStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        ACCEPTED: 'Alındı',
        DIAGNOSIS: 'Kontrol Ediliyor',
        WAITING_FOR_APPROVAL: 'Değerlendiriliyor',
        APPROVED: 'Hazırlanıyor',
        PART_WAITING: 'Parça Bekleniyor',
        IN_PROGRESS: 'İşlem Devam Ediyor',
        QUALITY_CONTROL: 'Son Kontrol',
        READY_FOR_DELIVERY: 'Teslime Hazır',
        INVOICED: 'Teslime Hazır',
        CLOSED: 'Teslim Edildi',
        CANCELLED: 'İptal',
    };
    return labels[status] || 'Bekliyor';
};

// Status colors for public display
const getPublicStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        ACCEPTED: '#64b5f6', // Light blue
        DIAGNOSIS: '#7986cb', // Indigo
        WAITING_FOR_APPROVAL: '#ffb74d', // Orange
        APPROVED: '#81c784', // Green
        PART_WAITING: '#ffd54f', // Amber
        IN_PROGRESS: '#4fc3f7', // Cyan
        QUALITY_CONTROL: '#9575cd', // Purple
        READY_FOR_DELIVERY: '#4caf50', // Green (strong)
        INVOICED: '#4caf50',
        CLOSED: '#9e9e9e',
        CANCELLED: '#ef5350',
    };
    return colors[status] || '#757575';
};

// Status icon for public display
const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
        ACCEPTED: <DirectionsCar />,
        DIAGNOSIS: <Settings />,
        WAITING_FOR_APPROVAL: <Schedule />,
        APPROVED: <CheckCircle />,
        PART_WAITING: <Settings />,
        IN_PROGRESS: <Build />,
        QUALITY_CONTROL: <LocalCarWash />,
        READY_FOR_DELIVERY: <CheckCircle />,
        INVOICED: <CheckCircle />,
    };
    return icons[status] || <DirectionsCar />;
};

// Mask license plate for privacy (e.g., "34 ABC 123" -> "34 A** ***")
const maskPlate = (plate: string): string => {
    if (!plate) return '***';
    // Split by spaces or keep as is
    const parts = plate.trim().split(/\s+/);
    if (parts.length >= 3) {
        // Format: "34 ABC 1234"
        const city = parts[0];
        const letters = parts[1][0] + '**';
        return `${city} ${letters} ***`;
    } else if (parts.length === 2) {
        // Format: "34ABC 1234"
        const first = parts[0].substring(0, 3) + '***';
        return `${first} ***`;
    }
    // Single string: mask everything after first 3 chars
    return plate.substring(0, 3) + '***';
};

// Work order display interface (sanitized for public)
interface PublicWorkOrder {
    id: string;
    plateNumber: string;
    vehicleBrand: string;
    vehicleModel: string;
    status: string;
    technicianName?: string;
    estimatedDelivery?: string;
    acceptedAt: string;
}

export default function WaitingLoungeDisplayPage() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Fetch active work orders (auto-refresh every 30 seconds)
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['waiting-lounge-display'],
        queryFn: async () => {
            const response = await axios.get('/work-orders', {
                params: { limit: 50 },
            });
            return response.data;
        },
        refetchInterval: 30000, // Auto-refresh every 30 seconds
    });

    // Filter and transform work orders for public display
    const publicWorkOrders: PublicWorkOrder[] = (data?.data || [])
        .filter(
            (wo: any) =>
                wo.status !== 'CLOSED' &&
                wo.status !== 'CANCELLED' &&
                wo.status !== 'INVOICED'
        )
        .map((wo: any) => ({
            id: wo.id,
            plateNumber: wo.vehicle?.plateNumber || '',
            vehicleBrand: wo.vehicle?.brand || '',
            vehicleModel: wo.vehicle?.model || '',
            status: wo.status,
            technicianName: wo.technician
                ? `${wo.technician.firstName} ${wo.technician.lastName[0]}.`
                : undefined,
            estimatedDelivery: wo.estimatedDelivery,
            acceptedAt: wo.acceptedAt,
        }));

    // Group by status for organized display
    const readyForDelivery = publicWorkOrders.filter(
        (wo) => wo.status === 'READY_FOR_DELIVERY'
    );
    const inProgress = publicWorkOrders.filter(
        (wo) => wo.status === 'IN_PROGRESS' || wo.status === 'QUALITY_CONTROL'
    );
    const waiting = publicWorkOrders.filter(
        (wo) =>
            wo.status !== 'READY_FOR_DELIVERY' &&
            wo.status !== 'IN_PROGRESS' &&
            wo.status !== 'QUALITY_CONTROL'
    );

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
                color: 'white',
                p: 3,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    px: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DirectionsCar sx={{ fontSize: 48 }} />
                    <Box>
                        <Typography variant="h3" fontWeight="bold">
                            Servis Durumu
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.8 }}>
                            Aracınızın durumunu takip edin
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" fontWeight="light">
                        {currentTime.toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Typography>
                    <Tooltip title="Yenile">
                        <IconButton
                            onClick={() => refetch()}
                            sx={{ color: 'white' }}
                        >
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}>
                        <IconButton
                            onClick={toggleFullscreen}
                            sx={{ color: 'white' }}
                        >
                            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Loading indicator */}
            {isLoading && (
                <LinearProgress
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: 'white',
                        },
                    }}
                />
            )}

            {/* Ready for Delivery Section */}
            {readyForDelivery.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 2,
                            px: 2,
                        }}
                    >
                        <CheckCircle sx={{ fontSize: 32, color: '#4caf50' }} />
                        <Typography variant="h4" fontWeight="bold">
                            Teslime Hazır
                        </Typography>
                        <Chip
                            label={readyForDelivery.length}
                            sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                            }}
                        />
                    </Box>
                    <Grid container spacing={2}>
                        {readyForDelivery.map((wo) => (
                            <Grid key={wo.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <VehicleCard workOrder={wo} highlighted />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* In Progress Section */}
            {inProgress.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 2,
                            px: 2,
                        }}
                    >
                        <Build sx={{ fontSize: 32, color: '#4fc3f7' }} />
                        <Typography variant="h4" fontWeight="bold">
                            İşlem Devam Ediyor
                        </Typography>
                        <Chip
                            label={inProgress.length}
                            sx={{
                                bgcolor: '#4fc3f7',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                            }}
                        />
                    </Box>
                    <Grid container spacing={2}>
                        {inProgress.map((wo) => (
                            <Grid key={wo.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <VehicleCard workOrder={wo} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Waiting / Other Statuses Section */}
            {waiting.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 2,
                            px: 2,
                        }}
                    >
                        <Schedule sx={{ fontSize: 32, color: '#ffb74d' }} />
                        <Typography variant="h4" fontWeight="bold">
                            Bekleyenler
                        </Typography>
                        <Chip
                            label={waiting.length}
                            sx={{
                                bgcolor: '#ffb74d',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                            }}
                        />
                    </Box>
                    <Grid container spacing={2}>
                        {waiting.map((wo) => (
                            <Grid key={wo.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <VehicleCard workOrder={wo} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Empty state */}
            {publicWorkOrders.length === 0 && !isLoading && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '60vh',
                        opacity: 0.7,
                    }}
                >
                    <DirectionsCar sx={{ fontSize: 120, mb: 2 }} />
                    <Typography variant="h4">
                        Şu anda bekleyen araç bulunmamaktadır
                    </Typography>
                </Box>
            )}

            {/* Footer */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    py: 2,
                    px: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Sayfa 30 saniyede bir otomatik olarak güncellenir
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {currentTime.toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Typography>
            </Box>
        </Box>
    );
}

// Vehicle card component
interface VehicleCardProps {
    workOrder: PublicWorkOrder;
    highlighted?: boolean;
}

function VehicleCard({ workOrder, highlighted = false }: VehicleCardProps) {
    const statusColor = getPublicStatusColor(workOrder.status);
    const statusLabel = getPublicStatusLabel(workOrder.status);
    const maskedPlate = maskPlate(workOrder.plateNumber);

    return (
        <Card
            sx={{
                bgcolor: highlighted
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: highlighted
                    ? '3px solid #4caf50'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                animation: highlighted ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.4)' },
                    '70%': { boxShadow: '0 0 0 15px rgba(76, 175, 80, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' },
                },
                '&:hover': {
                    transform: 'scale(1.02)',
                },
            }}
        >
            <CardContent>
                {/* License Plate (Masked) */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                    }}
                >
                    <DirectionsCar sx={{ color: 'white', fontSize: 28 }} />
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                            color: 'white',
                            letterSpacing: 2,
                            fontFamily: 'monospace',
                        }}
                    >
                        {maskedPlate}
                    </Typography>
                </Box>

                {/* Vehicle Model */}
                <Typography
                    variant="body1"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 2,
                    }}
                >
                    {workOrder.vehicleBrand} {workOrder.vehicleModel}
                </Typography>

                {/* Status */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                        p: 1,
                        borderRadius: 2,
                        bgcolor: statusColor,
                    }}
                >
                    {getStatusIcon(workOrder.status)}
                    <Typography variant="body1" fontWeight="bold">
                        {statusLabel}
                    </Typography>
                </Box>

                {/* Optional: Technician Name */}
                {workOrder.technicianName && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1,
                            opacity: 0.7,
                        }}
                    >
                        <Build sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                            {workOrder.technicianName}
                        </Typography>
                    </Box>
                )}

                {/* Optional: Estimated Delivery */}
                {workOrder.estimatedDelivery && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1,
                            opacity: 0.7,
                        }}
                    >
                        <Schedule sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                            Tahmini:{' '}
                            {new Date(workOrder.estimatedDelivery).toLocaleTimeString(
                                'tr-TR',
                                { hour: '2-digit', minute: '2-digit' }
                            )}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

