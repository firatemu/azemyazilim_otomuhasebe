'use client';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  LinearProgress,
  InputAdornment,
  IconButton,
  Fade,
  Divider,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  LoginOutlined,
  AutoAwesome,
  Security,
  Speed,
  BusinessCenter,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import axios from '@/lib/axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  // Prevent hydration mismatch from browser extensions
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', {
        username,
        password,
      });

      const { user, accessToken, refreshToken } = response.data;
      setAuth(user, accessToken, refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch - render only after mount
  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
        px: 2,
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {/* Floating Circles */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              borderRadius: '50%',
              background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
              '@keyframes float': {
                '0%, 100%': {
                  transform: 'translate(0, 0) scale(1)',
                  opacity: 0.3,
                },
                '50%': {
                  transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(${1 + Math.random() * 0.3})`,
                  opacity: 0.6,
                },
              },
            }}
          />
        ))}
      </Box>

      <Container maxWidth="sm">
        <Fade in={mounted} timeout={800}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 60px color-mix(in srgb, var(--foreground) 30%, transparent), 0 0 0 1px color-mix(in srgb, var(--card) 10%, transparent)',
              overflow: 'hidden',
              background: 'var(--card)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {loading && (
              <LinearProgress
                sx={{
                  height: 3,
                  background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                  },
                }}
              />
            )}

            {/* Header Section */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                p: 4,
                textAlign: 'center',
                color: 'var(--primary-foreground)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative Pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: alpha('#fff', 0.1),
                  filter: 'blur(40px)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: alpha('#fff', 0.1),
                  filter: 'blur(30px)',
                }}
              />

              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}
                >
                  <AutoAwesome sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    Oto Muhasebe
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.95,
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                    }}
                  >
                    Hesabınıza giriş yapın
                  </Typography>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {error && (
                <Fade in={!!error}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        fontSize: 24,
                      }
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Kullanıcı Adı veya E-posta"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="username"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: 'var(--primary)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: 'var(--input)',
                        '&:hover': {
                          backgroundColor: 'var(--card)',
                          '& fieldset': {
                            borderColor: 'var(--primary)',
                            borderWidth: 2,
                          },
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'var(--card)',
                          '& fieldset': {
                            borderColor: 'var(--primary)',
                            borderWidth: 2,
                          },
                        },
                        '& fieldset': {
                          borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'var(--primary)',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Şifre"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'var(--secondary)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              color: 'var(--secondary)',
                              '&:hover': {
                                backgroundColor: 'color-mix(in srgb, var(--secondary) 10%, transparent)',
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: 'var(--input)',
                        '&:hover': {
                          backgroundColor: 'var(--card)',
                          '& fieldset': {
                            borderColor: 'var(--secondary)',
                            borderWidth: 2,
                          },
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'var(--card)',
                          '& fieldset': {
                            borderColor: 'var(--secondary)',
                            borderWidth: 2,
                          },
                        },
                        '& fieldset': {
                          borderColor: 'color-mix(in srgb, var(--secondary) 30%, transparent)',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: 'var(--secondary)',
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    startIcon={<LoginOutlined />}
                    sx={{
                      mt: 1,
                      py: 1.75,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                      color: 'var(--primary-foreground)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 4px 15px color-mix(in srgb, var(--primary) 40%, transparent)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, var(--primary-hover) 0%, var(--secondary-hover) 100%)',
                        boxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 60%, transparent)',
                        transform: 'translateY(-2px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        opacity: 0.7,
                      },
                    }}
                  >
                    {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                  </Button>
                </Stack>
              </form>

              <Divider sx={{ my: 4, borderColor: 'color-mix(in srgb, var(--primary) 10%, transparent)' }} />

              {/* Feature Badges */}
              <Stack
                direction="row"
                spacing={3}
                justifyContent="center"
                flexWrap="wrap"
                sx={{ gap: 2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Security sx={{ fontSize: 18, color: 'var(--primary)' }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    Güvenli
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: 'color-mix(in srgb, var(--secondary) 8%, transparent)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Speed sx={{ fontSize: 18, color: 'var(--secondary)' }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    Hızlı
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <BusinessCenter sx={{ fontSize: 18, color: 'var(--primary)' }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    Profesyonel
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="caption" sx={{ opacity: 0.7, color: 'text.secondary' }}>
                  © 2026 Oto Muhasebe • Bir Azem Yazılım Ürünüdür.Tüm hakları saklıdır
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}
