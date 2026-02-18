import React from 'react';
import { Card, CardContent, Box, Typography, alpha } from '@mui/material';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info';
}

const colorMap = {
  primary: { main: 'rgb(216, 121, 67)', light: 'rgb(231, 138, 83)', bg: 'rgba(216, 121, 67, 0.1)' },
  success: { main: 'rgb(16, 185, 129)', light: 'rgb(52, 211, 153)', bg: 'rgba(16, 185, 129, 0.1)' },
  error: { main: 'rgb(239, 68, 68)', light: 'rgb(248, 113, 113)', bg: 'rgba(239, 68, 68, 0.1)' },
  warning: { main: 'rgb(245, 158, 11)', light: 'rgb(251, 191, 36)', bg: 'rgba(245, 158, 11, 0.1)' },
  info: { main: 'rgb(59, 130, 246)', light: 'rgb(96, 165, 250)', bg: 'rgba(59, 130, 246, 0.1)' },
};

export default function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = 'primary',
}: MetricCardProps) {
  const colors = colorMap[color];

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 25px -5px ${alpha(colors.main, 0.2)}, 0 10px 10px -5px ${alpha(colors.main, 0.1)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: `linear-gradient(135deg, ${alpha(colors.main, 0.1)} 0%, ${alpha(colors.light, 0.05)} 100%)`,
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
        }}
      />
      <CardContent sx={{ position: 'relative', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.main} 0%, ${colors.light} 100%)`,
              color: 'white',
              boxShadow: `0 4px 12px ${alpha(colors.main, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={24} />
          </Box>
          {change !== undefined && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: trend === 'up' ? alpha('rgb(16, 185, 129)', 0.1) : alpha('rgb(239, 68, 68)', 0.1),
              }}
            >
              {trend === 'up' ? (
                <TrendingUp size={16} color="rgb(16, 185, 129)" />
              ) : (
                <TrendingDown size={16} color="rgb(239, 68, 68)" />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend === 'up' ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                {change > 0 ? '+' : ''}{change}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            background: `linear-gradient(135deg, ${colors.main} 0%, ${colors.light} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}
