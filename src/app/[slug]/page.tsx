"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchWithCache } from "@/lib/fetchWithCache";
import { useAudio } from "@/lib/AudioContext";

interface Album {
  _id?: string;
  slug: string;
  name: string;
  dayStart: string;
  subtitle?: string;
  template: string;
  maleAvatar?: string;
  femaleAvatar?: string;
  photos: string[];
  createdAt: string;
  music?: string;
  messages?: { [key: string]: string };
  quote?: string;
  letterNotes?: Array<{
    title: string;
    content: string[];
    date: string;
  }>;
  views?: number;
  likes?: number;
}

export default function PhotoFrameViewer() {
  const params = useParams();
  const slug = params.slug as string;
  const { playMusic, isPlaying, toggleMusic } = useAudio();
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(4/3);
  const [daysInLove, setDaysInLove] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);



  const fetchAlbum = useCallback(async () => {
    try {
      setIsLoading(true);
      const albumData = await fetchWithCache(`/api/albums/${slug}`, { cacheTime: 10 * 60 * 1000 }) as Album;
        // Transform API data to match component interface
        const transformedAlbum: Album = {
          _id: albumData._id,
          slug: albumData.slug,
          name: albumData.name,
          dayStart: albumData.dayStart,
          subtitle: albumData.subtitle,
          template: albumData.template,
          maleAvatar: albumData.maleAvatar,
          femaleAvatar: albumData.femaleAvatar,
          photos: albumData.photos || [],
          createdAt: albumData.createdAt,
          music: albumData.music,
          messages: albumData.messages || {},
          quote: albumData.quote,
          letterNotes: albumData.letterNotes || [],
          views: albumData.views || 0,
          likes: albumData.likes || 0
        };
        setAlbum(transformedAlbum);
        
        // Play music if available
        if (transformedAlbum.music) {
          playMusic(transformedAlbum.music);
        }
    } catch (error) {
      console.error('Error fetching album:', error);
      setAlbum(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug, playMusic]);

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  // Load theme from localStorage after component mounts
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme');
      const storedBool = localStorage.getItem('darkMode');
      if (storedTheme === 'dark' || storedBool === 'true') {
        setIsDarkMode(true);
      } else if (storedTheme === 'light' || storedBool === 'false') {
        setIsDarkMode(false);
      }
    } catch {
      // ignore errors
    } finally {
      setIsThemeLoaded(true);
      setIsInitialLoad(false);
    }
  }, []);

  // Persist dark mode to localStorage when it changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      try {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
      } catch {
        // ignore write errors
      }
    }
  }, [isDarkMode, isInitialLoad]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };


  // Detect image aspect ratio
  const detectImageAspectRatio = (imageSrc: string) => {
    const img = new window.Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      setImageAspectRatio(aspectRatio);
    };
    img.src = imageSrc;
  };

  // Update aspect ratio when image changes
  useEffect(() => {
    if (album?.photos[currentIndex]) {
      detectImageAspectRatio(album.photos[currentIndex]);
    }
  }, [album, currentIndex]);

  const nextImage = useCallback(() => {
    if (album && !isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev + 1) % album.photos.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [album, isAnimating]);

  const prevImage = useCallback(() => {
    if (album && !isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev - 1 + album.photos.length) % album.photos.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [album, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!album || isAnimating) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [album, isAnimating, currentIndex, nextImage, prevImage]);

  // Calculate days in love with real-time updates
  useEffect(() => {
    if (album?.dayStart) {
      const calculateDays = () => {
        const start = new Date(album.dayStart);
        const now = new Date();
        const diffTime = now.getTime() - start.getTime();
        if (diffTime >= 0) {
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          setDaysInLove(diffDays);
        } else {
          setDaysInLove(0); // Ngày bắt đầu trong tương lai
        }
      };

      // Calculate immediately
      calculateDays();

      // Update every minute for real-time counter
      const interval = setInterval(calculateDays, 60000);

      return () => clearInterval(interval);
    }
  }, [album]);

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextImage();
    } else if (distance < -minSwipeDistance) {
      prevImage();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };


  const getCurrentMessage = () => {
    if (!album?.messages) return null;
    return album.messages[currentIndex.toString()];
  };

  if (isLoading || !isThemeLoaded) {
    return (
      <div className="h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto mb-4 border-rose-500"></div>
          <div className="text-lg font-medium text-gray-700">Đang tải album...</div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className={`h-screen flex items-center justify-center overflow-hidden transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
          : 'bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50'
      }`}>
        <div className="text-center px-4">
          <h1 className={`text-2xl md:text-3xl font-bold mb-4 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>Album không tồn tại</h1>
          <p className={`text-base md:text-lg mb-6 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Có thể link này đã bị xóa hoặc không chính xác</p>
          <Link 
            href="/" 
            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all inline-block text-sm md:text-base"
          >
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen relative overflow-hidden transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
        : 'bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50'
    }`}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {isDarkMode ? (
          <>
            <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-gray-700/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-10 right-10 w-40 h-40 md:w-60 md:h-60 bg-gray-600/20 rounded-full blur-3xl animate-float-delayed" />
          </>
        ) : (
          <>
            <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 bg-rose-300/30 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-10 right-10 w-40 h-40 md:w-60 md:h-60 bg-pink-300/30 rounded-full blur-3xl animate-float-delayed" />
          </>
        )}
      </div>

      {/* Floating Decorative Elements - Left Side */}

      {/* Floating Elements with Cone Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Left side floating elements */}
        <div 
          className="absolute left-2 text-2xl animate-float-up-cone" 
          style={{ animationDelay: '0s' }}
          data-drift-x="-20px"
        >
          🌸
        </div>
        <div 
          className="absolute left-6 text-xl animate-float-up-cone" 
          style={{ animationDelay: '2s' }}
          data-drift-x="-30px"
        >
          💕
        </div>
        <div 
          className="absolute left-4 text-lg animate-float-up-cone" 
          style={{ animationDelay: '4s' }}
          data-drift-x="-15px"
        >
          ⭐
        </div>
        <div 
          className="absolute left-8 text-xl animate-float-up-cone" 
          style={{ animationDelay: '6s' }}
          data-drift-x="-25px"
        >
          🌺
        </div>

        {/* Right side floating elements */}
        <div 
          className="absolute right-2 text-2xl animate-float-up-cone" 
          style={{ animationDelay: '1s' }}
          data-drift-x="20px"
        >
          🌹
        </div>
        <div 
          className="absolute right-6 text-xl animate-float-up-cone" 
          style={{ animationDelay: '3s' }}
          data-drift-x="30px"
        >
          💖
        </div>
        <div 
          className="absolute right-4 text-lg animate-float-up-cone" 
          style={{ animationDelay: '5s' }}
          data-drift-x="15px"
        >
          ✨
        </div>
        <div 
          className="absolute right-8 text-xl animate-float-up-cone" 
          style={{ animationDelay: '7s' }}
          data-drift-x="25px"
        >
          🌷
        </div>
      </div>


      {/* Audio Control Button */}
      {/* {album.music && (
        <button
          onClick={toggleMusic}
          className={`absolute top-4 left-4 z-50 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition-all shadow-lg ${
            isDarkMode 
              ? 'bg-gray-800/80 text-gray-200 hover:bg-gray-800' 
              : 'bg-white/80 text-gray-700 hover:bg-white'
          }`}
          aria-label={isPlaying ? "Tắt âm thanh" : "Bật âm thanh"}
        >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
        </button>
      )} */}

      {/* Dark Mode Toggle Button */}
      {/* <button
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 z-50 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition-all shadow-lg ${
          isDarkMode 
            ? 'bg-gray-800/80 text-gray-200 hover:bg-gray-800' 
            : 'bg-white/80 text-gray-700 hover:bg-white'
        }`}
        aria-label={isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      >
        {isDarkMode ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        )}
      </button> */}

      {/* Letter Button with Radar Effect */}
      <Link
        href={`/${slug}/Note`}
        className={`absolute top-4 right-4 z-50 group`}
        aria-label="Mở lá thư tình yêu"
      >
        {/* Radar Waves */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Outer radar ring */}
          <div className={`absolute w-20 h-20 rounded-full border-2 border-pink-400/30 radar-pulse`}></div>
          {/* Middle radar ring */}
          <div className={`absolute w-16 h-16 rounded-full border-2 border-pink-400/50 radar-pulse`} style={{animationDelay: '0.5s'}}></div>
          {/* Inner radar ring */}
          <div className={`absolute w-12 h-12 rounded-full border-2 border-pink-400/70 radar-pulse`} style={{animationDelay: '1s'}}></div>
        </div>

        {/* Pulsing glow effect */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/20 to-rose-400/20 glow-pulse`}></div>
        
        {/* Main button */}
        <div className={`relative backdrop-blur-sm p-3 rounded-full hover:scale-110 transition-all duration-300 shadow-2xl group-hover:shadow-pink-500/25 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/90 to-gray-700/90 text-pink-300 hover:from-pink-600/20 hover:to-rose-600/20' 
            : 'bg-gradient-to-br from-white/90 to-pink-50/90 text-pink-600 hover:from-pink-100/90 hover:to-rose-100/90'
        }`}>
          {/* Letter icon with floating animation */}
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          
          {/* Sparkle effects */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full sparkle-twinkle" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-rose-400 rounded-full sparkle-twinkle" style={{animationDelay: '0.8s'}}></div>
          <div className="absolute top-1 -left-2 w-1 h-1 bg-pink-300 rounded-full sparkle-twinkle" style={{animationDelay: '1.4s'}}></div>
        </div>

        {/* Floating hearts */}
        <div className="absolute -top-2 -right-2 w-3 h-3 text-pink-400 float-hearts" style={{animationDelay: '0.3s'}}>💕</div>
        <div className="absolute -bottom-2 -left-2 w-2 h-2 text-rose-400 float-hearts" style={{animationDelay: '1.1s'}}>💖</div>
        
        {/* Notification badge with pulsing effect */}
        
        
        {/* Additional floating sparkles around the button */}
        <div className="absolute -top-3 -left-3 w-1 h-1 bg-pink-300 rounded-full sparkle-twinkle" style={{animationDelay: '0.4s'}}></div>
        <div className="absolute -bottom-3 -right-3 w-1.5 h-1.5 bg-rose-300 rounded-full sparkle-twinkle" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute top-2 -right-6 w-1 h-1 bg-pink-400 rounded-full sparkle-twinkle" style={{animationDelay: '0.9s'}}></div>
        
        {/* Hover tooltip */}
        <div className={`absolute right-full mr-3 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
          isDarkMode 
            ? 'bg-gray-800 text-pink-300 border border-pink-400/30' 
            : 'bg-white text-pink-600 border border-pink-200 shadow-lg'
        }`}>
          💌 Lá thư tình yêu
          <div className={`absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 ${
            isDarkMode ? 'border-t-gray-800' : 'border-t-white'
          }`}></div>
        </div>
      </Link>

      {/* Main Photo Frame Viewer */}
      <main className="relative z-10 h-full flex items-center justify-center px-2 md:px-4">
        <div 
          className="relative w-full h-full max-w-4xl max-h-[90vh]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Title + Day Counter */}
          {album && (
            <div className="text-center mb-4 md:mb-6">         
              {/* Day Counter */}
              <div className={`inline-flex items-center gap-2 backdrop-blur-sm px-4 py-0 rounded-full shadow-md ${
                isDarkMode 
                  ? 'bg-gray-800/60' 
                  : 'bg-white/60'
              }`}>
                <span className={`text-lg md:text-xl font-bold ${
                  isDarkMode ? 'text-rose-400' : 'text-pink-500'
                }`}>
                  {daysInLove}
                </span>
                <span className={`text-sm md:text-base font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  ngày yêu nhau
                </span>
                <span className="text-pink-400 text-lg">💕</span>
              </div>
            </div>
          )}

          {/* Polaroid-Style Photo Frame */}
          <div className="relative mx-auto h-full flex flex-col justify-center ">
            {/* Main Frame Container with 3D Shadow */}
            <div 
              className={`relative bg-white rounded-xl md:rounded-2xl shadow-2xl transition-all mb-12 duration-500 ${
                isAnimating ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
              }`}
              style={{
                padding: '12px 12px 60px 12px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              {/* Photo Container with Dynamic Aspect Ratio */}
              <div 
                className="relative w-full overflow-hidden rounded-lg bg-gray-100"
                style={{
                  aspectRatio: imageAspectRatio,
                  maxHeight: 'calc(100vh - 200px)'
                }}
              >
                <Image
                  src={album.photos[currentIndex]}
                  alt={`${album.name} - Ảnh ${currentIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                
                {/* Photo Border Shadow Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.1)'
                  }}
                />
              </div>

              {/* Message Caption Area */}
              <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 flex items-center justify-center px-4 md:px-8">
                {getCurrentMessage() ? (
                  <p 
                    className={`text-center text-xs md:text-sm font-medium italic ${
                      isDarkMode ? 'text-gray-700' : 'text-gray-900'
                    }`}
                    style={{
                      fontFamily: "'Quicksand', 'Nunito', sans-serif"
                    }}
                  >
                    {getCurrentMessage()}
                  </p>
                ) : (
                  <div className="flex gap-1 md:gap-2">
                    
                  </div>
                )}
              </div>

              {/* Decorative Corner Stickers */}
              <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-lg flex items-center justify-center transform rotate-12">
                <span className="text-white text-sm md:text-xl">♥</span>
              </div>
            </div>

            {/* Tape Effect at Top */}
            </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            disabled={isAnimating}
            className={`absolute hidden md:flex md:left-[-100px] top-1/2 -translate-y-1/2 z-30 backdrop-blur-sm p-2 md:p-3 rounded-full hover:scale-110 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group ${
              isDarkMode 
                ? 'bg-gray-800/80 text-gray-200 hover:bg-gray-800' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
            aria-label="Ảnh trước"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextImage}
            disabled={isAnimating}
            className={`absolute hidden md:flex md:right-[-100px] top-1/2 -translate-y-1/2 z-30 backdrop-blur-sm p-2 md:p-3 rounded-full hover:scale-110 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group ${
              isDarkMode 
                ? 'bg-gray-800/80 text-gray-200 hover:bg-gray-800' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
            aria-label="Ảnh tiếp theo"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>


          
        </div>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-3deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }

        @keyframes float-up-cone {
          0% { 
            transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateY(-100px) translateX(0px) rotate(0deg) scale(1);
            opacity: 0;
          }
        }

        .animate-float-up-cone[data-drift-x="-20px"] {
          animation: float-up-cone-left-20 8s ease-out infinite;
        }
        .animate-float-up-cone[data-drift-x="-30px"] {
          animation: float-up-cone-left-30 10s ease-out infinite;
        }
        .animate-float-up-cone[data-drift-x="-15px"] {
          animation: float-up-cone-left-15 12s ease-out infinite;
        }
        .animate-float-up-cone[data-drift-x="-25px"] {
          animation: float-up-cone-left-25 9s ease-out infinite;
        }
        .animate-float-up-cone[data-drift-x="20px"] {
          animation: float-up-cone-right-20 8s ease-out infinite;
        }
        .animate-float-up-cone[data-drift-x="30px"] {
          animation: float-up-cone-right-30 10s ease-out infinite;
        }
        .animate-float-up-cone[data-drift-x="15px"] {
          animation: float-up-cone-right-15 12s ease-out infinite;
        }
        .animate-float-up-cone[data-drift-x="25px"] {
          animation: float-up-cone-right-25 9s ease-out infinite;
        }

        @keyframes float-up-cone-left-20 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(-20px) rotate(15deg) scale(1); opacity: 0; }
        }
        @keyframes float-up-cone-left-30 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(-30px) rotate(-10deg) scale(1); opacity: 0; }
        }
        @keyframes float-up-cone-left-15 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(-15px) rotate(20deg) scale(1); opacity: 0; }
        }
        @keyframes float-up-cone-left-25 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(-25px) rotate(-15deg) scale(1); opacity: 0; }
        }
        @keyframes float-up-cone-right-20 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(20px) rotate(-15deg) scale(1); opacity: 0; }
        }
        @keyframes float-up-cone-right-30 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(30px) rotate(10deg) scale(1); opacity: 0; }
        }
        @keyframes float-up-cone-right-15 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(15px) rotate(-20deg) scale(1); opacity: 0; }
        }
        @keyframes float-up-cone-right-25 {
          0% { transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) translateX(25px) rotate(15deg) scale(1); opacity: 0; }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        
        /* Custom radar and sparkle animations */
        @keyframes radar-pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        
        @keyframes sparkle-twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.5) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
        }
        
        @keyframes float-hearts {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(8deg);
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(236, 72, 153, 0.6), 0 0 60px rgba(244, 114, 182, 0.4);
          }
        }
        
        .radar-pulse {
          animation: radar-pulse 2s infinite;
        }
        
        .sparkle-twinkle {
          animation: sparkle-twinkle 2s infinite;
        }
        
        .float-hearts {
          animation: float-hearts 3s ease-in-out infinite;
        }
        
        .glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        * {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
