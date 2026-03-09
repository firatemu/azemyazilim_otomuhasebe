'use client';

import React from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    // Pass-through proxy. Architecture now handled by app/(main)/layout.tsx
    // This ensures legacy 'use client' pages that import MainLayout still work.
    return <>{children}</>;
}
