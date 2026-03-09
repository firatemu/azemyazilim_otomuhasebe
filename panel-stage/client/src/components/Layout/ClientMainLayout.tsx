'use client';

import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Header from './Header';
import TabBar from './TabBar';
import { useLayoutStore } from '@/stores/layoutStore';

interface MainLayoutProps {
  children: React.ReactNode;
  menuItems: any[];
}

export default function ClientMainLayout({ children, menuItems }: MainLayoutProps) {
  const {
    sidebarOpen,
    sidebarPinned,
    toggleSidebar,
    toggleSidebarPin,
    setSidebarOpen
  } = useLayoutStore();

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const handleTogglePin = () => {
    toggleSidebarPin();
  };

  const handleCloseSidebar = () => {
    if (sidebarPinned) return;
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--background)' }}>
      <Sidebar
        open={sidebarPinned ? true : sidebarOpen}
        pinned={sidebarPinned}
        onClose={handleCloseSidebar}
        onTogglePin={handleTogglePin}
        menuItems={menuItems}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
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
        <Box sx={{ p: 3, bgcolor: 'var(--background)', overflowX: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
}

