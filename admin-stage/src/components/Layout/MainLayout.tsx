import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
    setDesktopOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#f8fafc',
      }}
    >
      <Header 
        onMenuClick={handleDrawerToggle} 
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen}
      />
      <Sidebar 
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen}
        onMobileClose={handleDrawerClose}
        onDesktopToggle={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { 
            xs: '100%',
            md: desktopOpen ? 'calc(100% - 280px)' : '100%'
          },
          bgcolor: '#f8fafc',
          minHeight: '100vh',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ml: { md: 0 },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            maxWidth: '1600px',
            mx: 'auto',
            animation: 'fadeIn 0.4s ease-in',
            '@keyframes fadeIn': {
              from: {
                opacity: 0,
                transform: 'translateY(10px)',
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
