'use client';

import React from 'react';
import {
  Box,
  IconButton,
  Stack,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { SlideControlsProps } from './types';

export default function SlideControls({
  currentIndex,
  totalSlides,
  onPrevious,
  onNext,
  onGoTo,
}: SlideControlsProps) {
  return (
    <Stack
      direction="row"
      spacing={3}
      alignItems="center"
      sx={{
        mt: 4,
      }}
    >
      {/* Previous Button */}
      <IconButton
        onClick={onPrevious}
        disabled={currentIndex === 0}
        aria-label="Önceki menü"
        sx={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          color: '#FFFFFF',
          width: 48,
          height: 48,
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
            transform: 'scale(1.05)',
          },
          '&:disabled': {
            opacity: 0.3,
            color: 'rgba(255, 255, 255, 0.5)',
          },
        }}
      >
        <ChevronLeft sx={{ fontSize: 28 }} />
      </IconButton>

      {/* Dot Indicators */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          flex: 1,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {Array.from({ length: totalSlides }).map((_, index) => (
          <Box
            key={index}
            onClick={() => onGoTo(index)}
            sx={{
              width: index === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: '4px',
              background: index === currentIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              '&:hover': {
                background: index === currentIndex
                  ? '#FFFFFF'
                  : 'rgba(255, 255, 255, 0.6)',
                transform: index === currentIndex ? 'scale(1.1)' : 'scale(1.2)',
              },
            }}
          />
        ))}
      </Stack>

      {/* Next Button */}
      <IconButton
        onClick={onNext}
        disabled={currentIndex === totalSlides - 1}
        aria-label="Sonraki menü"
        sx={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          color: '#FFFFFF',
          width: 48,
          height: 48,
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
            transform: 'scale(1.05)',
          },
          '&:disabled': {
            opacity: 0.3,
            color: 'rgba(255, 255, 255, 0.5)',
          },
        }}
      >
        <ChevronRight sx={{ fontSize: 28 }} />
      </IconButton>
    </Stack>
  );
}
