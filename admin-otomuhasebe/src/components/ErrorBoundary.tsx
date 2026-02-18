import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        bgcolor: '#f5f5f5',
                        p: 3,
                    }}
                >
                    <Container maxWidth="md">
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h4" color="error" gutterBottom fontWeight="bold">
                                Something went wrong
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                The application encountered an unexpected error.
                            </Typography>

                            {this.state.error && (
                                <Box
                                    sx={{
                                        mt: 3,
                                        mb: 3,
                                        p: 2,
                                        bgcolor: '#fff0f0',
                                        borderRadius: 1,
                                        border: '1px solid #ffcdd2',
                                        textAlign: 'left',
                                        overflow: 'auto',
                                        maxHeight: '300px',
                                    }}
                                >
                                    <Typography variant="subtitle2" color="error" fontFamily="monospace">
                                        {this.state.error.toString()}
                                    </Typography>
                                    {this.state.errorInfo && (
                                        <Typography
                                            variant="caption"
                                            component="pre"
                                            sx={{ mt: 1, whiteSpace: 'pre-wrap' }}
                                            fontFamily="monospace"
                                        >
                                            {this.state.errorInfo.componentStack}
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            <Button
                                variant="contained"
                                onClick={() => window.location.reload()}
                                sx={{ mt: 2 }}
                            >
                                Reload Page
                            </Button>
                        </Paper>
                    </Container>
                </Box>
            );
        }

        return this.props.children;
    }
}
