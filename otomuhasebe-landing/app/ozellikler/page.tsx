'use client';

import { FileText, TrendingUp, Archive, Building, Users, BarChart3, Smartphone, Code, Sparkles, CheckCircle2, ArrowRight, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      icon: FileText,
      title: 'Otomatik Fatura Oluşturma',
      desc: 'Faturalarınızı otomatik oluşturun, düzenleyin ve yönetin. E-fatura ve e-arşiv desteği ile tam uyumlu.',
      details: ['E-fatura entegrasyonu', 'Otomatik numaralandırma', 'Şablon yönetimi', 'Toplu işlemler'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: 'Gelir-Gider Takibi',
      desc: 'Gelir ve giderlerinizi detaylı şekilde takip edin. Kategorilere göre analiz yapın.',
      details: ['Kategori bazlı takip', 'Grafik ve raporlar', 'Bütçe yönetimi', 'Otomatik kategorizasyon'],
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Archive,
      title: 'E-Arşiv Entegrasyonu',
      desc: 'E-arşiv sistemi ile tam entegrasyon. Faturalarınız otomatik olarak e-arşive gönderilir.',
      details: ['Otomatik e-arşiv gönderimi', 'E-arşiv sorgulama', 'Yedekleme', 'Uyumluluk garantisi'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Building,
      title: 'Çoklu Şirket Yönetimi',
      desc: 'Birden fazla şirketi tek bir panelden yönetin. Her şirket için ayrı veri izolasyonu.',
      details: ['Sınırsız şirket', 'Ayrı veri izolasyonu', 'Kolay geçiş', 'Toplu işlemler'],
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Users,
      title: 'Muhasebeci Erişimi',
      desc: 'Muhasebecinize erişim verin. Verilerinizi güvenli şekilde paylaşın.',
      details: ['Rol bazlı erişim', 'Güvenli paylaşım', 'İşlem geçmişi', 'Onay mekanizması'],
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: BarChart3,
      title: 'Raporlama & Analiz',
      desc: 'Detaylı raporlar ve analizler. Excel ve PDF formatında dışa aktarım.',
      details: ['Gelir-gider raporları', 'KDV raporları', 'Özel raporlar', 'Excel/PDF export'],
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Smartphone,
      title: 'Mobil Uygulama',
      desc: 'iOS ve Android uygulamaları ile her yerden erişim sağlayın.',
      details: ['iOS uygulaması', 'Android uygulaması', 'Offline mod', 'Push bildirimleri'],
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Code,
      title: 'API Entegrasyonu',
      desc: 'RESTful API ile sisteminizi entegre edin. Webhook desteği.',
      details: ['RESTful API', 'Webhook desteği', 'API dokümantasyonu', 'Örnek kodlar'],
      color: 'from-violet-500 to-purple-500',
    },
  ];

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
            <span>Güçlü Özellikler</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white leading-tight animate-slide-up">
            <span className="block">Özellikler</span>
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Neler Sunuyoruz?
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-blue-100 max-w-3xl mx-auto animate-slide-up-delay">
            Muhasebe işlemlerinizi kolaylaştıran güçlü özellikler
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 relative z-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{feature.desc}</p>
                  
                  <ul className="space-y-3">
                    {feature.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/grid.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Rocket className="w-16 h-16 text-white mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Hemen Deneyin</h2>
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

