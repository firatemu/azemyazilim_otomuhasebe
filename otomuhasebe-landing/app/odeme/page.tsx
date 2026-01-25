'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, CreditCard, Calendar, AlertCircle, Loader, CheckCircle, Building2, Banknote, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Plan {
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
}

const plans: Record<string, Plan> = {
  BASIC: {
    name: 'BASIC',
    monthlyPrice: '₺2,870',
    annualPrice: '₺2,870',
    features: ['1 Kullanıcı', '1 Yıl', '1 Şirket', '100 Fatura/ay', 'Temel raporlar', 'Email destek', '7/24 Erişim'],
  },
  PROFESSIONAL: {
    name: 'PROFESSIONAL',
    monthlyPrice: '₺5,750',
    annualPrice: '₺5,750',
    features: ['1 Kullanıcı', '1 Yıl', '3 Şirket', 'Sınırsız fatura', 'Gelişmiş raporlar', 'E-arşiv entegrasyonu', 'Öncelikli destek', 'API erişimi'],
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    monthlyPrice: 'Özel Fiyat',
    annualPrice: 'Özel Fiyat',
    features: ['1 Kullanıcı', '1 Yıl', 'Sınırsız şirket', 'API erişimi', 'Özel entegrasyonlar', 'Dedicated hesap yöneticisi', 'SLA garantisi', 'Özel eğitim'],
  },
};

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer'>('credit_card');
  const [showBankDetails, setShowBankDetails] = useState(false);

  const planName = searchParams.get('plan') || 'PROFESSIONAL';
  const billingType = searchParams.get('type') || 'annual'; // annual (1 yıllık)
  const plan = plans[planName] || plans.PROFESSIONAL;
  const isTrial = searchParams.get('trial') === 'true';
  const [additionalUsers, setAdditionalUsers] = useState(0);
  const additionalUserPrice = 1435; // Ek kullanıcı yıllık fiyatı

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (accessToken && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      // Giriş yapmamışsa giriş sayfasına yönlendir
      router.push(`/giris?redirect=/odeme?plan=${planName}&type=${billingType}${isTrial ? '&trial=true' : ''}`);
    }
  };

  const handlePayment = async () => {
    if (!isAuthenticated) {
      router.push(`/giris?redirect=/odeme?plan=${planName}&type=${billingType}${isTrial ? '&trial=true' : ''}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.otomuhasebe.com';
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      }

      if (isTrial) {
        // Deneme sürümü başlat
        const response = await fetch(`${apiUrl}/api/subscriptions/start-trial`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        // Response'u güvenli şekilde parse et
        let data: any = {};
        const responseText = await response.text();

        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error('JSON parse hatası:', e, 'Response:', responseText);
            throw new Error('Sunucudan geçersiz yanıt alındı');
          }
        }

        if (!response.ok) {
          // Unauthorized hatası durumunda login sayfasına yönlendir
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            router.push(`/giris?redirect=/odeme?plan=${planName}&type=${billingType}&trial=true&error=session_expired`);
            setLoading(false);
            return;
          }
          throw new Error(data?.message || data?.error || 'Deneme sürümü başlatılamadı');
        }

        // Başarılı - başvuru mesajı göster
        setShowSuccessModal(true);

        // 3 saniye sonra panel'e yönlendir
        setTimeout(() => {
          window.location.href = 'https://panel.otomuhasebe.com';
        }, 3000);
      } else {
        // Satın alma işlemi - deneme varsa yükselt, yoksa yeni abonelik oluştur
        // Önce mevcut aboneliği kontrol et
        const currentSubResponse = await fetch(`${apiUrl}/api/subscriptions/current?tenantId=${user.tenantId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        // Unauthorized hatası durumunda login sayfasına yönlendir
        if (currentSubResponse.status === 401 || currentSubResponse.status === 403) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push(`/giris?redirect=/odeme?plan=${planName}&type=${billingType}&error=session_expired`);
          setLoading(false);
          return;
        }

        let response;
        if (currentSubResponse.ok) {
          // Response'u güvenli şekilde parse et
          let currentSub: any = {};
          const currentSubText = await currentSubResponse.text();
          if (currentSubText) {
            try {
              currentSub = JSON.parse(currentSubText);
            } catch (e) {
              console.error('JSON parse hatası (currentSub):', e, 'Response:', currentSubText);
              currentSub = {};
            }
          }

          // Eğer deneme aboneliği varsa yükselt
          if (currentSub && currentSub.status === 'TRIAL') {
            response = await fetch(`${apiUrl}/api/subscriptions/upgrade`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                planName: planName,
                paymentMethod: paymentMethod,
              }),
            });
          } else {
            // Yeni abonelik oluştur
            response = await fetch(`${apiUrl}/api/subscriptions/create`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tenantId: user.tenantId,
                planName: planName,
                billingType: 'annual',
                paymentMethod: paymentMethod,
              }),
            });
          }
        } else {
          // Yeni abonelik oluştur
          response = await fetch(`${apiUrl}/api/subscriptions/create`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tenantId: user.tenantId,
              planName: planName,
              billingType: 'annual',
              paymentMethod: paymentMethod,
            }),
          });
        }

        // Response'u güvenli şekilde parse et
        let data: any = {};
        const responseText = await response.text();

        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error('JSON parse hatası:', e, 'Response:', responseText);
            throw new Error('Sunucudan geçersiz yanıt alındı');
          }
        }

        if (!response.ok) {
          // Unauthorized hatası durumunda login sayfasına yönlendir
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            router.push(`/giris?redirect=/odeme?plan=${planName}&type=${billingType}&error=session_expired`);
            setLoading(false);
            return;
          }
          throw new Error(data?.message || data?.error || 'Ödeme işlemi başlatılamadı');
        }

        // Banka havalesi seçildiyse, özel mesaj göster
        if (paymentMethod === 'bank_transfer') {
          setShowSuccessModal(true);
          // Modal'da banka bilgileri gösterilecek
          setTimeout(() => {
            window.location.href = 'https://panel.otomuhasebe.com?payment=pending';
          }, 5000);
          return;
        }

        // Ek kullanıcı satın alma işlemi
        if (additionalUsers > 0) {
          const additionalUsersResponse = await fetch(`${apiUrl}/api/licenses/purchase/additional-users`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quantity: additionalUsers,
            }),
          });

          if (!additionalUsersResponse.ok) {
            // Response'u güvenli şekilde parse et
            let errorData: any = {};
            const errorText = await additionalUsersResponse.text();
            if (errorText) {
              try {
                errorData = JSON.parse(errorText);
              } catch (e) {
                console.error('JSON parse hatası (additionalUsers):', e);
                errorData = {};
              }
            }
            throw new Error(errorData?.message || errorData?.error || 'Ek kullanıcı eklenemedi');
          }
        }

        // Kredi kartı ödemesi başarılı - panel'e yönlendir
        window.location.href = 'https://panel.otomuhasebe.com?payment=success';
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl top-0 left-0" />
        <div className="absolute w-96 h-96 bg-gradient-to-r from-pink-400/20 to-cyan-400/20 rounded-full blur-3xl bottom-0 right-0" />
      </div>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Link href="/" className="inline-block mb-4 group">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              OtoMuhasebe
            </h1>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium mb-6 animate-fade-in">
            <CreditCard className="w-4 h-4" />
            <span>{isTrial ? 'Ücretsiz Deneme' : 'Güvenli Ödeme'}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-white animate-slide-up">
            {isTrial ? 'Deneme Sürümünü Başlat' : 'Ödeme'}
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto animate-slide-up-delay">
            {isTrial
              ? '14 gün ücretsiz deneme sürümünü başlatın'
              : 'Paket seçiminizi tamamlayın'
            }
          </p>
        </div>
      </section>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Paket Özeti */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-xl p-8 mb-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Seçilen Paket</h3>

                <div className="border-2 border-blue-600 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-2xl font-bold text-gray-900">{plan.name}</h4>
                    {planName === 'PROFESSIONAL' && (
                      <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                        En Popüler
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    {isTrial ? (
                      <div className="text-3xl font-bold text-green-600">14 Gün Ücretsiz</div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-gray-900">
                            {plan.annualPrice}
                          </span>
                          {plan.annualPrice !== 'Özel Fiyat' && (
                            <span className="text-gray-600">/yıl</span>
                          )}
                        </div>
                        {plan.annualPrice !== 'Özel Fiyat' && (
                          <div className="mt-2 text-sm text-gray-500">
                            1 kullanıcı için
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ek Kullanıcı ve Modüller */}
                {!isTrial && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Eklentiler</h4>

                    {/* Ek Kullanıcı */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">Ek Kullanıcı</h5>
                          <p className="text-sm text-gray-600">Her ek kullanıcı için yıllık</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">₺{additionalUserPrice.toLocaleString('tr-TR')}</div>
                          <div className="text-xs text-gray-500">/kullanıcı/yıl</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setAdditionalUsers(Math.max(0, additionalUsers - 1))}
                          disabled={additionalUsers === 0}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-600"
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold w-12 text-center">{additionalUsers}</span>
                        <button
                          onClick={() => setAdditionalUsers(additionalUsers + 1)}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-blue-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ödeme Bilgileri - Sadece deneme değilse */}
              {!isTrial && (
                <div className="bg-white rounded-lg shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    Ödeme Yöntemi
                  </h3>

                  {/* Ödeme Yöntemi Seçimi */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => {
                        setPaymentMethod('credit_card');
                        setShowBankDetails(false);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'credit_card'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-6 h-6 ${paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-semibold ${paymentMethod === 'credit_card' ? 'text-blue-600' : 'text-gray-700'}`}>
                            Kredi Kartı
                          </div>
                          <div className="text-xs text-gray-500">Güvenli ödeme</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setPaymentMethod('bank_transfer');
                        setShowBankDetails(true);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === 'bank_transfer'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className={`w-6 h-6 ${paymentMethod === 'bank_transfer' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-semibold ${paymentMethod === 'bank_transfer' ? 'text-blue-600' : 'text-gray-700'}`}>
                            Banka Havalesi
                          </div>
                          <div className="text-xs text-gray-500">Manuel onay</div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Banka Havalesi Bilgileri */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-blue-600" />
                        Banka Hesap Bilgileri
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Banka:</span>
                          <span className="font-semibold">Ziraat Bankası</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hesap Adı:</span>
                          <span className="font-semibold">Azem Yazılım Ltd. Şti.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IBAN:</span>
                          <span className="font-semibold font-mono">TR00 0000 0000 0000 0000 0000 00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Şube:</span>
                          <span className="font-semibold">000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hesap No:</span>
                          <span className="font-semibold">0000000000</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                          ⚠️ <strong>Önemli:</strong> Havale yaptıktan sonra aboneliğiniz admin onayı bekleyecektir.
                          Ödeme kontrol edildikten sonra hesabınız aktif hale gelecektir.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Kredi Kartı Bilgisi */}
                  {paymentMethod === 'credit_card' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💳 <strong>Güvenli Ödeme:</strong> Kredi kartı ile ödeme iyzico üzerinden güvenli şekilde işlenir.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Özet ve Ödeme */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-xl p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Özet</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paket</span>
                    <span className="font-semibold">{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faturalama</span>
                    <span className="font-semibold">
                      {isTrial ? 'Deneme' : 'Yıllık'}
                    </span>
                  </div>
                  {!isTrial && additionalUsers > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ek Kullanıcı ({additionalUsers})</span>
                      <span className="font-semibold">
                        ₺{(additionalUserPrice * additionalUsers).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Toplam</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {isTrial ? 'Ücretsiz' : (() => {
                          if (plan.annualPrice === 'Özel Fiyat') return 'Özel Fiyat';
                          const basePrice = parseInt(plan.annualPrice.replace(/[^\d]/g, ''));
                          const total = basePrice + (additionalUsers * additionalUserPrice);
                          return `₺${total.toLocaleString('tr-TR')}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${isTrial
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      İşleniyor...
                    </>
                  ) : isTrial ? (
                    <>
                      <Calendar className="w-5 h-5" />
                      Denemeyi Başlat
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Ödemeyi Tamamla
                    </>
                  )}
                </button>

                <Link
                  href="/fiyatlandirma"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900 mt-4"
                >
                  Paketi Değiştir
                </Link>

                {isTrial && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      Deneme süresi sonunda otomatik olarak iptal edilir.
                      İstediğiniz zaman paket satın alabilirsiniz.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Başvuru Başarılı Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {paymentMethod === 'bank_transfer' ? 'Abonelik Talebiniz Alındı!' : 'Başvurunuz Alındı!'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {paymentMethod === 'bank_transfer'
                    ? 'Banka havalesi ile ödeme seçtiniz. Ödeme kontrol edildikten sonra hesabınız aktif hale gelecektir. Lütfen yukarıdaki banka bilgileri ile havale yapın.'
                    : 'Başvurunuz alınmıştır. En kısa sürede demo hesabınız aktifleşecektir.'
                  }
                </p>
                {paymentMethod === 'bank_transfer' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                    <h4 className="font-semibold text-gray-900 mb-2">Banka Bilgileri:</h4>
                    <div className="text-sm space-y-1">
                      <div><span className="text-gray-600">Banka:</span> <span className="font-semibold">Ziraat Bankası</span></div>
                      <div><span className="text-gray-600">IBAN:</span> <span className="font-semibold font-mono">TR00 0000 0000 0000 0000 0000 00</span></div>
                      <div><span className="text-gray-600">Hesap Adı:</span> <span className="font-semibold">Azem Yazılım Ltd. Şti.</span></div>
                    </div>
                  </div>
                )}
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Yönlendiriliyor...</span>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
      );
}

      export default function PaymentPage() {
  return (
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      }>
        <PaymentPageContent />
      </Suspense>
      );
}

