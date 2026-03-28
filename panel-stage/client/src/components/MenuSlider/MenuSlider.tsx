'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Stack,
  Fade,
  useTheme,
} from '@mui/material';
import { MenuSliderProps, MenuItem } from './types';
import MenuCard from './MenuCard';
import SlideControls from './SlideControls';
import SubMenuDialog from './SubMenuDialog';
import { useTabStore } from '@/stores/tabStore';

export default function MenuSlider({
  menuItems,
  autoRotate = true,
  autoRotateInterval = 5000,
  enableSubItems = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant = 'full',
  showBackground = true,
  onMenuClick,
  onSubItemClick,
  ariaLabel = 'Menü slider',
}: MenuSliderProps) {
  const router = useRouter();
  const theme = useTheme();
  const { addTab, setActiveTab } = useTabStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedSubMenu, setSelectedSubMenu] = useState<MenuItem | null>(null);
  const [menuHistory, setMenuHistory] = useState<MenuItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Touch state for swipe gestures
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % menuItems.length);
  }, [menuItems.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + menuItems.length) % menuItems.length);
  }, [menuItems.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (!autoRotate || isPaused || !mounted) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [autoRotate, autoRotateInterval, isPaused, mounted, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'Enter' && menuItems[currentSlide]) {
        handleMenuClick(menuItems[currentSlide]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, menuItems, nextSlide, prevSlide]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    const threshold = 50;
    if (touchStart - touchEnd > threshold) nextSlide();
    if (touchEnd - touchStart > threshold) prevSlide();
  };

  const handleMenuClick = (item: MenuItem) => {
    if (onMenuClick) {
      onMenuClick(item);
    }

    // If item has subItems, open submenu dialog
    if (item.subItems && item.subItems.length > 0) {
      setSelectedSubMenu(item);
      setMenuHistory([item]);
      return;
    }

    // Otherwise navigate to path
    if (item.path) {
      addTab({
        id: item.id,
        label: item.label,
        path: item.path,
      });
      setActiveTab(item.id);
      router.push(item.path);
    }
  };

  const handleSubItemClick = (subItem: MenuItem) => {
    if (onSubItemClick) {
      onSubItemClick(selectedSubMenu!, subItem);
    }

    // If subItem has its own subItems, "drill down" by updating the selected menu
    if (subItem.subItems && subItem.subItems.length > 0) {
      setSelectedSubMenu(subItem);
      setMenuHistory(prev => [...prev, subItem]);
      return;
    }

    // Otherwise navigate to path if it exists
    if (subItem.path) {
      addTab({
        id: subItem.id,
        label: subItem.label,
        path: subItem.path,
      });
      setActiveTab(subItem.id);
      router.push(subItem.path);
      handleCloseDialog();
    }
  };

  const handleBack = () => {
    if (menuHistory.length > 1) {
      const newHistory = [...menuHistory];
      newHistory.pop();
      const previous = newHistory[newHistory.length - 1];
      setMenuHistory(newHistory);
      setSelectedSubMenu(previous);
    } else {
      handleCloseDialog();
    }
  };

  const handleCloseDialog = () => {
    setSelectedSubMenu(null);
    setMenuHistory([]);
  };

  if (!menuItems || menuItems.length === 0) {
    return null;
  }

  const currentItem = menuItems[currentSlide];

  return (
    <Box
      role="region"
      aria-label={ariaLabel}
      sx={{
        position: 'relative',
        minHeight: '100vh',
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #F5F7FA 0%, #E8EEF5 50%, #F0F4F8 100%)'
          : 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1E293B 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        px: { xs: 2, sm: 3, md: 6 },
        py: { xs: 4, md: 6 },
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {showBackground && (
        <>
          {/* Animated Gradient Mesh Background */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: theme.palette.mode === 'light'
                ? `
                  radial-gradient(at 40% 20%, rgba(227, 242, 253, 0.6) 0px, transparent 50%),
                  radial-gradient(at 80% 0%, rgba(224, 242, 241, 0.5) 0px, transparent 50%),
                  radial-gradient(at 0% 50%, rgba(252, 228, 236, 0.4) 0px, transparent 50%),
                  radial-gradient(at 80% 50%, rgba(243, 229, 245, 0.5) 0px, transparent 50%),
                  radial-gradient(at 0% 100%, rgba(255, 253, 231, 0.4) 0px, transparent 50%),
                  radial-gradient(at 80% 100%, rgba(232, 245, 233, 0.5) 0px, transparent 50%)
                `
                : `
                  radial-gradient(at 40% 20%, rgba(30, 41, 59, 0.4) 0px, transparent 50%),
                  radial-gradient(at 80% 0%, rgba(15, 23, 42, 0.3) 0px, transparent 50%),
                  radial-gradient(at 0% 50%, rgba(51, 65, 85, 0.35) 0px, transparent 50%),
                  radial-gradient(at 80% 50%, rgba(30, 41, 59, 0.3) 0px, transparent 50%),
                  radial-gradient(at 0% 100%, rgba(15, 23, 42, 0.25) 0px, transparent 50%),
                  radial-gradient(at 80% 100%, rgba(30, 41, 59, 0.3) 0px, transparent 50%)
                `,
              animation: 'meshMove 25s linear infinite',
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
                width: [300, 250, 200, 180, 150, 120][i],
                height: [300, 250, 200, 180, 150, 120][i],
                borderRadius: '50%',
                top: `${[10, 20, 60, 70, 30, 80][i]}%`,
                left: `${[80, 15, 70, 20, 60, 85][i]}%`,
                opacity: [0.08, 0.06, 0.07, 0.05, 0.06, 0.08][i],
                background: [
                  'radial-gradient(circle, rgba(14, 165, 233, 0.4), transparent)',
                  'radial-gradient(circle, rgba(20, 184, 166, 0.4), transparent)',
                  'radial-gradient(circle, rgba(5, 150, 105, 0.4), transparent)',
                  'radial-gradient(circle, rgba(6, 182, 212, 0.4), transparent)',
                  'radial-gradient(circle, rgba(2, 132, 199, 0.4), transparent)',
                  'radial-gradient(circle, rgba(13, 148, 136, 0.4), transparent)',
                ][i],
                filter: 'blur(40px)',
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
        </>
      )}

      {/* Slider Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Fade in={mounted} key={currentSlide} timeout={800}>
          <Box>
            <Stack spacing={4} alignItems="center">
              {/* Current Menu Card */}
              <MenuCard
                item={currentItem}
                isActive={true}
                onClick={() => handleMenuClick(currentItem)}
                showSubItemsPreview={enableSubItems}
              />

              {/* Slide Controls */}
              {menuItems.length > 1 && (
                <SlideControls
                  currentIndex={currentSlide}
                  totalSlides={menuItems.length}
                  onPrevious={prevSlide}
                  onNext={nextSlide}
                  onGoTo={goToSlide}
                />
              )}
            </Stack>
          </Box>
        </Fade>
      </Box>

      {/* SubMenu Dialog */}
      {selectedSubMenu && (
        <SubMenuDialog
          open={!!selectedSubMenu}
          onClose={handleCloseDialog}
          parentItem={selectedSubMenu}
          onSubItemClick={handleSubItemClick}
          onBack={menuHistory.length > 1 ? handleBack : undefined}
        />
      )}
    </Box>
  );
}
