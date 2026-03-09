'use client';

/**
 * WorkOrderConflictModal — Conflict Resolution UI
 *
 * Usta offline'dayken iş emrini değiştirdi,
 * aynı anda ofis de değiştirdi → 409 Conflict.
 *
 * Bu modal iki versiyonu gösterir:
 *   - Yerel değişiklik (Usta'nın değişikliği)
 *   - Sunucu versiyonu (Ofis'in değişikliği)
 *
 * Kullanıcı:
 *   - "Benim değişikliğimi kullan" → Tekrar API'ye gönderir (force)
 *   - "Sunucu versiyonunu al" → Yerel değişikliği iptal eder
 */

import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Typography,
} from '@mui/material';
import { CompareArrows, Warning } from '@mui/icons-material';
import { type OfflineAction } from '@/lib/localDb';

interface WorkOrderConflictModalProps {
    open: boolean;
    localAction: OfflineAction | null;
    serverData: Record<string, unknown> | null;
    onKeepMine: (action: OfflineAction) => Promise<void>;
    onTakeServer: () => void;
    onClose: () => void;
}

const actionLabels: Record<string, string> = {
    UPDATE_STATUS: 'Durum Değişikliği',
    USE_PART: 'Parça Kullanımı',
    ADD_LABOR: 'İşçilik Ekleme',
    ADD_PART_FROM_STOCK: 'Stoktan Parça Ekleme',
    ASSIGN_TECHNICIAN: 'Teknisyen Atama',
    ADD_NOTE: 'Not Ekleme',
};

export function WorkOrderConflictModal({
    open,
    localAction,
    serverData,
    onKeepMine,
    onTakeServer,
    onClose,
}: WorkOrderConflictModalProps) {
    if (!localAction || !serverData) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning color="warning" />
                Eş Zamanlı Düzenleme Çakışması
            </DialogTitle>

            <DialogContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Siz offline'dayken bu iş emrinde <strong>ofis tarafından da değişiklik yapıldı</strong>.
                    Hangi versiyonu kullanmak istediğinizi seçin.
                </Alert>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {/* Yerel değişiklik */}
                    <Box sx={{ p: 2, border: '2px solid #1976d2', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip label="Benim Değişikliğim" color="primary" size="small" />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            İşlem: {actionLabels[localAction.type] ?? localAction.type}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Zaman: {new Date(localAction.createdAt).toLocaleString('tr-TR')}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" component="pre" sx={{ fontSize: 11, overflow: 'auto', maxHeight: 120 }}>
                            {JSON.stringify(localAction.payload, null, 2)}
                        </Typography>
                    </Box>

                    {/* Sunucu versiyonu */}
                    <Box sx={{ p: 2, border: '2px solid #ed6c02', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip label="Ofis Versiyonu" color="warning" size="small" />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Durum: {String(serverData.status ?? '-')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Güncellenme: {serverData.updatedAt
                                ? new Date(String(serverData.updatedAt)).toLocaleString('tr-TR')
                                : '-'}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" component="pre" sx={{ fontSize: 11, overflow: 'auto', maxHeight: 120 }}>
                            {JSON.stringify(
                                { status: serverData.status, updatedAt: serverData.updatedAt },
                                null,
                                2
                            )}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<CompareArrows />}
                    onClick={onTakeServer}
                >
                    Sunucu Versiyonunu Al
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onKeepMine(localAction)}
                >
                    Benim Değişikliğimi Kullan
                </Button>
            </DialogActions>
        </Dialog>
    );
}
