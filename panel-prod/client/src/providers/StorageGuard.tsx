'use client';

// Import storage polyfill first to ensure it runs before any other code
import '@/lib/storage-polyfill';
import React from 'react';

export default function StorageGuard({ children }: { children: React.ReactNode }) {
    // Polyfill is already applied at module load time, so just render children
    return <>{children}</>;
}
