import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  enableSelection?: boolean;
  onSelectionChange?: (selected: T[]) => void;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  enableSelection = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    enableRowSelection: enableSelection,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination: {
        pageIndex: page,
        pageSize,
      },
    },
  });

  React.useEffect(() => {
    if (enableSelection && onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, enableSelection, onSelectionChange, table]);

  if (isLoading) {
    return (
      <Paper>
        <Box sx={{ p: 3, textAlign: 'center' }}>Yükleniyor...</Box>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id}
                sx={{
                  bgcolor: '#f8f9fa',
                  '& .MuiTableCell-head': {
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: '#667eea',
                    borderBottom: '2px solid #e0e0e0',
                  },
                }}
              >
                {enableSelection && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={table.getIsAllPageRowsSelected()}
                      indeterminate={table.getIsSomePageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                  </TableCell>
                )}
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      transition: 'background-color 0.2s ease',
                      '&:hover': header.column.getCanSort() ? {
                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                      } : {},
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <ArrowUpDown size={16} style={{ opacity: 0.5, color: '#667eea' }} />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (enableSelection ? 1 : 0)} 
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Veri bulunamadı
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onRowClick?.(row.original)}
                  sx={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.05)',
                    },
                    '& .MuiTableCell-body': {
                      borderBottom: '1px solid #f0f0f0',
                    },
                  }}
                >
                  {enableSelection && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          p: 2.5,
          borderTop: '1px solid #f0f0f0',
          bgcolor: '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Önceki sayfa">
            <IconButton
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              <ChevronLeft size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sonraki sayfa">
            <IconButton
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              <ChevronRight size={20} />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Sayfa {table.getState().pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sayfa başına:
          </Typography>
          <Box
            component="select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            sx={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              background: 'white',
              color: '#333',
              cursor: 'pointer',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: '#667eea',
              },
              '&:focus': {
                outline: 'none',
                borderColor: '#667eea',
              },
            }}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

