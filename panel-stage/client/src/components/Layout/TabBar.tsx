'use client';

import React, { useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTabStore } from '@/stores/tabStore';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function TabBar() {
  const { tabs, activeTab, setActiveTab, removeTab } = useTabStore();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to /menu when all tabs are closed and not on /menu page
  useEffect(() => {
    if (tabs.length === 0 && pathname !== '/menu') {
      router.push('/menu');
    }
  }, [tabs.length, pathname, router]);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    const tab = tabs.find((t) => t.id === newValue);
    if (tab) {
      router.push(tab.path);
    }
  };

  const handleCloseTab = (
    event: React.MouseEvent,
    tabId: string
  ) => {
    event.stopPropagation();
    const isClosingActive = activeTab === tabId;
    let fallbackPath: string | undefined;

    if (isClosingActive) {
      const closingIndex = tabs.findIndex((t) => t.id === tabId);
      const previousTab = tabs[closingIndex - 1];
      const nextTab = tabs[closingIndex + 1];
      const targetTab = previousTab ?? nextTab;
      fallbackPath = targetTab?.path;
    }

    removeTab(tabId);

    if (isClosingActive) {
      router.push(fallbackPath ?? '/menu');
    }
  };

  // Hide TabBar on /menu page
  if (tabs.length === 0 || pathname === '/menu') {
    return null;
  }

  return (
    <Box
      sx={{
        borderBottom: '1px solid var(--border)',
        bgcolor: 'var(--card)',
        boxShadow: 'var(--shadow-xs)',
        position: 'sticky',
        top: 64,
        zIndex: 1100,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="module tabs"
        sx={{
          minHeight: 48,
          '& .MuiTabs-scrollButtons': {
            color: 'var(--muted-foreground)',
            '&:hover': {
              color: 'var(--foreground)',
            },
            '&.Mui-disabled': {
              opacity: 0.3,
            },
          },
          '& .MuiTabs-indicator': {
            height: 3,
            bgcolor: 'var(--primary)',
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        {tabs.map((tab) => {
          const canCloseTab = true; // All tabs can be closed
          const isActive = tab.id === activeTab;

          return (
            <Tab
              key={tab.id}
              label={
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    px: 0.5,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tab.label}
                  </Box>
                  {canCloseTab && (
                    <Box
                      component="span"
                      onClick={(e) => handleCloseTab(e, tab.id)}
                      sx={{
                        ml: 0.5,
                        p: 0.5,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        color: 'var(--muted-foreground)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                          color: 'var(--destructive)',
                        },
                      }}
                    >
                      <Close sx={{ fontSize: 14 }} />
                    </Box>
                  )}
                </Box>
              }
              value={tab.id}
              sx={{
                textTransform: 'none',
                minHeight: 48,
                px: 2,
                py: 1.5,
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'var(--foreground)',
                  bgcolor: 'var(--muted)',
                },
                '&.Mui-selected': {
                  color: 'var(--foreground)',
                  fontWeight: 600,
                },
              }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}
