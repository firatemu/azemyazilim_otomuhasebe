import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    FormControlLabel,
} from '@mui/material';
import { Permission } from '@/types/role';

interface PermissionMatrixProps {
    permissions: Permission[];
    selectedPermissions: string[];
    onChange: (ids: string[]) => void;
    readOnly?: boolean;
}

const COMMON_ACTIONS = [
    'view',
    'list',
    'create',
    'update',
    'delete',
    'export',
    'import',
    'approve',
    'cancel',
    'print',
];

const ACTION_LABELS: Record<string, string> = {
    view: 'Görüntüleme',
    list: 'Listeleme',
    create: 'Yeni Kayıt',
    update: 'Düzenleme',
    delete: 'Silme',
    export: 'Dışa Aktar',
    import: 'İçe Aktar',
    approve: 'Onaylama',
    cancel: 'İptal Etme',
    print: 'Yazdırma',
};

const MODULE_LABELS: Record<string, string> = {
    users: 'Kullanıcılar',
    roles: 'Roller & İzinler',
    permissions: 'Sistem İzinleri',
    invoices: 'Faturalar',
    cariye: 'Cari Yönetimi',
    products: 'Stok Yönetimi',
    expenses: 'Masraf / Giderler',
    reports: 'Raporlama',
    settings: 'Ayarlar',
    work_orders: 'İş Emirleri',
    vehicles: 'Araçlar',
    technicians: 'Teknisyenler',
    procurement: 'Satın Alma',
    finance: 'Finans Yönetimi',
    collecting: 'Tahsilat',
    payments: 'Ödeme',
};

export default function PermissionMatrix({
    permissions,
    selectedPermissions,
    onChange,
    readOnly = false,
}: PermissionMatrixProps) {
    // Group permissions by module
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Record<string, Permission>> = {};
        permissions.forEach((perm) => {
            const moduleKey = perm.module;
            if (!groups[moduleKey]) {
                groups[moduleKey] = {};
            }
            groups[moduleKey][perm.action] = perm;
        });
        return groups;
    }, [permissions]);

    const modules = Object.keys(groupedPermissions).sort();

    const handleToggle = (permId: string) => {
        if (readOnly) return;
        const newSelected = selectedPermissions.includes(permId)
            ? selectedPermissions.filter((id) => id !== permId)
            : [...selectedPermissions, permId];
        onChange(newSelected);
    };

    const handleModuleToggle = (module: string) => {
        if (readOnly) return;
        const modulePerms = Object.values(groupedPermissions[module]);
        const modulePermIds = modulePerms.map((p) => p.id);
        const allSelected = modulePermIds.every((id) => selectedPermissions.includes(id));

        let newSelected = [...selectedPermissions];
        if (allSelected) {
            // Deselect all
            newSelected = newSelected.filter((id) => !modulePermIds.includes(id));
        } else {
            // Select all (add missing)
            modulePermIds.forEach((id) => {
                if (!newSelected.includes(id)) {
                    newSelected.push(id);
                }
            });
        }
        onChange(newSelected);
    };

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>Modül</TableCell>
                        {COMMON_ACTIONS.map((action) => (
                            <TableCell key={action} align="center" sx={{ fontWeight: 'bold', bgcolor: 'background.default', minWidth: 80 }}>
                                {ACTION_LABELS[action] || action}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {modules.map((module) => {
                        const modulePerms = groupedPermissions[module];
                        const modulePermIds = Object.values(modulePerms).map((p) => p.id);
                        const allSelected = modulePermIds.length > 0 && modulePermIds.every((id) => selectedPermissions.includes(id));
                        const someSelected = modulePermIds.some((id) => selectedPermissions.includes(id));

                        return (
                            <TableRow key={module} hover>
                                <TableCell component="th" scope="row">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={allSelected}
                                                indeterminate={someSelected && !allSelected}
                                                onChange={() => handleModuleToggle(module)}
                                                disabled={readOnly}
                                                size="small"
                                            />
                                        }
                                        label={<Typography variant="subtitle2">{MODULE_LABELS[module] || module.toUpperCase()}</Typography>}
                                    />
                                </TableCell>
                                {COMMON_ACTIONS.map((action) => {
                                    const perm = modulePerms[action];
                                    if (!perm) {
                                        return <TableCell key={action} align="center" sx={{ bgcolor: 'action.hover' }} />;
                                    }
                                    return (
                                        <TableCell key={action} align="center">
                                            <Checkbox
                                                checked={selectedPermissions.includes(perm.id)}
                                                onChange={() => handleToggle(perm.id)}
                                                disabled={readOnly}
                                                size="small"
                                            />
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
