"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Category from "./category";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Initialize dark mode from localStorage after hydration
    setIsHydrated(true);
    try {
      const storedTheme = localStorage.getItem('theme');
      const storedBool = localStorage.getItem('darkMode');
      if (storedTheme === 'dark' || storedBool === 'true') {
        setIsDarkMode(true);
      } else if (storedTheme === 'light' || storedBool === 'false') {
        setIsDarkMode(false);
      }
    } catch {
      // ignore localStorage errors
    }

    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
    
  }, []);

  // Persist dark mode to localStorage when it changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
      } catch {
        // ignore write errors
      }
    }
  }, [isDarkMode, isHydrated]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Show loading state until hydration is complete to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-400/70 via-blue-300/80 to-cyan-600/100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
        : 'bg-gradient-to-br from-amber-400/70 via-blue-300/80 to-cyan-600/100'
    }`}>
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {isDarkMode ? (
          <>
            <div className="absolute w-96 h-96 bg-gray-700/20 rounded-full blur-3xl animate-float" style={{ top: '10%', left: '10%' }} />
            <div className="absolute w-72 h-72 bg-gray-600/20 rounded-full blur-3xl animate-float-delayed" style={{ top: '60%', right: '10%' }} />
            <div className="absolute w-80 h-80 bg-gray-500/20 rounded-full blur-3xl animate-float-slow" style={{ bottom: '10%', left: '30%' }} />
            <div className="absolute w-64 h-64 bg-zinc-600/15 rounded-full blur-2xl animate-float" style={{ top: '30%', right: '30%' }} />
          </>
        ) : (
          <>
        <div className="absolute w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ top: '10%', left: '10%' }} />
        <div className="absolute w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-float-delayed" style={{ top: '60%', right: '10%' }} />
        <div className="absolute w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-float-slow" style={{ bottom: '10%', left: '30%' }} />
          </>
        )}
      </div>

      {/* Navigation - Modern Glass Effect */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-lg transition-all duration-500 ${
        isDarkMode 
      ? 'bg-gradient-to-br from-black via-85% to-80% border-gray-700/50' 
          : 'bg-white/70 border-blue-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20 ">
            {/* Logo with Gradient */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <img 
                    src="/uploads/Landing/snapedit_1759885040844.png" 
                    alt="Logo" 
                    className={`w-45 h-45 transition-all duration-500 ${
                      isDarkMode 
                        ? 'filter-none' 
                        : 'filter invert brightness-75 contrast-125'
                    }`} 
                  />
                </div>
                
              </Link>
              
              {/* Animated Menu */}
              
            </div>

            {/* Search, Dark Mode Toggle and Cart */}
            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`relative p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-gray-800 to-gray-600 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <div className="relative hidden md:block group">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className={`px-6 py-3 rounded-full text-sm w-80 focus:outline-none focus:ring-2 transition-all border group-hover:border-opacity-60 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 text-white placeholder-gray-400 border-gray-600 focus:ring-gray-500 group-hover:border-gray-500' 
                      : 'bg-gradient-to-r from-blue-50 to-cyan-50 text-gray-700 placeholder-gray-400 border-blue-200 focus:ring-blue-400 group-hover:border-blue-400'
                  }`}
                />
                <svg 
                  className={`absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? 'text-gray-300' : 'text-blue-500'
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
             
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Dynamic Background */}
      <section 
  className={`relative min-h-[700px] flex items-center justify-center overflow-hidden transition-all duration-500 
    ${isDarkMode 
      ? "bg-gradient-to-r from-black via-zinc-900 to-black" 
      : "bg-[linear-gradient(135deg,#B27179_100%,#FFB37B_50%,#FFF19C_100%)]"
    }`}
>
  {/* Soft Floating Orbs - Dynamic for Dark/Light Mode */}
  <div className="absolute inset-0">
    {isDarkMode ? (
      <>
        {/* Dark Mode Orbs */}
        <div 
          className="absolute top-10 left-10 w-96 h-96 rounded-full blur-3xl opacity-40 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute top-1/4 right-20 w-80 h-80 rounded-full blur-3xl opacity-35 animate-float-delayed"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-30 animate-float-slow"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)'
          }}
        />
        <div 
          className="absolute bottom-32 right-1/3 w-64 h-64 rounded-full blur-2xl opacity-25 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)'
          }}
        />
        
        {/* Small Floating Particles - Dark */}
        <div className="absolute top-40 left-1/3 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-float-delayed" />
        <div className="absolute bottom-40 right-1/4 w-24 h-24 bg-cyan-400/15 rounded-full blur-lg animate-float-slow" />
        <div className="absolute top-1/2 left-20 w-20 h-20 bg-violet-400/20 rounded-full blur-md animate-float" />
      </>
    ) : (
      <>
        {/* Light Mode Orbs */}
    <div 
      className="absolute top-10 left-10 w-96 h-96 rounded-full blur-3xl opacity-40 animate-float"
      style={{
        background: 'radial-gradient(circle, rgba(255, 179, 123, 0.6) 0%, transparent 70%)'
      }}
    />
    <div 
      className="absolute top-1/4 right-20 w-80 h-80 rounded-full blur-3xl opacity-35 animate-float-delayed"
      style={{
        background: 'radial-gradient(circle, rgba(255, 241, 156, 0.7) 0%, transparent 70%)'
      }}
    />
    <div 
      className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-30 animate-float-slow"
      style={{
        background: 'radial-gradient(circle, rgba(178, 113, 121, 0.5) 0%, transparent 70%)'
      }}
    />
    <div 
      className="absolute bottom-32 right-1/3 w-64 h-64 rounded-full blur-2xl opacity-25 animate-float"
      style={{
        background: 'radial-gradient(circle, rgba(255, 200, 150, 0.6) 0%, transparent 70%)'
      }}
    />
    
        {/* Small Floating Particles - Light */}
    <div className="absolute top-40 left-1/3 w-32 h-32 bg-white/20 rounded-full blur-xl animate-float-delayed" />
    <div className="absolute bottom-40 right-1/4 w-24 h-24 bg-white/15 rounded-full blur-lg animate-float-slow" />
    <div className="absolute top-1/2 left-20 w-20 h-20 bg-yellow-200/20 rounded-full blur-md animate-float" />
      </>
    )}
  </div>

  {/* Optional: Subtle Overlay for Depth */}
  <div 
    className="absolute inset-0 opacity-10"
    style={{
      background: isDarkMode 
        ? 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(139, 92, 246, 0.2) 100%)'
        : 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(178, 113, 121, 0.3) 100%)'
    }}
  />

  <div className="relative z-10 text-center px-6 max-w-7xl w-full">
    {/* 3D Animated Characters - BALANCED LAYOUT */}
    <div className="mb-12 flex items-center justify-center gap-12">
      
      {/* Left Image - with Fade Edges */}
      <div 
        className="hidden md:block relative w-72 h-80 group"
        style={{
          transform: `translateY(${Math.sin(scrollY * 0.01) * 20}px) rotateY(${mousePosition.x * 0.02}deg)`
        }}
      >
        {/* Main Image Container */}
        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
          <img 
            src="/uploads/Landing/img-7502-1506166016678-1506451208701.webp" 
            alt="Couple Avatar 1" 
            className="w-full h-full object-cover"
          />
          
          {/* Fade/Blur Overlay Effect - Warm Colors */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 60px 20px rgba(178, 113, 121, 0.5)',
              borderRadius: '1.5rem'
            }}
          />
        </div>

        {/* Outer Glow - Warm Gradient */}
        <div 
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(178, 113, 121, 0.4), rgba(255, 179, 123, 0.3))',
            filter: 'blur(20px)',
            transform: 'scale(1.05)',
            zIndex: -1,
            opacity: 0.6
          }}
        />

        {/* Hover Animation */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
      </div>

      {/* Main Title with 3D Text Effect - CENTERED */}
      <div className="flex-1 max-w-2xl">
        <h1 
          className={`text-center relative transition-all duration-500 ${
            isDarkMode ? 'text-white' : 'text-white'
          }`}
          style={{
            fontFamily: "'Fredoka', 'Quicksand', sans-serif",
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 900,
            textShadow: isDarkMode 
              ? '0 5px 15px rgba(0,0,0,0.4), 0 10px 40px rgba(139, 92, 246, 0.3)'
              : '0 5px 15px rgba(0,0,0,0.2), 0 10px 40px rgba(255, 179, 123, 0.3)',
            lineHeight: 1.2,
            letterSpacing: '0.02em'
          }}
        >
          <span className="inline-block hover:scale-110 transition-transform">QUÀ TẶNG</span> 
          
          <br/>
          <span 
            className={`inline-block bg-clip-text text-transparent mt-2 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-zinc-200 via-gray-300 to-zinc-400' 
                : 'bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-200'
            }`}
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            NGƯỜI THƯƠNG
          </span>
        </h1>
        
        {/* Animated Underline - Dynamic Colors */}
        <div className={`mt-6 mx-auto w-80 h-1.5 rounded-full animate-pulse shadow-lg ${
          isDarkMode 
            ? 'bg-gradient-to-r from-transparent via-gray-400 to-transparent' 
            : 'bg-gradient-to-r from-transparent via-yellow-200 to-transparent'
        }`} />
      </div>

      {/* Right Image - with Fade Edges */}
      <div 
        className="hidden md:block relative w-72 h-80 group"
        style={{
          transform: `translateY(${Math.cos(scrollY * 0.01) * 20}px) rotateY(${-mousePosition.x * 0.02}deg)`
        }}
      >
        {/* Main Image Container */}
        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
          <img 
            src="/uploads/Landing/th.webp" 
            alt="Couple Avatar 2" 
            className="w-full h-full object-cover"
          />
          
          {/* Fade/Blur Overlay Effect - Warm Colors */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 60px 20px rgba(255, 179, 123, 0.5)',
              borderRadius: '1.5rem'
            }}
          />
        </div>

        {/* Outer Glow - Warm Gradient */}
        <div 
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 179, 123, 0.3), rgba(255, 241, 156, 0.4))',
            filter: 'blur(20px)',
            transform: 'scale(1.05)',
            zIndex: -1,
            opacity: 0.6
          }}
        />

        {/* Hover Animation */}
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
      </div>
    </div>

    {/* Subtitle */}
    <p 
      className={`text-xl md:text-2xl font-semibold mb-10 animate-fade-in px-4 transition-all duration-500 ${
        isDarkMode ? 'text-white' : 'text-white'
      }`}
      style={{
        fontFamily: "'Quicksand', sans-serif",
        textShadow: isDarkMode 
          ? '0 2px 10px rgba(0,0,0,0.4)' 
          : '0 2px 10px rgba(0,0,0,0.2)'
      }}
    >
      💝 Ghi dấu từng khoảnh khắc yêu thương của hai trái tim
    </p>

    {/* Animated CTA Buttons - Dynamic Colors */}
    {/* <div className="flex gap-6 justify-center flex-wrap px-4">
      <button className={`group relative px-8 py-4 font-bold text-lg rounded-full shadow-2xl transition-all hover:scale-105 overflow-hidden ${
        isDarkMode 
          ? 'bg-white text-purple-600 hover:shadow-purple-400/50' 
          : 'bg-white text-rose-600 hover:shadow-orange-400/50'
      }`}>
        <span className="relative z-10">Khám Phá Ngay</span>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-400 to-cyan-400' 
            : 'bg-gradient-to-r from-rose-400 to-orange-400'
        }`} />
        <span className="relative z-10 ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
      </button>
      
      <button className={`px-8 py-4 border-2 font-bold text-lg rounded-full transition-all hover:scale-105 shadow-lg backdrop-blur-sm ${
        isDarkMode 
          ? 'border-purple-300 text-white hover:bg-purple-300 hover:text-slate-900' 
          : 'border-white text-white hover:bg-white hover:text-rose-600'
      }`}>
        Xem Bộ Sưu Tập
      </button>
    </div> */}
  </div>
</section>

      {/* Category Section - Album Khách Hàng */}
      <Category isDarkMode={isDarkMode} />

      {/* Featured Products with Advanced Animations */}
  

      {/* Why Choose Section with Interactive Cards */}
      <section className="relative py-24 overflow-hidden">
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-black via-zinc-900 to-black' 
            : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100'
        }`} />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h3 
              className={`text-transparent bg-clip-text mb-4 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-zinc-50 via-gray-300 to-zinc-400'
                  : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700'
              }`}
              style={{
                fontFamily: "'Fredoka', sans-serif",
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 900
              }}
            >
              Tại Sao Chọn BNJHAB?
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Trải nghiệm mua sắm tuyệt vời với nhiều ưu đãi</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: '🎁',
                title: 'Quà Tặng Ý Nghĩa',
                desc: 'Thiết kế đặc biệt cho đôi lứa với chất lượng cao cấp',
                gradient: 'from-blue-400 via-blue-500 to-cyan-500',
                delay: '0ms'
              },
              {
                icon: '💕',
                title: 'Thiết Kế Độc Đáo',
                desc: 'Mỗi sản phẩm được chăm chút tỉ mỉ từng chi tiết',
                gradient: 'from-cyan-400 via-sky-500 to-blue-500',
                delay: '150ms'
              },
              {
                icon: '🚀',
                title: 'Giao Hàng Nhanh',
                desc: 'Giao hàng toàn quốc trong 24-48 giờ',
                gradient: 'from-indigo-400 via-blue-500 to-cyan-500',
                delay: '300ms'
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className={`group relative rounded-3xl p-10 text-center shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 overflow-hidden ${
                  isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-blue-100'
                }`}
                style={{ animationDelay: feature.delay }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolutetheme	light inset-0 bg-gradient-to-br ${
                  isDarkMode ? 'from-gray-700 via-gray-600 to-gray-500' : feature.gradient
                } opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Icon with Floating Animation */}
                <div className={`relative w-24 h-24 bg-gradient-to-br ${
                  isDarkMode ? 'from-zinc-400 via-gray-500 to-zinc-600' : feature.gradient
                } rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                  <span className="text-5xl">{feature.icon}</span>
                  
                  {/* Pulse Ring */}
                  <div className={`absolute inset-0 rounded-full border-4 animate-ping ${
                    isDarkMode ? 'border-gray-400/40' : 'border-blue-400/50'
                  }`} />
                </div>
                
                <h4 
                  className={`text-2xl font-black mb-5 transition-colors ${
                    isDarkMode ? 'text-white group-hover:text-gray-200' : 'text-gray-800 group-hover:text-blue-600'
                  }`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {feature.title}
                </h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed text-base`}>
                  {feature.desc}
                </p>

                {/* Decorative Elements */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br rounded-bl-full ${
                  isDarkMode ? 'from-gray-500/10 to-transparent' : 'from-blue-400/10 to-transparent'
                }`} />
                <div className={`absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr rounded-tr-full ${
                  isDarkMode ? 'from-gray-400/10 to-transparent' : 'from-cyan-400/10 to-transparent'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={`py-20 relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-r from-black via-zinc-900 to-black' 
          : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700'
      }`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${isDarkMode ? '%23ffffff' : '%23ffffff'}' fill-opacity='${isDarkMode ? '0.08' : '0.2'}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-6">
          <h3 className={`text-4xl md:text-5xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-white'}`}>
            Đăng Ký Nhận Ưu Đãi 💌
          </h3>
          <p className={`${isDarkMode ? 'text-white/70' : 'text-white/90'} text-lg mb-10`}>
            Nhận ngay mã giảm giá 20% cho đơn hàng đầu tiên
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className={`flex-1 px-6 py-4 rounded-full focus:outline-none focus:ring-4 shadow-xl ${
                isDarkMode 
                  ? 'bg-zinc-900/70 text-white placeholder-gray-400 focus:ring-gray-600/40' 
                  : 'bg-white text-gray-700 placeholder-gray-400 focus:ring-white/50'
              }`}
            />
            <button className={`px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all ${
              isDarkMode ? 'bg-white text-gray-900' : 'bg-white text-blue-600'
            }`}>
              Đăng Ký Ngay
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
  className={`${isDarkMode ? 'text-white' : 'text-gray-900'} py-20 transition-all duration-500
    ${isDarkMode 
      ? "bg-gradient-to-r from-black via-zinc-900 to-black" 
      : "bg-gradient-to-br from-cyan-100 via-cyan-50 to-blue-100"
    }`}
>


    <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h5 className="font-black text-3xl mb-6 flex items-center gap-3">
                <span className={`${isDarkMode 
                  ? 'bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent' 
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent'}`}>BNJHAB</span>
              </h5>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-blue-900'} leading-relaxed mb-6`}>
                Nơi lưu giữ những kỷ niệm đẹp nhất của đôi lứa
              </p>
              <div className="flex gap-4">
                {['📘', '📷', '💬', '🐦'].map((social, idx) => (
                  <div 
                    key={idx}
                    className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer hover:scale-110"
                  >
                    <span className="text-2xl">{social}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {[
              { title: 'Sản Phẩm', items: ['Áo Đôi', 'Combo Quà', 'Phụ Kiện', 'E-Card'] },
              { title: 'Hỗ Trợ', items: ['Liên Hệ', 'Đổi Trả', 'Vận Chuyển', 'FAQs'] },
              { title: 'Về Chúng Tôi', items: ['Giới Thiệu', 'Tuyển Dụng', 'Blog', 'Đối Tác'] }
            ].map((column, idx) => (
              <div key={idx}>
                <h6 className={`font-bold text-lg mb-6 uppercase tracking-wider ${isDarkMode ? 'text-gray-200' : 'text-cyan-600'}`}>
                  {column.title}
                </h6>
                <div className="space-y-3">
                  {column.items.map((item, i) => (
                    <div 
                      key={i}
                      className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-blue-600 hover:text-blue-800'} transition-colors cursor-pointer hover:translate-x-2 transform duration-200`}
                    >
                      → {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className={`pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${isDarkMode ? 'border-t border-zinc-800' : 'border-t border-blue-800'}`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-blue-300'} text-sm`}>
              © 2025 BNJHAB. Thiết kế bởi ❤️ tại Việt Nam
            </p>
            <div className={`flex gap-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-blue-300'}`}>
              <span className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-blue-600'}`}>Chính Sách</span>
              <span className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-blue-600'}`}>Điều Khoản</span>
              <span className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-blue-600'}`}>Bảo Mật</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations & Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700;800;900&family=Quicksand:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(-5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        
        @keyframes wave-delayed {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-20deg); }
          75% { transform: rotate(20deg); }
        }
        
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes progress {
          from { width: 0%; }
          to { width: 75%; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-wave { animation: wave 2s ease-in-out infinite; }
        .animate-wave-delayed { animation: wave-delayed 2s ease-in-out infinite 0.5s; }
        .animate-shine { animation: shine 1.5s ease-in-out; }
        .animate-slide-right { animation: slide-right 2s linear infinite; }
        .animate-progress { animation: progress 2s ease-out forwards; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        
        * {
          scroll-behavior: smooth;
        }
        
        ::selection {
          background: rgba(6, 182, 212, 0.3);
          color: #0ea5e9;
        }
      `}</style>
    </div>
  );
}
