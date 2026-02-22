'use client';

import React from 'react';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridSortModel,
    GridPaginationModel,
    GridFilterModel,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport,
} from '@mui/x-data-grid';
import { trTR } from '@mui/x-data-grid/locales';
import { Box, Paper, IconButton, Typography, Tooltip } from '@mui/material';

interface InvoiceDataGridProps {
    rows: any[];
    columns: GridColDef[];
    loading: boolean;
    rowCount: number;
    paginationModel: GridPaginationModel;
    sortModel: GridSortModel;
    onPaginationModelChange: (model: GridPaginationModel) => void;
    onSortModelChange: (model: GridSortModel) => void;
    onFilterModelChange?: (model: GridFilterModel) => void;
    onRowClick?: (params: any) => void;
    checkboxSelection?: boolean;
    onRowSelectionModelChange?: (newSelectionModel: string[]) => void;
    /** Tablo yüksekliği (px). Varsayılan: 650 */
    height?: number;
}

function CustomToolbar() {
    return (
        <GridToolbarContainer sx={{ p: 1, borderBottom: '1px solid var(--border)' }}>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport
                printOptions={{ disableToolbarButton: true }}
                csvOptions={{ fileName: 'Faturalar', delimiter: ';', utf8WithBom: true }}
            />
        </GridToolbarContainer>
    );
}

export default function InvoiceDataGrid({
    rows,
    columns,
    loading,
    rowCount,
    paginationModel,
    sortModel,
    onPaginationModelChange,
    onSortModelChange,
    onFilterModelChange,
    onRowClick,
    checkboxSelection = true,
    onRowSelectionModelChange,
    height = 650,
}: InvoiceDataGridProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                height,
                width: '100%',
                border: '1px solid var(--border)',
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                rowCount={rowCount}
                pageSizeOptions={[10, 25, 50, 100]}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={onPaginationModelChange}
                sortModel={sortModel}
                sortingMode="server"
                onSortModelChange={onSortModelChange}
                filterMode="server"
                onFilterModelChange={onFilterModelChange}
                onRowClick={onRowClick}
                checkboxSelection={checkboxSelection}
                onRowSelectionModelChange={(newSelection) => {
                    if (onRowSelectionModelChange) {
                        onRowSelectionModelChange(newSelection as unknown as string[]);
                    }
                }}
                slots={{
                    toolbar: CustomToolbar,
                }}
                localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'var(--muted)',
                        color: 'var(--foreground)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        borderBottom: '1px solid var(--border)',
                    },
                    '& .MuiDataGrid-row': {
                        cursor: onRowClick ? 'pointer' : 'default',
                        '&:hover': {
                            backgroundColor: 'var(--muted/50)',
                        },
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--foreground)',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderTop: '1px solid var(--border)',
                    },
                }}
            />
        </Paper>
    );
}
