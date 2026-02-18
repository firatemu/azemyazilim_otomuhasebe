'use client';

import { Box, Skeleton, TableCell, TableRow } from '@mui/material';

interface FaturaTableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function FaturaTableSkeleton({
  rows = 10,
  columns = 7,
}: FaturaTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton
                variant="text"
                width={colIndex === 0 ? '80%' : '60%'}
                height={32}
                sx={{ bgcolor: 'action.hover' }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/**
 * Fatura detayları için skeleton
 */
export function FaturaDetailSkeleton() {
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
 * Fatura kartları için skeleton (grid view)
 */
export function FaturaCardSkeleton({ count = 6 }: { count?: number }) {
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
