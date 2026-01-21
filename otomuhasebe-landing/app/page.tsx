'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Archive, 
  Building, 
  Users, 
  BarChart3, 
  Smartphone, 
  Code,
  Check,
  Star,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  LogIn,
  UserPlus,
  Warehouse,
  Package,
  DollarSign,
  CreditCard,
  Receipt,
  ClipboardList,
  UserCog,
  FileCheck,
  ShoppingCart,
  Barcode,
  Layers,
  Shield,
  Zap,
  Target,
  Sparkles,
  Rocket,
  TrendingDown,
  Activity,
  Database,
  Cloud,
  Lock,
  Globe,
  Award,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  const mainFeatures = [
    { 
      icon: FileText, 
      title: 'Ön Muhasebe Yönetimi', 
      desc: 'Cari hesaplar, gelir-gider takibi, çek-senet işlemleri, kredi kartı ve banka entegrasyonu',
      color: 'from-blue-500 to-cyan-500',
      delay: '0'
    },
    { 
      icon: Package, 
      title: 'Stok Yönetimi', 
      desc: 'Barkod desteği, raf bilgisi, negatif stok engelleme, hızlı ürün takibi',
      color: 'from-purple-500 to-pink-500',
      delay: '100'
    },
    { 
      icon: DollarSign, 
      title: 'Finansal İşlemler', 
      desc: 'Ödeme ve tahsilat süreçlerini kolayca yönetin, nakit akışınızı kontrol altında tutun',
      color: 'from-green-500 to-emerald-500',
      delay: '200'
    },
  ];

  const modules = [
    { 
      icon: Warehouse, 
      title: 'Depo Yönetimi', 
      desc: 'Serbest depo veya katlı (mezanin) sistem desteği ile çoklu depo yönetimi',
      features: ['Çoklu depo desteği', 'Barkod ve seri numara takibi', 'Android kamera ile barkod okuma', 'Over-pick ve negatif stok engelleme']
    },
    { 
      icon: ClipboardList, 
      title: 'Sayım Modülü', 
      desc: 'Periyodik stok sayımlarınızı kolayca yapın, farkları otomatik hesaplayın',
      features: ['Otomatik sayım planlama', 'Fark analizi', 'Sayım raporları']
    },
    { 
      icon: UserCog, 
      title: 'İnsan Kaynakları', 
      desc: 'Personel yönetimi, izin takibi, maaş hesaplamaları ve bordro işlemleri',
      features: ['Personel kayıtları', 'İzin yönetimi', 'Bordro hesaplama']
    },
    { 
      icon: FileCheck, 
      title: 'Teklif ve Sipariş Yönetimi', 
      desc: 'Müşteri tekliflerinizi oluşturun, siparişlerinizi takip edin',
      features: ['Teklif oluşturma', 'Sipariş takibi', 'Otomatik fatura dönüşümü']
    },
  ];

  const benefits = [
    { icon: Zap, text: 'Zaman kazanın' },
    { icon: Target, text: 'Hataları azaltın' },
    { icon: TrendingUp, text: 'Verimliliği artırın' },
  ];

  const stats = [
    { number: '10,000+', label: 'Aktif Kullanıcı', icon: Users },
    { number: '50M+', label: 'İşlem', icon: Activity },
    { number: '99.9%', label: 'Uptime', icon: Shield },
    { number: '7/24', label: 'Destek', icon: Clock },
  ];

  const testimonials = [
    { 
      name: 'Ahmet Yılmaz', 
      company: 'ABC Yedek Parça Ltd.', 
      text: 'Stok yönetimimizi %90 iyileştirdik. Barkod sistemi sayesinde hata oranımız sıfıra indi.',
      rating: 5,
      image: '👨‍💼'
    },
    { 
      name: 'Ayşe Demir', 
      company: 'XYZ Otomotiv A.Ş.', 
      text: 'Depo modülü ile çoklu depo yönetimimizi tek ekrandan yapabiliyoruz. Çok pratik!',
      rating: 5,
      image: '👩‍💼'
    },
    { 
      name: 'Mehmet Kaya', 
      company: 'DEF Yedek Parça', 
      text: 'Ön muhasebe işlemlerimiz artık çok daha hızlı. Finansal raporlarımızı anlık görebiliyoruz.',
      rating: 5,
      image: '👨‍💼'
    },
  ];

  const faqs = [
    { 
      q: 'Ücretsiz deneme süresi var mı?', 
      a: 'Evet, 14 gün ücretsiz deneme süremiz var. Kredi kartı bilgisi gerektirmez.' 
    },
    { 
      q: 'Barkod okuma nasıl çalışır?', 
      a: 'Android cihazınızın kamerası ile web üzerinden direkt barkod okuyabilirsiniz. Ekstra uygulama gerekmez.' 
    },
    { 
      q: 'Çoklu depo desteği nedir?', 
      a: 'Birden fazla deponuzu tek sistemde yönetebilir, serbest depo veya katlı (mezanin) sistem kullanabilirsiniz.' 
    },
    { 
      q: 'Verilerim güvende mi?', 
      a: 'Tüm verileriniz SSL ile şifrelenir, düzenli yedeklenir ve bulut sunucularda saklanır.' 
    },
    { 
      q: 'Modüler yapı ne demek?', 
      a: 'İhtiyacınıza göre ek modüller satın alarak sistemi genişletebilirsiniz. Sadece kullandığınız özellikler için ödeme yaparsınız.' 
    },
    { 
      q: 'Mobil erişim var mı?', 
      a: 'Evet, tüm özelliklere mobil cihazlardan erişebilirsiniz. Responsive tasarım sayesinde her ekranda mükemmel çalışır.' 
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-pink-400/20 to-cyan-400/20 rounded-full blur-3xl"
          style={{
            right: `${mousePosition.x / 25}px`,
            bottom: `${mousePosition.y / 25}px`,
            transition: 'all 0.4s ease-out'
          }}
        />
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => scrollToSection('home')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              OtoMuhasebe
            </button>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection('ozellikler')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                Özellikler
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => scrollToSection('moduller')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                Modüller
              </button>
              <button
                onClick={() => scrollToSection('fiyatlandirma')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                Fiyatlandırma
              </button>
              <button
                onClick={() => scrollToSection('yorumlar')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                Yorumlar
              </button>
              <button
                onClick={() => scrollToSection('sss')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
              >
                SSS
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <Link
                href="/giris"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Üye Ol
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 animate-in slide-in-from-top">
              <nav className="flex flex-col gap-2 pt-4">
                <button
                  onClick={() => scrollToSection('ozellikler')}
                  className="text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  Özellikler
                </button>
                <button
                  onClick={() => scrollToSection('moduller')}
                  className="text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  Modüller
                </button>
                <button
                  onClick={() => scrollToSection('fiyatlandirma')}
                  className="text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  Fiyatlandırma
                </button>
                <button
                  onClick={() => scrollToSection('yorumlar')}
                  className="text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  Yorumlar
                </button>
                <button
                  onClick={() => scrollToSection('sss')}
                  className="text-left px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  SSS
                </button>
                
                <div className="h-px bg-gray-200 my-2"></div>
                
                <Link
                  href="/giris"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus className="w-4 h-4" />
                  Üye Ol
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section 
        id="home" 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient-shift"></div>
        
        {/* Floating Particles */}
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

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Yedek Parça Satış İşletmeleri için Akıllı Yönetim Çözümü</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white leading-tight animate-slide-up">
              <span className="block">İşinizi Kolaylaştırın,</span>
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Kontrolü Elinize Alın!
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-4 text-blue-100 max-w-3xl mx-auto animate-slide-up-delay">
              Yedek parça satan işletmeler için özel olarak tasarlanmış, güçlü ve modüler yapıya sahip bir yazılım ile tanışın.
            </p>
            <p className="text-lg md:text-xl mb-12 text-blue-200 max-w-2xl mx-auto animate-slide-up-delay-2">
              Ön muhasebe, stok yönetimi ve finansal işlemlerinizi tek bir platformda yönetin.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-delay">
              {benefits.map((benefit, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white"
                >
                  <benefit.icon className="w-5 h-5" />
                  <span className="font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-delay-2">
              <Link
                href="/odeme?trial=true"
                className="group relative px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:bg-white/95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Deneme Sürümü Başlat
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <button
                onClick={() => scrollToSection('fiyatlandirma')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Paketleri İncele
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, idx) => (
                <div 
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <stat.icon className="w-6 h-6 text-white mb-2 mx-auto" />
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/70" />
        </div>
      </section>

      {/* Main Features Section */}
      <section id="ozellikler" className="py-20 md:py-32 scroll-mt-20 relative bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Neden Bu Program?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Zaman kazanın, hataları azaltın, verimliliği artırın!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {mainFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                style={{ animationDelay: `${feature.delay}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
                
                <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="moduller" className="py-20 md:py-32 scroll-mt-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Modüler Yapı – İhtiyacınıza Göre Genişleyin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              İşletmenize uygun çözümler, tek bir platformda!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {modules.map((module, idx) => (
              <div
                key={idx}
                className="group relative p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                {/* Decorative Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 p-4 mb-6 group-hover:rotate-12 transition-transform duration-300">
                    <module.icon className="w-full h-full text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">{module.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{module.desc}</p>
                  
                  <ul className="space-y-3">
                    {module.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Special Highlight for Depo Module */}
          <div className="mt-16 max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md p-4">
                <Warehouse className="w-full h-full text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2">Depo Modülü ile Maksimum Kontrol</h3>
                <p className="text-blue-100 text-lg">Depolarınızı akıllı bir şekilde yönetin!</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Çoklu Depo Desteği</div>
                  <div className="text-blue-100 text-sm">Birden fazla deponuzu tek sistemde yönetin</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Barkod ve Seri Numarası Takibi</div>
                  <div className="text-blue-100 text-sm">Her ürünü benzersiz şekilde takip edin</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Android Kamera ile Barkod Okuma</div>
                  <div className="text-blue-100 text-sm">Web üzerinden direkt kamera ile okuma</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Over-pick ve Negatif Stok Engelleme</div>
                  <div className="text-blue-100 text-sm">Stok hatalarını önleyin</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl text-gray-600 italic">
              "Her modül bir çözüm, her çözüm bir kolaylık!"
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="fiyatlandirma" className="py-20 md:py-32 scroll-mt-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fiyatlandırma
            </h2>
            <p className="text-xl text-gray-600">Size uygun planı seçin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'BASIC',
                price: '₺2,870',
                period: '/yıl',
                features: ['1 Kullanıcı', '1 Yıl', '1 Şirket', '100 Fatura/ay', 'Temel raporlar', 'Email destek'],
                popular: false,
                gradient: 'from-cyan-400 to-blue-500',
                nameGradient: 'from-cyan-600 to-blue-600',
                priceColor: 'text-cyan-600'
              },
              {
                name: 'PROFESSIONAL',
                price: '₺5,750',
                period: '/yıl',
                features: ['1 Kullanıcı', '1 Yıl', '3 Şirket', 'Sınırsız fatura', 'Gelişmiş raporlar', 'E-arşiv entegrasyonu', 'Öncelikli destek'],
                popular: true,
                gradient: 'from-blue-500 to-purple-600',
                nameGradient: 'from-blue-600 to-purple-600',
                priceColor: 'text-blue-600'
              },
              {
                name: 'ENTERPRISE',
                price: 'Özel Fiyat',
                period: '',
                features: ['1 Kullanıcı', '1 Yıl', 'Sınırsız şirket', 'API erişimi', 'Özel entegrasyonlar', 'Dedicated hesap yöneticisi', 'SLA garantisi'],
                popular: false,
                gradient: 'from-purple-500 to-pink-600',
                nameGradient: 'from-purple-600 to-pink-600',
                priceColor: 'text-purple-600'
              },
            ].map((plan, idx) => (
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
                  <Rocket className="w-full h-full text-white" />
                </div>
                
                <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${plan.nameGradient} bg-clip-text text-transparent`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${plan.priceColor}`}>{plan.price}</span>
                    {plan.period && <span className="text-gray-600 font-medium">{plan.period}</span>}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href={`/odeme?plan=${plan.name}&type=annual`}
                  className={`w-full text-center py-3 rounded-xl font-bold transition-all duration-300 block hover:scale-105 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:from-blue-600 hover:to-purple-700'
                      : `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:opacity-90`
                  }`}
                >
                  Başlayın
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="yorumlar" className="py-20 md:py-32 scroll-mt-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Müşteri Yorumları
            </h2>
            <p className="text-xl text-gray-600">Binlerce mutlu müşterimizden bazıları</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="sss" className="py-20 md:py-32 scroll-mt-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-xl text-gray-600">Merak ettiklerinizin cevapları</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
              >
                <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">?</span>
                  </div>
                  {faq.q}
                </h3>
                <p className="text-gray-600 leading-relaxed pl-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/grid.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Rocket className="w-16 h-16 text-white mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Bugün Başlayın</h2>
          <p className="text-xl mb-8 text-blue-100">14 Gün Para İade Garantisi</p>
          <Link
            href="/kayit"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            Ücretsiz Denemeyi Başlat
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">OtoMuhasebe</h3>
              <p className="text-gray-400">Yedek parça satış işletmeleri için akıllı yönetim çözümü</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ürün</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('ozellikler')} className="hover:text-white transition-colors">Özellikler</button></li>
                <li><button onClick={() => scrollToSection('moduller')} className="hover:text-white transition-colors">Modüller</button></li>
                <li><button onClick={() => scrollToSection('fiyatlandirma')} className="hover:text-white transition-colors">Fiyatlandırma</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Şirket</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><Link href="/gizlilik-politikasi" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
                <li><Link href="/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Koşulları</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('sss')} className="hover:text-white transition-colors">SSS</button></li>
                <li><Link href="/giris" className="hover:text-white transition-colors">Giriş Yap</Link></li>
                <li><Link href="/kayit" className="hover:text-white transition-colors">Üye Ol</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 mb-2">&copy; 2024 OtoMuhasebe. Tüm hakları saklıdır.</p>
            <p className="text-gray-500 text-sm">AZEM YAZILIM BİLİŞİM VE TEKNOLOJİLERİ LTD. ŞTİ.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        
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
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 0.6s both;
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
        
        .animate-slide-up-delay-2 {
          animation: slide-up 1s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
}
