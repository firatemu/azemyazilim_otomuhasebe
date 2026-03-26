'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  Stack,
  Checkbox,
  FormControlLabel,
  Link,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  LoginOutlined,
  AccountBalance,
  TrendingUp,
  CloudDone,
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
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 3D Tilt state
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Magnetic button state
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonTranslate, setButtonTranslate] = useState({ x: 0, y: 0 });

  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Content slides
  const slides = [
    {
      title: 'Kurumsal Kaynak Planlama',
      description: 'Stok, fatura, cari ve çok daha fazlası - tek bir platformda',
      icon: <AccountBalance sx={{ fontSize: 48, color: '#FFFFFF' }} />,
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    },
    {
      title: 'Gerçek Zamanlı Analitik',
      description: 'Anlık raporlama ve dashboard ile kararlarınızı güçlendirin',
      icon: <TrendingUp sx={{ fontSize: 48, color: '#FFFFFF' }} />,
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    },
    {
      title: 'Mobil Uyumlu',
      description: 'Her yerden erişim ile işletmenizi yönetiminizi kesintisiz sürdürün',
      icon: <CloudDone sx={{ fontSize: 48, color: '#FFFFFF' }} />,
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [mounted]);

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

      const slimUser = {
        id: user?.id,
        email: user?.email,
        username: user?.username,
        fullName: user?.fullName,
        role: user?.role != null ? String(user.role) : undefined,
        tenantId: user?.tenantId ?? null,
      };

      await fetch('/api/auth/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          refreshToken,
          tenantId: user.tenantId,
          user: slimUser,
        }),
      });

      router.push('/menu');
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { message?: string } } };
      const status = ax.response?.status;
      const msg = ax.response?.data?.message;
      if (status === 503) {
        setError(msg || 'API sunucusuna bağlanılamadı. Backend çalışıyor mu?');
      } else {
        setError(msg || 'Giriş başarısız');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setRotate({ x: rotateX, y: rotateY });

    // Update mouse position for spotlight
    setMousePosition({ x, y });
  };

  const handleCardMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleButtonMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setButtonTranslate({ x: x * 0.2, y: y * 0.2 });
  };

  const handleButtonMouseLeave = () => {
    setButtonTranslate({ x: 0, y: 0 });
  };

  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'rgb(30, 58, 138)',
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
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'rgb(30, 58, 138)',
        position: 'relative',
        overflow: 'hidden',
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
            radial-gradient(at 40% 20%, hsla(228, 89%, 56%, 0.25) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0.25) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(355, 85%, 63%, 0.15) 0px, transparent 50%),
            radial-gradient(at 80% 50%, hsla(340, 100%, 76%, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(269, 100%, 77%, 0.25) 0px, transparent 50%),
            radial-gradient(at 80% 100%, hsla(225, 100%, 77%, 0.25) 0px, transparent 50%)
          `,
          animation: 'meshMove 20s linear infinite',
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

      {/* Sol Panel - Content Slider */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: '0 0 45%',
          maxWidth: 600,
          px: { md: 6, lg: 10 },
          py: 6,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Fade in={true} key={currentSlide} timeout={800}>
          <Stack spacing={4} alignItems="center">
            {/* Animated Icon Box */}
            <Box
              sx={{
                p: 4,
                borderRadius: '28px',
                background: slides[currentSlide].gradient,
                boxShadow: `0 20px 60px ${slides[currentSlide].gradient.split(', ')[1].replace(')', ', 0.3)')}`,
                animation: 'iconFloat 4s ease-in-out infinite',
                '@keyframes iconFloat': {
                  '0%, 100%': { transform: 'translateY(0) scale(1)' },
                  '50%': { transform: 'translateY(-10px) scale(1.02)' },
                },
              }}
            >
              {slides[currentSlide].icon}
            </Box>

            {/* Slide Content */}
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                {slides[currentSlide].title}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 400,
                  maxWidth: 400,
                  lineHeight: 1.6,
                }}
              >
                {slides[currentSlide].description}
              </Typography>
            </Stack>

            {/* Slide Indicators */}
            <Stack direction="row" spacing={1.5}>
              {slides.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: index === currentSlide ? 24 : 8,
                    height: 8,
                    borderRadius: '4px',
                    background: index === currentSlide ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.6)',
                    },
                  }}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </Stack>
          </Stack>
        </Fade>
      </Box>

      {/* Sağ Panel - Glass Form Card */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 3 },
          py: { xs: 4, md: 6 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Fade in={mounted} timeout={600}>
          <Card
            elevation={0}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            sx={{
              width: '100%',
              maxWidth: 440,
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.3)
              `,
              overflow: 'visible',
              transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              transition: 'transform 0.15s ease-out',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: '24px',
                background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.15), transparent 40%)`,
                pointerEvents: 'none',
                opacity: 0.6,
              },
            }}
          >
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Header */}
              <Stack spacing={1} sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.03em',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  OtoMuhasebe ERP
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 400 }}>
                  İşletmenizi yönetmek için güvenli giriş
                </Typography>
              </Stack>

              {error && (
                <Fade in={!!error}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#FFFFFF',
                      '& .MuiAlert-icon': {
                        color: '#FCA5A5',
                      },
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* Username Field with Spotlight */}
                  <TextField
                    fullWidth
                    label="Kullanıcı adı veya e-posta"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="username"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{
                            color: '#FFFFFF',
                            fontSize: 26,
                            filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.5))'
                          }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        color: '#FFFFFF',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          borderWidth: '1px',
                        },
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.15)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                          },
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(14, 165, 233, 0.8)',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#FFFFFF',
                        fontWeight: 500,
                        fontSize: '1rem',
                        textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                        transform: 'translateY(0)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        transform: 'translateY(-24px) scale(0.95)',
                        textShadow: '0 0 16px rgba(255, 255, 255, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)',
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translateY(-24px) scale(0.95)',
                        color: '#FFFFFF',
                        fontWeight: 500,
                        fontSize: '1rem',
                      },
                      '& .MuiInputBase-input': {
                        color: '#FFFFFF',
                        fontWeight: 400,
                        fontSize: '1.1rem',
                        letterSpacing: '0.5px',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(14, 165, 233, 0.3)',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 400,
                        opacity: 1,
                        letterSpacing: '0.3px',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '8px',
                      },
                    }}
                  />

                  {/* Password Field with Spotlight */}
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
                          <Lock sx={{
                            color: '#FFFFFF',
                            fontSize: 26,
                            filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.5))'
                          }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                            sx={{
                              color: '#FFFFFF',
                              fontSize: 24,
                              transition: 'all 0.2s ease',
                              filter: 'drop-shadow(0 0 6px rgba(0, 0, 0, 0.4))',
                              '&:hover': {
                                color: '#FFFFFF',
                                background: 'rgba(255, 255, 255, 0.2)',
                                filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.5))',
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
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        color: '#FFFFFF',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          borderWidth: '1px',
                        },
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.15)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                          },
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(14, 165, 233, 0.8)',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#FFFFFF',
                        fontWeight: 500,
                        fontSize: '1rem',
                        textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                        transform: 'translateY(0)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#FFFFFF',
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        transform: 'translateY(-24px) scale(0.95)',
                        textShadow: '0 0 16px rgba(255, 255, 255, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)',
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translateY(-24px) scale(0.95)',
                        color: '#FFFFFF',
                        fontWeight: 500,
                        fontSize: '1rem',
                      },
                      '& .MuiInputBase-input': {
                        color: '#FFFFFF',
                        fontWeight: 400,
                        fontSize: '1.1rem',
                        letterSpacing: '0.5px',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(14, 165, 233, 0.3)',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontWeight: 400,
                        opacity: 1,
                        letterSpacing: '0.3px',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderRadius: '8px',
                      },
                    }}
                  />

                  {/* Remember Me & Forgot Password */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          sx={{
                            color: 'rgb(203, 213, 225)',
                            '&.Mui-checked': {
                              color: '#0ea5e9',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}
                        >
                          Beni hatırla
                        </Typography>
                      }
                    />
                    <Box sx={{ flex: 1 }} />
                    <Link
                      href="/forgot-password"
                      sx={{
                        color: 'rgb(203, 213, 225)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: '#FFFFFF',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Şifremi unuttum
                    </Link>
                  </Stack>

                  {/* Magnetic Animated Button */}
                  <Button
                    ref={buttonRef}
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    onMouseMove={handleButtonMouseMove}
                    onMouseLeave={handleButtonMouseLeave}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginOutlined />}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      color: '#FFFFFF',
                      boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
                      transform: `translate(${buttonTranslate.x}px, ${buttonTranslate.y}px)`,
                      transition: 'transform 0.1s ease-out, background 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                        boxShadow: '0 12px 32px rgba(14, 165, 233, 0.5)',
                      },
                      '&:active': {
                        transform: `translate(${buttonTranslate.x * 0.5}px, ${buttonTranslate.y * 0.5}px)`,
                      },
                      '&:disabled': {
                        opacity: 0.7,
                        transform: 'none',
                        background: 'rgba(203, 213, 225, 0.3)',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
                  </Button>
                </Stack>
              </form>

              {/* Footer */}
              <Typography
                variant="caption"
                component="p"
                sx={{
                  mt: 4,
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '0.01em',
                  fontWeight: 400,
                }}
              >
                © {new Date().getFullYear()} Oto Muhasebe · Kurumsal Kaynak Planlama Çözümü
              </Typography>
            </Box>
          </Card>
        </Fade>
      </Box>
    </Box>
  );
}
