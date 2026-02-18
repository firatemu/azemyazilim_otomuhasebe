'use client';

import { Box, Skeleton, TableCell, TableRow } from '@mui/material';

/**
 * Stok listesi tablosu için skeleton
 */
export function InventoryTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          <TableCell>
            <Skeleton variant="text" width="80%" height={32} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="60%" height={32} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="70%" height={32} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="50%" height={32} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="40%" height={32} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="60%" height={32} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="40%" height={32} />
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={32} height={32} />
              <Skeleton variant="rectangular" width={32} height={32} />
              <Skeleton variant="rectangular" width={32} height={32} />
            </Box>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

/**
 * Stok detayları için skeleton
 */
export function InventoryDetailSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={24} />
      </Box>

      {/* Info Cards Skeleton */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ flex: 1, minWidth: 200 }}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Box>

      {/* Table Skeleton */}
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    </Box>
  );
}

/**
 * Stok kartları için skeleton (grid view)
 */
export function InventoryCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={24} />
        </Box>
      ))}
    </Box>
  );
}

/**
 * Form skeleton
 */
export function InventoryFormSkeleton() {
  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i}>
            <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
}
