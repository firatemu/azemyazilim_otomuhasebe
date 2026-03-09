'use client';

import {
    Box,
    Typography,
    Chip,
    Skeleton,
    Alert,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FixedSizeList as List } from 'react-window';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, {
    timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { useEntityAuditLog } from '@/hooks/useAuditLog';
import { DiffViewer } from './DiffViewer';

// ─── Aksiyon konfigürasyonu ───
const ACTION_CONFIG: Record<
    string,
    { icon: React.ReactNode; color: 'success' | 'primary' | 'error' | 'warning' | 'grey' | 'inherit'; label: string }
> = {
    CREATE: { icon: <AddIcon fontSize="small" />, color: 'success', label: 'Oluşturuldu' },
    UPDATE: { icon: <EditIcon fontSize="small" />, color: 'primary', label: 'Güncellendi' },
    SOFT_DELETE: { icon: <DeleteIcon fontSize="small" />, color: 'error', label: 'Silindi' },
    DELETE: { icon: <DeleteIcon fontSize="small" />, color: 'error', label: 'Kalıcı Silindi' },
    RESTORE: { icon: <RestoreIcon fontSize="small" />, color: 'warning', label: 'Geri Alındı' },
    APPROVE: { icon: <CheckCircleIcon fontSize="small" />, color: 'success', label: 'Onaylandı' },
    REJECT: { icon: <CancelIcon fontSize="small" />, color: 'error', label: 'Reddedildi' },
    LOCK: { icon: <LockIcon fontSize="small" />, color: 'warning', label: 'Kilitlendi' },
    UNLOCK: { icon: <LockIcon fontSize="small" />, color: 'success', label: 'Kilit Açıldı' },
    VIEW: { icon: <VisibilityIcon fontSize="small" />, color: 'grey', label: 'Görüntülendi' },
    EXPORT: { icon: <DownloadIcon fontSize="small" />, color: 'primary', label: 'Dışa Aktarıldı' },
};

const DEFAULT_CONFIG = ACTION_CONFIG.UPDATE;

// ─── Props ───
interface AuditTimelineProps {
    entityName: string;
    entityId: string;
    maxItems?: number;
}

// ─── Bileşen ───
export function AuditTimeline({
    entityName,
    entityId,
    maxItems = 1000, // Sanallaştırma ile limiti artırabiliriz
}: AuditTimelineProps) {
    const { data, isLoading, isError } = useEntityAuditLog(entityName, entityId);
    const [selectedLog, setSelectedLog] = useState<any | null>(null);

    if (isLoading) {
        return (
            <Box sx={{ p: 2 }}>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
                ))}
            </Box>
        );
    }

    if (isError) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Geçmiş yüklenirken hata oluştu.
            </Alert>
        );
    }

    if (!data?.data?.length) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                Henüz kayıt geçmişi bulunmuyor.
            </Typography>
        );
    }

    const items = data.data.slice(0, maxItems);

    // react-window satır render fonksiyonu
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const log = items[index];
        const config = ACTION_CONFIG[log.actionType] ?? DEFAULT_CONFIG;
        const hasChanges = log.beforeState && log.afterState;

        return (
            <div style={style}>
                <TimelineItem sx={{ minHeight: style.height }}>
                    {/* Sol: Tarih/Saat */}
                    <TimelineOppositeContent
                        sx={{ py: 1.5, px: 1, fontSize: 11, color: 'text.disabled', flex: 0.2 }}
                    >
                        {new Date(log.createdAt).toLocaleString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </TimelineOppositeContent>

                    {/* Orta: Dot + Connector */}
                    <TimelineSeparator>
                        <TimelineDot
                            color={config.color === 'grey' ? 'inherit' : config.color}
                            variant="outlined"
                            sx={{ p: 0.5, my: 1 }}
                        >
                            {config.icon}
                        </TimelineDot>
                        {index < items.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>

                    {/* Sağ: İçerik */}
                    <TimelineContent sx={{ py: 1, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                                label={config.label}
                                size="small"
                                color={config.color === 'grey' ? 'default' : config.color}
                                sx={{ height: 20, fontSize: 11 }}
                            />
                            {hasChanges && log.changedFields?.length > 0 && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setSelectedLog(log)}
                                    sx={{ height: 20, fontSize: 10, px: 1, minWidth: 0, ml: 'auto' }}
                                >
                                    {log.changedFields.length} Değişiklik
                                </Button>
                            )}
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {log.userId ? `Kullanıcı: ${log.userId.slice(0, 8)}…` : 'Sistem'}
                            {log.ipAddress && ` · ${log.ipAddress}`}
                        </Typography>
                    </TimelineContent>
                </TimelineItem>
            </div>
        );
    };

    return (
        <Box sx={{ width: '100%', height: 400, bgcolor: 'background.paper' }}>
            <Timeline
                sx={{
                    p: 0,
                    m: 0,
                    height: '100%',
                    [`& .${timelineOppositeContentClasses.root}`]: {
                        flex: 0.2,
                    },
                }}
            >
                <List
                    height={400} // Konteyner yüksekliği
                    itemCount={items.length}
                    itemSize={100} // Sabit satır yüksekliği
                    width="100%"
                    className="audit-timeline-list"
                >
                    {Row}
                </List>
            </Timeline>

            {/* Değişiklik Detay Modalı */}
            <Dialog
                open={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Değişiklik Detayı
                    <IconButton onClick={() => setSelectedLog(null)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    {selectedLog && (
                        <DiffViewer
                            before={selectedLog.beforeState}
                            after={selectedLog.afterState}
                            changedFields={selectedLog.changedFields}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedLog(null)}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
