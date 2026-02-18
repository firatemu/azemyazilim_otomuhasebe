'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Grid,
} from '@mui/material';
import { Refresh, CloudDownload, CheckCircle, VpnKey, FilterList } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import IncomingGrid from '@/components/efatura/IncomingGrid';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';

export default function GelenEFaturaPage() {
  const [lastRefresh, setLastRefresh] = React.useState<Date | null>(null);
  const [isGettingToken, setIsGettingToken] = React.useState(false);
  const [filterError, setFilterError] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<Date | null>(() => {
    // Varsayılan: Son 30 gün
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());

  // Token durumu kontrolü
  // Proxy üzerinden backend'e istek atıyoruz (Authorization header otomatik eklenir)
  const { data: tokenStatus, refetch: refetchTokenStatus } = useQuery({
    queryKey: ['hizli-token-status'],
    queryFn: async () => {
      // Proxy kullanarak backend'e istek at (axios instance Authorization header ekler)
      const response = await axios.get('/hizli/token-status');
      return response.data;
    },
    refetchInterval: 60000, // 1 dakikada bir kontrol et
  });

  const handleRefresh = async () => {
    setLastRefresh(new Date());
    await refetchTokenStatus();
    // IncomingGrid component'i kendi query'sini yeniler
    window.dispatchEvent(new CustomEvent('refresh-incoming-grid', {
      detail: { startDate, endDate }
    }));
  };

  const handleDateFilter = () => {
    setFilterError(null);

    if (!startDate || !endDate) {
      setFilterError('Lütfen başlangıç ve bitiş tarihlerini seçin.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start > end) {
      setFilterError('Başlangıç tarihi bitiş tarihinden sonra olamaz.');
      return;
    }
    if (end > today) {
      setFilterError('Bitiş tarihi bugünden sonra olamaz.');
      return;
    }

    // Tarih aralığı 6 aydan fazla olamaz (API kısıtı)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const maxDays = 180; // 6 ay = ~180 gün

    if (diffDays > maxDays) {
      setFilterError(`Tarih aralığı en fazla 6 ay (${maxDays} gün) olabilir. Lütfen daha kısa bir aralık seçin.`);
      return;
    }

    // Tarih filtresi değiştiğinde grid'i yenile
    window.dispatchEvent(new CustomEvent('refresh-incoming-grid', {
      detail: { startDate, endDate }
    }));
  };

  const handleGetToken = async () => {
    setIsGettingToken(true);
    try {
      const response = await axios.post('/hizli/auto-login');
      if (response.data.success) {
        // Token başarıyla alındı, durumu yenile
        await refetchTokenStatus();
        window.dispatchEvent(new Event('refresh-incoming-grid'));
      } else {
        alert('Token alınamadı: ' + (response.data.message || 'Bilinmeyen hata'));
      }
    } catch (error: any) {
      alert('Token alma hatası: ' + (error.response?.data?.message || error.message || 'Bilinmeyen hata'));
    } finally {
      setIsGettingToken(false);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Gelen E-Faturalar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hızlı Teknoloji entegratöründen gelen e-faturalarınız
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
            }}
          >
            Yenile
          </Button>
        </Box>

        {/* Token Durumu */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Bağlantı Durumu Başlık */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Bağlantı Durumu:
                </Typography>
                {!tokenStatus ? (
                  <>
                    <Chip
                      label="Token durumu kontrol ediliyor..."
                      color="warning"
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VpnKey />}
                      onClick={handleGetToken}
                      disabled={isGettingToken}
                      sx={{ ml: 2 }}
                    >
                      {isGettingToken ? 'Token Alınıyor...' : 'Token Al'}
                    </Button>
                  </>
                ) : tokenStatus.isValid ? (
                  <Chip
                    icon={<CheckCircle />}
                    label={`Token Geçerli${tokenStatus.daysUntilExpiry ? ` (${tokenStatus.daysUntilExpiry} gün sonra expire)` : ''}`}
                    color="success"
                    size="small"
                  />
                ) : (
                  <>
                    <Chip
                      label={tokenStatus.hasToken ? 'Token Expired' : 'Token Bulunamadı'}
                      color="error"
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VpnKey />}
                      onClick={handleGetToken}
                      disabled={isGettingToken}
                      sx={{ ml: 2 }}
                    >
                      {isGettingToken ? 'Token Alınıyor...' : 'Token Al'}
                    </Button>
                  </>
                )}
              </Box>

              {/* Detaylı Bilgiler */}
              {tokenStatus && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                  {/* Token Bilgisi */}
                  {tokenStatus.token && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>
                        Token:
                      </Typography>
                      <Chip
                        label={tokenStatus.token}
                        size="small"
                        sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                      />
                      {tokenStatus.tokenLength && (
                        <Typography variant="caption" color="text.secondary">
                          ({tokenStatus.tokenLength} karakter)
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Hash'li Kullanıcı Adı */}
                  {tokenStatus.hashedUsername && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>
                        Hash'li Kullanıcı Adı:
                      </Typography>
                      <Chip
                        label={tokenStatus.hashedUsername}
                        size="small"
                        sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                      />
                      {tokenStatus.hashedUsernameLength && (
                        <Typography variant="caption" color="text.secondary">
                          ({tokenStatus.hashedUsernameLength} karakter)
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Hash'li Şifre */}
                  {tokenStatus.hashedPassword && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>
                        Hash'li Şifre:
                      </Typography>
                      <Chip
                        label={tokenStatus.hashedPassword}
                        size="small"
                        sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                      />
                      {tokenStatus.hashedPasswordLength && (
                        <Typography variant="caption" color="text.secondary">
                          ({tokenStatus.hashedPasswordLength} karakter)
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Encryption Durumu */}
                  {tokenStatus.encryptionStatus && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>
                        Şifreleme Durumu:
                      </Typography>
                      <Chip
                        label={tokenStatus.encryptionStatus}
                        size="small"
                        color={tokenStatus.encryptionStatus === 'Başarılı' ? 'success' : tokenStatus.encryptionStatus === 'Başarısız' ? 'error' : 'default'}
                      />
                    </Box>
                  )}

                  {/* Login Durumu */}
                  {tokenStatus.loginStatus && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>
                        Login Durumu:
                      </Typography>
                      <Chip
                        label={tokenStatus.loginStatus}
                        size="small"
                        color={tokenStatus.loginStatus === 'Başarılı' ? 'success' : tokenStatus.loginStatus === 'Başarısız' ? 'error' : 'default'}
                      />
                    </Box>
                  )}

                  {/* Son Geçerlilik */}
                  {tokenStatus?.expiresAt && (
                    <Typography variant="caption" color="text.secondary">
                      Son Geçerlilik: {new Date(tokenStatus.expiresAt).toLocaleString('tr-TR')}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Tarih Filtresi */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <FilterList sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Tarih Aralığı:
              </Typography>
              <TextField
                label="Başlangıç Tarihi"
                type="date"
                size="small"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setStartDate(date);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ width: 200 }}
                inputProps={{
                  max: endDate ? endDate.toISOString().split('T')[0] : undefined,
                }}
              />
              <TextField
                label="Bitiş Tarihi"
                type="date"
                size="small"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setEndDate(date);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ width: 200 }}
                inputProps={{
                  min: startDate ? startDate.toISOString().split('T')[0] : undefined,
                  max: new Date().toISOString().split('T')[0],
                }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleDateFilter}
                sx={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                }}
              >
                Filtrele
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const date = new Date();
                  date.setDate(date.getDate() - 30);
                  setStartDate(date);
                  setEndDate(new Date());
                  setFilterError(null);
                  setTimeout(handleDateFilter, 100);
                }}
              >
                Son 30 Gün
              </Button>
            </Box>
            {filterError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {filterError}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Son Yenileme */}
        {lastRefresh && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Son yenileme: {lastRefresh.toLocaleTimeString('tr-TR')}
          </Alert>
        )}

        {/* E-Fatura Grid */}
        <Paper elevation={2} sx={{ p: 3, height: 'calc(100vh - 400px)', minHeight: 600 }}>
          <IncomingGrid startDate={startDate} endDate={endDate} />
        </Paper>
      </Box>
    </MainLayout>
  );
}

