'use client';

import { Target, Eye, Heart, Mail, Phone, MapPin, Sparkles, Rocket, Shield, Zap, Users, Award } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Güvenilirlik',
      desc: 'Verilerinizin güvenliği bizim önceliğimiz',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Kolaylık',
      desc: 'Karmaşık işlemleri basitleştiriyoruz',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Rocket,
      title: 'İnovasyon',
      desc: 'Sürekli gelişen teknoloji ile yenilikçi çözümler',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Heart,
      title: 'Müşteri Odaklılık',
      desc: 'Müşteri memnuniyeti her şeyden önce',
      color: 'from-orange-500 to-red-500',
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
            <span>Bizim Hikayemiz</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white leading-tight animate-slide-up">
            <span className="block">Hakkımızda</span>
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              OtoMuhasebe
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-blue-100 max-w-3xl mx-auto animate-slide-up-delay">
            Muhasebe süreçlerinizi kolaylaştırmak için buradayız
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-32 relative z-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 p-4">
                <Target className="w-full h-full text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Misyonumuz
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Türkiye'deki işletmelerin muhasebe süreçlerini dijitalleştirmek ve otomatikleştirmek. 
              KOBİ'lerin muhasebe işlemlerini kolaylaştırarak, onların asıl işlerine odaklanmalarını sağlamak.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 md:py-32 relative z-10 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 md:p-12 border border-purple-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-4">
                <Eye className="w-full h-full text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Vizyonumuz
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Türkiye'nin en güvenilir ve kullanıcı dostu bulut tabanlı muhasebe yazılımı olmak. 
              Her işletmenin muhasebe işlemlerini kolayca yönetebilmesini sağlamak.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32 relative z-10 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Değerlerimiz
            </h2>
            <p className="text-xl text-gray-600">İş yapış şeklimizi belirleyen temel değerlerimiz</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
                
                <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${value.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-full h-full text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-800">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-32 relative z-10 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              İletişim
            </h2>
            <p className="text-xl text-gray-600">Bize ulaşın, sorularınızı yanıtlayalım</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-3 mb-4">
                <Mail className="w-full h-full text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">E-posta</h3>
              <p className="text-gray-600">info@otomuhasebe.com</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-3 mb-4">
                <Phone className="w-full h-full text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Telefon</h3>
              <p className="text-gray-600">+90 (212) 000 00 00</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-3 mb-4">
                <MapPin className="w-full h-full text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Adres</h3>
              <p className="text-gray-600">İstanbul, Türkiye</p>
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Bizimle Çalışmaya Başlayın</h2>
          <p className="text-xl mb-8 text-blue-100">14 Gün Ücretsiz Deneme - Kredi Kartı Gerektirmez</p>
          <Link
            href="/kayit"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            Ücretsiz Denemeyi Başlat
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

