'use client';

import { FileText, CheckCircle, AlertCircle, Sparkles, Rocket, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
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
            <FileText className="w-4 h-4" />
            <span>Yasal Düzenlemeler</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white leading-tight animate-slide-up">
            <span className="block">Kullanım Koşulları</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-blue-100 max-w-3xl mx-auto animate-slide-up-delay">
            Hizmetlerimizi kullanırken uymanız gereken kurallar
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 md:py-32 relative z-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 space-y-8">
            <div className="prose prose-lg max-w-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-3">
                  <CheckCircle className="w-full h-full text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">1. Hizmet Kullanımı</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                OtoMuhasebe hizmetlerini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Hizmeti yalnızca yasal amaçlarla kullanacaksınız</li>
                <li>Başkalarının hesaplarına yetkisiz erişim sağlamayacaksınız</li>
                <li>Sistemi zararlı yazılımlardan koruyacaksınız</li>
                <li>Telif haklarına ve fikri mülkiyet haklarına saygı göstereceksiniz</li>
                <li>Hizmeti kötüye kullanmayacaksınız</li>
              </ul>

              <div className="flex items-center gap-3 mb-6 mt-12">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-3">
                  <Shield className="w-full h-full text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">2. Hesap Güvenliği</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Hesabınızın güvenliğinden siz sorumlusunuz:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Şifrenizi güvenli tutun ve kimseyle paylaşmayın</li>
                <li>Şüpheli aktivite tespit ettiğinizde derhal bize bildirin</li>
                <li>Hesap bilgilerinizi güncel tutun</li>
                <li>İki faktörlü kimlik doğrulamayı etkinleştirin</li>
              </ul>

              <div className="flex items-center gap-3 mb-6 mt-12">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-3">
                  <FileText className="w-full h-full text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">3. Abonelik ve Ödeme</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Abonelik koşulları:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Abonelikler yıllık olarak faturalandırılır</li>
                <li>Ödeme yapılmaması durumunda hizmet askıya alınabilir</li>
                <li>İade politikası 14 gün içinde geçerlidir</li>
                <li>Fiyat değişiklikleri önceden bildirilir</li>
                <li>İptal işlemleri hesap ayarlarından yapılabilir</li>
              </ul>

              <div className="flex items-center gap-3 mb-6 mt-12">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 p-3">
                  <AlertCircle className="w-full h-full text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">4. Sorumluluk Reddi</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                OtoMuhasebe, aşağıdaki durumlardan sorumlu tutulamaz:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Kullanıcı hatalarından kaynaklanan veri kayıpları</li>
                <li>Üçüncü taraf hizmetlerindeki kesintiler</li>
                <li>Doğal afetler veya olağanüstü durumlar</li>
                <li>Yasal düzenlemelerden kaynaklanan değişiklikler</li>
              </ul>

              <div className="flex items-center gap-3 mb-6 mt-12">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 p-3">
                  <FileText className="w-full h-full text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 m-0">5. Değişiklikler</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Bu kullanım koşullarını istediğimiz zaman güncelleyebiliriz. Önemli değişiklikler e-posta ile bildirilir. 
                Değişikliklerden haberdar olmak için bu sayfayı düzenli olarak ziyaret ediniz.
              </p>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-8">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <strong>Son Güncelleme:</strong> Bu kullanım koşulları son olarak {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })} tarihinde güncellenmiştir.
                </p>
              </div>
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Sorularınız mı var?</h2>
          <p className="text-xl mb-8 text-blue-100">Bizimle iletişime geçin</p>
          <Link
            href="/hakkimizda"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            İletişim Bilgileri
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
