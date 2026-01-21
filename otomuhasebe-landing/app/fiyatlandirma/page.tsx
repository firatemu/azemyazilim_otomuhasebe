'use client';

import { useState, useEffect } from 'react';
import { Check, Rocket, Sparkles, ArrowRight, Star, Zap, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const accessToken = localStorage.getItem('accessToken');
    setIsAuthenticated(!!accessToken);
  }, []);

  const plans = [
    {
      name: 'BASIC',
      annualPrice: '₺2,870',
      features: ['1 Kullanıcı', '1 Yıl', '1 Şirket', '100 Fatura/ay', 'Temel raporlar', 'Email destek', '7/24 Erişim'],
      popular: false,
      gradient: 'from-cyan-400 to-blue-500',
      nameGradient: 'from-cyan-600 to-blue-600',
      priceColor: 'text-cyan-600',
      icon: Zap,
    },
    {
      name: 'PROFESSIONAL',
      annualPrice: '₺5,750',
      features: ['1 Kullanıcı', '1 Yıl', '3 Şirket', 'Sınırsız fatura', 'Gelişmiş raporlar', 'E-arşiv entegrasyonu', 'Öncelikli destek', 'API erişimi'],
      popular: true,
      gradient: 'from-blue-500 to-purple-600',
      nameGradient: 'from-blue-600 to-purple-600',
      priceColor: 'text-blue-600',
      icon: Rocket,
    },
    {
      name: 'ENTERPRISE',
      annualPrice: 'Özel Fiyat',
      features: ['1 Kullanıcı', '1 Yıl', 'Sınırsız şirket', 'API erişimi', 'Özel entegrasyonlar', 'Dedicated hesap yöneticisi', 'SLA garantisi', 'Özel eğitim'],
      popular: false,
      gradient: 'from-purple-500 to-pink-600',
      nameGradient: 'from-purple-600 to-pink-600',
      priceColor: 'text-purple-600',
      icon: Star,
    },
  ];

  const benefits = [
    { icon: Shield, text: 'Güvenli Ödeme', color: 'text-green-500' },
    { icon: Clock, text: 'Anında Aktivasyon', color: 'text-blue-500' },
    { icon: Zap, text: '14 Gün Ücretsiz Deneme', color: 'text-yellow-500' },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
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
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Size Uygun Planı Seçin</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white leading-tight animate-slide-up">
            <span className="block">Fiyatlandırma</span>
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Planlarımız
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-blue-100 max-w-3xl mx-auto animate-slide-up-delay">
            Tüm paketler 1 kullanıcı, 1 yıllık bedelli. İhtiyacınıza göre seçin.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 md:py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-500 hover:scale-105 ${
                  plan.popular
                    ? 'border-blue-500 shadow-2xl bg-white scale-105'
                    : 'border-gray-200 shadow-lg bg-white hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg">
                    En Popüler
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${plan.gradient} p-4 mb-6 shadow-lg`}>
                  <plan.icon className="w-full h-full text-white" />
                </div>
                
                <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${plan.nameGradient} bg-clip-text text-transparent`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${plan.priceColor}`}>{plan.annualPrice}</span>
                    {plan.annualPrice !== 'Özel Fiyat' && (
                      <span className="text-gray-600 font-medium">/yıl</span>
                    )}
                  </div>
                  {plan.annualPrice !== 'Özel Fiyat' && (
                    <div className="mt-2 text-sm text-gray-500">
                      1 kullanıcı için
                    </div>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push(`/odeme?plan=${plan.name}&type=annual`);
                    } else {
                      router.push('/kayit');
                    }
                  }}
                  className={`w-full text-center py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:from-blue-600 hover:to-purple-700'
                      : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:opacity-90`
                  }`}
                >
                  Başlayın
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-3">
                    <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                    <span className="font-semibold text-gray-700">{benefit.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/grid.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Rocket className="w-16 h-16 text-white mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Hemen Başlayın</h2>
          <p className="text-xl mb-8 text-blue-100">14 Gün Ücretsiz Deneme - Kredi Kartı Gerektirmez</p>
          <Link
            href="/kayit"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            Ücretsiz Denemeyi Başlat
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 1s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}

