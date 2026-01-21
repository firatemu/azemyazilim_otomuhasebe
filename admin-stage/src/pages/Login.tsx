import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ExternalLink, AlertCircle, Loader2, X } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism card with shadow */}
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-primary/10 hover:shadow-2xl">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary to-secondary p-8 text-center">
            <div className="absolute inset-0 bg-grid opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="relative">
              <h1 className="text-3xl font-bold text-primary-foreground mb-2 tracking-tight">
                Admin Panel
              </h1>
              <p className="text-primary-foreground/80 text-sm tracking-wide">
                OtoMuhasebe Yönetim Paneli
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive flex-1">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground block">
                  Kullanıcı Adı
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Kullanıcı adınızı girin"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground block">
                  Şifre
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full mt-6 px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 tracking-wide"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Giriş yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Giriş Yap</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          OtoMuhasebe © {new Date().getFullYear()}
        </p>
      </div>

      {/* Subscription Dialog */}
      {noSubscriptionDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setNoSubscriptionDialogOpen(false)}
          />
          
          {/* Dialog */}
          <div className="relative bg-card rounded-2xl shadow-2xl border border-border max-w-md w-full animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setNoSubscriptionDialogOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Header */}
            <div className="p-8 text-center border-b border-border">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Üyelik Gerekli
              </h2>
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-4">
              <p className="text-foreground">
                Giriş yapabilmek için üye olmanız ve bir paket satın almanız gerekmektedir.
              </p>
              <p className="text-sm text-muted-foreground">
                Paketlerimizi inceleyerek size uygun planı seçebilirsiniz.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 bg-muted/30 flex gap-3">
              <button
                onClick={() => setNoSubscriptionDialogOpen(false)}
                className="flex-1 px-6 py-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors font-medium text-foreground"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  window.location.href = 'https://otomuhasebe.com';
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Hemen İncele</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
