import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { LogIn, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [noSubscriptionDialogOpen, setNoSubscriptionDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre gereklidir');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      toast.success('Giriş başarılı!');
      navigate('/dashboard');
    } catch (err: any) {
      // Admin olmayan kullanıcı erişim denemesi → özel mesaj
      if (err.message === 'ADMIN_ONLY_ACCESS') {
        const adminOnlyError = 'Bu panel sadece admin kullanıcıları için erişilebilir. Lütfen panel.otomuhasebe.com kullanın.';
        setError(adminOnlyError);
        toast.error(adminOnlyError);
        // Token'ları temizle
        useAuthStore.getState().logout();
      }
      // Kullanıcı adı bulunamadı → paket sayfasına yönlendir
      else if (err.message === 'USER_NOT_FOUND') {
        setNoSubscriptionDialogOpen(true);
        // Token'ları temizle
        useAuthStore.getState().logout();
      }
      // Şifre yanlış → şifre yanlış uyarısı
      else if (err.message === 'WRONG_PASSWORD') {
        const passwordError = 'Şifre yanlış. Lütfen şifrenizi kontrol edin.';
        setError(passwordError);
        toast.error(passwordError);
      }
      // Subscription yok kontrolü - hiç subscription yoksa özel dialog göster
      else if (err.message === 'NO_SUBSCRIPTION') {
        setNoSubscriptionDialogOpen(true);
        // Token'ları temizle
        useAuthStore.getState().logout();
      } 
      // Demo hesap kontrolü - tenant ID yoksa ve onaylanmış subscription yoksa özel mesaj göster
      else if (err.message === 'DEMO_ACCOUNT_PENDING') {
        const demoMessage = 'Demo Hesabınız Hazırlanıyor. Lütfen admin onayını bekleyin.';
        setError(demoMessage);
        toast.warning(demoMessage);
        // Token'ları temizle çünkü tenant ID yok
        useAuthStore.getState().logout();
      } else {
        // Genel hata mesajı
        const errorMessage = err.response?.data?.message || err.message || 'Giriş başarısız';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Login error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Admin Panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                OtoMuhasebe Yönetim Paneli
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Kullanıcı Adı"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                autoComplete="username"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <TextField
                fullWidth
                label="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                autoComplete="current-password"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading || !username || !password}
                startIcon={<LogIn />}
                sx={{ mt: 3, py: 1.5 }}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>

      {/* Subscription Yok Dialog */}
      <Dialog
        open={noSubscriptionDialogOpen}
        onClose={() => setNoSubscriptionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="error">
            Üyelik Gerekli
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            Giriş yapabilmek için üye olmanız ve bir paket satın almanız gerekmektedir.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Paketlerimizi inceleyerek size uygun planı seçebilirsiniz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ExternalLink />}
            onClick={() => {
              window.location.href = 'https://otomuhasebe.com';
            }}
            sx={{ minWidth: 200 }}
          >
            Hemen İncele
          </Button>
          <Button
            variant="outlined"
            onClick={() => setNoSubscriptionDialogOpen(false)}
            sx={{ minWidth: 100 }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
