import { Skeleton, TableCell, TableRow, Box } from '@mui/material';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton animation="wave" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="40%" height={30} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 1 }} />
    </Box>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <Box>
      {Array.from({ length: items }).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton variant="text" width="30%" height={25} />
          <Skeleton variant="text" width="70%" />
        </Box>
      ))}
    </Box>
  );
}

