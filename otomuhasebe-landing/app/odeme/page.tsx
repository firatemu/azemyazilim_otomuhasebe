'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, CreditCard, Calendar, AlertCircle, Loader, CheckCircle, Building2, Banknote, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

// Import new step components
import PaymentStepOne from '../components/payment-step/PaymentStepOne';
import PaymentStepTwo from '../components/payment-step/PaymentStepTwo';
import PaymentStepThree from '../components/payment-step/PaymentStepThree';

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
    features: ['1 Kullanıcı', '1 Yıl', '3 Şirket', 'Sınırsız fatura', 'Gelişmiş raporlar', 'E-arşiv entegrasyonu', 'Öncelikli destek', 'API erişimi', '7/24 Erişim'],
  },
  ENTERPRISE: {
    name: 'ENTERPRISE',
    monthlyPrice: 'Özel Fiyat',
    annualPrice: 'Özel Fiyat',
    features: ['1 Kullanıcı', '1 Yıl', 'Sınırsız şirket', 'Sınırsız fatura', 'Dedicated hesap yöneticisi', 'SLA garantisi', 'Özel entegrasyonlar', 'Dedicated destek', 'API erişimi', 'Konusma desteği'],
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
  const billingType = searchParams.get('type') || 'annual';
  const plan = plans[planName] || plans.PROFESSIONAL;
  const isTrial = searchParams.get('trial') === 'true';
  const [additionalUsers, setAdditionalUsers] = useState(0);
  const additionalUserPrice = 1435;
  const [currentStep, setCurrentStep] = useState(1);

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
      let response;
      let data: any = {};

      if (!accessToken) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      }

      if (isTrial) {
        // Deneme sürümü başlat
        response = await fetch(`${apiUrl}/api/subscriptions/start-trial`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });


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

        setShowSuccessModal(true);

        setTimeout(() => {
          window.location.href = 'https://panel.otomuhasebe.com';
        }, 3000);

      } else {
        // Satın alma işlemi - deneme varsa yükselt, yoksa yeni abonelik oluştur
        const currentSubResponse = await fetch(`${apiUrl}/api/subscriptions/current?tenantId=${user.tenantId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (currentSubResponse.status === 401 || currentSubResponse.status === 403) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push(`/giris?redirect=/odeme?plan=${planName}&type=${billingType}&trial=true&error=session_expired`);
          setLoading(false);
          return;
        }

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

        if (!currentSubResponse.ok) {
          throw new Error(currentSub?.message || currentSub?.error || 'Abonelik bilgisi alınamadı');
        }

        if (currentSub && currentSub.status === 'TRIAL') {
          // Aboneliği yükselt - deneme süresi bitince otomatik premium'a geçiş
          response = await fetch(`${apiUrl}/api/subscriptions/upgrade`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              planName: planName,
              billingType: 'annual',
              paymentMethod: paymentMethod,
            }),
          });

          if (!response.ok) {
            throw new Error('Abonelik yükseltme başarısız oldu');
          }

          data = await response.json();
          setShowSuccessModal(true);

          setTimeout(() => {
            window.location.href = 'https://panel.otomuhasebe.com';
          }, 3000);

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

          if (!response.ok) {
            throw new Error(data?.message || data?.error || 'Abonelik oluşturma başarısız oldu');
          }

          data = await response.json();
          setShowSuccessModal(true);

          setTimeout(() => {
            window.location.href = 'https://panel.otomuhasebe.com';
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError((error as any).message || 'Ödeme işleminde bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Link href="/" className="inline-block mb-4 group">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              OtoMuhasebe
            </h1>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium mb-6 animate-fade-in">
            <CreditCard className="w-4 h-4" />
            <span>{isTrial ? 'Ücretsiz Deneme' : 'Güvenli Ödeme'}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-white animate-slide-up">
            {isTrial ? 'Deneme Sürümünü Başlat' : 'Ödeme Yap'}
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto animate-slide-up-delay">
            {isTrial
              ? '14 gün ücretsiz deneme sürümünü başlatın.'
              : 'Paket seçiminizi tamamlayın.'}
          </p>
        </div>
      </section>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Paket Özeti */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                          <span className="text-gray-600">/yıl</span>
                        </div>
                        <p className="text-gray-600">1 kullanıcı için</p>
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

                {/* Ek Kullanıcı - Sadece deneme değilse */}
                {!isTrial && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Ek Kullanıcı</h4>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">Ek Kullanıcı</h5>
                          <p className="text-sm text-gray-600">Her ek kullanıcı için yıllık</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">₺{additionalUserPrice.toLocaleString('tr-TR')}</div>
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
                      <span>İşleniyor...</span>
                    </>
                  ) : isTrial ? (
                    <>
                      <Calendar className="w-5 h-5" />
                      <span>Denemeyi Başlat</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Ödemeyi Tamamla</span>
                    </>
                  )}
                </button>

                <Link href="/fiyatlandirma" className="block text-center text-sm text-gray-600 hover:text-gray-900 mt-4">
                  Paketi Değiştir
                </Link>
              </div>
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
                    <span className="font-semibold">{billingType === 'annual' ? 'Yıllık' : 'Aylık'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ödeme Yöntemi</span>
                    <span className="font-semibold">
                      {paymentMethod === 'credit_card' ? 'Kredi Kartı' : 'Banka Havalesi'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam</span>
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
                      <span>İşleniyor...</span>
                    </>
                  ) : isTrial ? (
                    <>
                      <Calendar className="w-5 h-5" />
                      <span>Denemeyi Başlat</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Ödemeyi Tamamla</span>
                    </>
                  )}
                </button>

                <Link href="/fiyatlandirma" className="block text-center text-sm text-gray-600 hover:text-gray-900 mt-4">
                  Paketi Değiştir
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Success Modal */}
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
                  : 'Başvurunuz alınmıştır. En kısa sürede demo hesabınız aktifleşecektir.'}
              </p>

              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-500">Yönlendiriliyor...</span>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
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
