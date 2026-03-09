'use client';

/**
 * OnlineStatusBanner — Ağ Durumu Bildirim Şeridi
 *
 * Sayfanın üstünde ince bir şerit olarak görünür.
 * - Offline: Kırmızı şerit "Bağlantı yok — offline moddasınız"
 * - Sync bekleyen: Turuncu "X bekleyen değişiklik var — Hemen Sync Et"
 * - Sync olunca: Yeşil "Tüm değişiklikler senkronize edildi" (3sn sonra kaybolur)
 */

import { flushOfflineQueue } from '@/services/SyncService';
import { CloudSync, CloudOff, CheckCircleOutline, Warning } from '@mui/icons-material';
import { Box, Button, Collapse, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

interface OnlineStatusBannerProps {
    tenantId: string;
    pendingCount: number;
    onSyncComplete?: () => void;
}

export function OnlineStatusBanner({
    tenantId,
    pendingCount,
    onSyncComplete,
}: OnlineStatusBannerProps) {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const [isSyncing, setIsSyncing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSync = useCallback(async () => {
        if (!isOnline || isSyncing) return;
        setIsSyncing(true);
        try {
            const stats = await flushOfflineQueue(tenantId);
            if (stats.synced > 0) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
            onSyncComplete?.();
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline, isSyncing, tenantId, onSyncComplete]);

    // Online, bekleyen yok, success yok → Hiçbir şey gösterme
    if (isOnline && pendingCount === 0 && !showSuccess) return null;

    const getBannerStyle = (): {
        bgcolor: string;
        color: string;
        icon: React.ReactNode;
        message: string;
    } => {
        if (!isOnline) {
            return {
                bgcolor: '#d32f2f',
                color: '#fff',
                icon: <CloudOff sx={{ fontSize: 18 }} />,
                message: 'Bağlantı yok — Offline moddasınız. Değişiklikler yerel olarak kaydediliyor.',
            };
        }
        if (showSuccess) {
            return {
                bgcolor: '#2e7d32',
                color: '#fff',
                icon: <CheckCircleOutline sx={{ fontSize: 18 }} />,
                message: 'Tüm değişiklikler senkronize edildi.',
            };
        }
        return {
            bgcolor: '#e65100',
            color: '#fff',
            icon: <Warning sx={{ fontSize: 18 }} />,
            message: `${pendingCount} bekleyen değişiklik var — internet bağlantısı aktif.`,
        };
    };

    const { bgcolor, color, icon, message } = getBannerStyle();

    return (
        <Collapse in>
            <Box
                sx={{
                    bgcolor,
                    color,
                    px: 2,
                    py: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1300,
                }}
            >
                {icon}
                <Typography variant="caption" sx={{ flex: 1, fontWeight: 500 }}>
                    {message}
                </Typography>

                {isOnline && pendingCount > 0 && !showSuccess && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloudSync />}
                        onClick={handleSync}
                        disabled={isSyncing}
                        sx={{
                            color: '#fff',
                            borderColor: 'rgba(255,255,255,0.6)',
                            '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                            fontSize: 11,
                            py: 0.25,
                        }}
                    >
                        {isSyncing ? 'Senkronize ediliyor...' : 'Hemen Sync Et'}
                    </Button>
                )}
            </Box>
        </Collapse>
    );
}
