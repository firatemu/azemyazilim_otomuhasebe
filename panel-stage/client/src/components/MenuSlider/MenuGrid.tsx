'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  Container,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { MenuItem } from './types';
import SubMenuDialog from './SubMenuDialog';
import SearchResultsList from './SearchResultsList';
import MenuCard from './MenuCard';

interface SearchResult {
  item: MenuItem;
  type: 'main' | 'sub';
  parentItem?: MenuItem;
}

interface MenuGridProps {
  menuItems: MenuItem[];
  showBackground?: boolean;
  onMenuClick?: (item: MenuItem) => void;
  onSubItemClick?: (parent: MenuItem, subItem: MenuItem) => void;
}

export default function MenuGrid({
  menuItems,
  onMenuClick,
  onSubItemClick,
}: MenuGridProps) {
  const router = useRouter();
  const [selectedSubMenu, setSelectedSubMenu] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Generate search results for list (real-time) - ONLY sub-items
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];

    const searchLower = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    menuItems.forEach((item) => {
      // Only search in subItems
      if (item.subItems) {
        item.subItems.forEach((subItem) => {
          if (subItem.label.toLowerCase().includes(searchLower)) {
            results.push({ item: subItem, type: 'sub', parentItem: item });
          }
        });
      }
    });

    return results;
  }, [menuItems, searchTerm]);

  const showSearchResults = searchTerm.length > 0;

  const handleMenuClick = (item: MenuItem) => {
    if (onMenuClick) {
      onMenuClick(item);
    }

    // If item has subItems, open submenu dialog
    if (item.subItems && item.subItems.length > 0) {
      setSelectedSubMenu(item);
      return;
    }

    // Otherwise navigate to path
    if (item.path) {
      router.push(item.path);
    }
  };

  const handleSubItemClick = (subItem: MenuItem) => {
    if (onSubItemClick) {
      onSubItemClick(selectedSubMenu!, subItem);
    }

    if (subItem.path) {
      router.push(subItem.path);
    }

    setSelectedSubMenu(null);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F5F7FA 0%, #E8EEF5 50%, #F0F4F8 100%)',
        display: 'flex',
        flexDirection: 'column',
        pt: { xs: 4, md: 8 },
        pb: 8,
        px: { xs: 2, md: 4 },
        overflowX: 'hidden',
      }}
    >
      {/* Animated Gradient Mesh Background */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(at 40% 20%, rgba(227, 242, 253, 0.5) 0px, transparent 50%),
            radial-gradient(at 80% 0%, rgba(224, 242, 241, 0.4) 0px, transparent 50%),
            radial-gradient(at 0% 50%, rgba(252, 228, 236, 0.35) 0px, transparent 50%),
            radial-gradient(at 80% 50%, rgba(243, 229, 245, 0.4) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(255, 253, 231, 0.35) 0px, transparent 50%),
            radial-gradient(at 80% 100%, rgba(232, 245, 233, 0.4) 0px, transparent 50%)
          `,
          animation: 'meshMove 30s linear infinite',
          '@keyframes meshMove': {
            '0%': { backgroundPosition: '0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%' },
            '50%': { backgroundPosition: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%' },
            '100%': { backgroundPosition: '0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%' },
          },
        }}
      />

      {/* Floating Orbs */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          aria-hidden
          sx={{
            position: 'absolute',
            width: [350, 300, 250, 220, 180, 150][i],
            height: [350, 300, 250, 220, 180, 150][i],
            borderRadius: '50%',
            top: `${[10, 20, 60, 70, 30, 80][i]}%`,
            left: `${[80, 15, 70, 20, 60, 85][i]}%`,
            opacity: [0.12, 0.1, 0.11, 0.09, 0.1, 0.12][i],
            background: [
              'radial-gradient(circle, rgba(187, 222, 251, 0.4), transparent)',
              'radial-gradient(circle, rgba(178, 223, 219, 0.35), transparent)',
              'radial-gradient(circle, rgba(248, 187, 208, 0.3), transparent)',
              'radial-gradient(circle, rgba(225, 190, 231, 0.35), transparent)',
              'radial-gradient(circle, rgba(255, 249, 196, 0.3), transparent)',
              'radial-gradient(circle, rgba(200, 230, 201, 0.35), transparent)',
            ][i],
            filter: 'blur(60px)',
            zIndex: 0,
            pointerEvents: 'none',
            animation: `float ${[25, 30, 20, 28, 22, 26][i]}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translate(0, 0) scale(1)',
              },
              '33%': {
                transform: 'translate(30px, -30px) scale(1.05)',
              },
              '66%': {
                transform: 'translate(-20px, 20px) scale(0.95)',
              },
            },
          }}
        />
      ))}

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Search Bar - Pastel Design */}
        <Box
          sx={{
            width: '100%',
            mb: 6,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <TextField
            id="menu-search-input"
            fullWidth
            placeholder="Menü ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#94A3B8', fontSize: 24 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: '800px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                color: '#1E293B',
                fontSize: '1.1rem',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                height: '56px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 1)',
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 1)',
                  border: '1px solid #BBDEFB',
                  boxShadow: '0 0 0 3px rgba(187, 222, 251, 0.2)',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                },
              },
              '& .MuiOutlinedInput-input': {
                '&::placeholder': {
                  color: '#94A3B8',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Content Area */}
        <Box sx={{ width: '100%' }}>
          {showSearchResults ? (
            <SearchResultsList
              results={searchResults}
              searchTerm={searchTerm}
              onItemClick={handleMenuClick}
            />
          ) : (
            <Grid
              container
              spacing={{ xs: 3, sm: 4, md: 5 }}
              columns={{ xs: 4, sm: 8, md: 12, lg: 15 }}
            >
              {menuItems.map((item) => (
                <Grid size={{ xs: 2, sm: 2, md: 2, lg: 1.5 }} key={item.id}>
                  <MenuCard
                    item={item}
                    onClick={() => handleMenuClick(item)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* SubMenu Dialog */}
      {selectedSubMenu && (
        <SubMenuDialog
          open={!!selectedSubMenu}
          onClose={() => setSelectedSubMenu(null)}
          parentItem={selectedSubMenu}
          onSubItemClick={handleSubItemClick}
        />
      )}
    </Box>
  );
}
