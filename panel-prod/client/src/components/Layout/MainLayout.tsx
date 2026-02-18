'use client';

import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Header from './Header';
import TabBar from './TabBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);

  const handleToggleSidebar = () => {
    if (sidebarPinned) {
      return;
    }
    setSidebarOpen((prev) => !prev);
  };

  const handleTogglePin = () => {
    setSidebarPinned((prev) => {
      const next = !prev;
      if (next) {
        setSidebarOpen(true);
      }
      return next;
    });
  };

  const handleCloseSidebar = () => {
    if (sidebarPinned) {
      return;
    }
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--background)' }}>
      <Sidebar
        open={sidebarPinned ? true : sidebarOpen}
        pinned={sidebarPinned}
        onClose={handleCloseSidebar}
        onTogglePin={handleTogglePin}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          bgcolor: 'var(--background)',
        }}
      >
        <Header
          onToggleSidebar={handleToggleSidebar}
          onToggleSidebarPin={handleTogglePin}
          sidebarPinned={sidebarPinned}
        />
        <Toolbar />
        <TabBar />
        <Box sx={{ p: 3, bgcolor: 'var(--background)' }}>{children}</Box>
      </Box>
    </Box>
  );
}

