'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Inventory2Icon from '@mui/icons-material/Inventory2';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Stok Yönetimi Modülü Error Boundary
 * Tüm stok sayfalarını hatalara karşı korur
 */
export class InventoryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[InventoryErrorBoundary] Error caught:', error, errorInfo);

    // Burada error tracking servisine gönderebilirsiniz (Sentry, LogRocket vb.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback varsa kullan
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Varsayılan error UI
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            sx={{
              p: 5,
              textAlign: 'center',
              bgcolor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 2,
            }}
          >
            <Inventory2Icon
              sx={{
                fontSize: 64,
                color: '#ef4444',
                mb: 2,
                opacity: 0.5,
              }}
            />

            <ErrorOutlineIcon
              sx={{
                fontSize: 48,
                color: '#ef4444',
                mb: 2,
              }}
            />

            <Typography variant="h5" gutterBottom fontWeight="bold" color="error">
              Stok Yönetimi Hatası
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              Stok modülü yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin veya
              daha sonra tekrar deneyin.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  textAlign: 'left',
                  bgcolor: '#1e1e1e',
                  color: '#d4d4d4',
                  p: 2,
                  borderRadius: 1,
                  mb: 3,
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  maxWidth: 600,
                  mx: 'auto',
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#ff6b6b', mb: 1 }}>
                  {this.state.error.toString()}
                </Typography>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                  {this.state.error.stack}
                </pre>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                sx={{ minWidth: 140 }}
              >
                Tekrar Dene
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => window.location.href = '/stok'}
                sx={{ minWidth: 140 }}
              >
                Ana Sayfaya Dön
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}
