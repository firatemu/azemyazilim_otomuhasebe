'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class FaturaErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Fatura ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Hata bildirimi yapılabilir (Sentry, LogRocket vb.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
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
              p: 4,
              textAlign: 'center',
              bgcolor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 2,
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 64,
                color: '#ef4444',
                mb: 2,
              }}
            />

            <Typography variant="h5" gutterBottom color="error">
              Bir Hata Oluştu
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Fatura modülü yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin veya
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
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#ff6b6b', mb: 1 }}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                sx={{ minWidth: 120 }}
              >
                Tekrar Dene
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => window.location.href = '/fatura'}
                sx={{ minWidth: 120 }}
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
