"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useRouter } from "next/navigation";
import HTMLFlipBook from "react-pageflip";
import { fetchWithCache } from "@/lib/fetchWithCache";
import "@/lib/cacheDebug";
import { useAudio } from "@/lib/AudioContext";

const AVATAR_1 = "https://randomuser.me/api/portraits/women/68.jpg";
const AVATAR_2 = "https://randomuser.me/api/portraits/men/29.jpg";

// Default notes if no data from database
const defaultNotes = [
  {
    title: "Ngày Đầu Tiên",
    lines: ["Chúc anh béo 1 ngày vui vẻ hạnh phúc", "Yêu anh nhiều lắm ❤️"],
    date: "14/02/2024"
  },
  {
    title: "Mãi Bên Nhau",
    lines: ["Em yêu anh hơn hôm qua!", "Và sẽ yêu anh mãi mãi 💕"],
    date: "15/02/2024"
  },
  {
    title: "Kỷ Niệm Đẹp",
    lines: ["Cảm ơn anh vì tất cả", "Em sẽ luôn ở bên anh 🌹"],
    date: "16/02/2024"
  },
];

// Component trang note với thiết kế đẹp
const NotePageSingle = forwardRef<HTMLDivElement, { note: typeof defaultNotes[0], isDarkMode: boolean, maleAvatar?: string, femaleAvatar?: string }>(
  ({ note, isDarkMode, maleAvatar, femaleAvatar }, ref) => (
    <div
  ref={ref}
  className={`relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 transition-all duration-500 ${
    isDarkMode
      ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
      : "bg-gradient-to-br from-pink-200 via-rose-100 to-purple-200"
  } shadow-[0_0_20px_rgba(0,0,0,0.3)] rounded-2xl`}
>
      {/* Header với avatar */}
      <div className="absolute top-4 sm:top-6 left-0 right-0 flex items-center justify-between px-4 sm:px-8 z-20">
        <div className="relative">
          <img 
            src={femaleAvatar || AVATAR_1} 
            alt="Avatar Nữ" 
            className="rounded-full border-4 border-white h-12 w-12 sm:h-16 sm:w-16 object-cover shadow-xl ring-2 ring-pink-200/50 hover:scale-110 transition-transform duration-300" 
          />
          </div>
        
        {/* Icon thư với animation */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative bg-white rounded-full p-2 sm:p-3 shadow-lg">
          <svg fill="none" viewBox="0 0 24 24" className="h-8 w-8 sm:h-12 sm:w-12 text-pink-500">
  <path
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    d="M12 21s-6-4.35-9-8.5C1.67 9.27 2.5 5 6.5 5c2.54 0 4 2 5.5 3.5C13.5 7 15 5 17.5 5c4 0 4.83 4.27 3.5 7.5-3 4.15-9 8.5-9 8.5z"
  />
</svg>

          </div>
        </div>
        
        <div className="relative">
          <img 
            src={maleAvatar || AVATAR_2} 
            alt="Avatar Nam" 
            className="rounded-full border-4 border-white h-12 w-12 sm:h-16 sm:w-16 object-cover shadow-xl ring-2 ring-blue-200/50 hover:scale-110 transition-transform duration-300" 
          />
             </div>
      </div>

      {/* Giấy note với viền đẹp và bóng 3D */}
      <div className={`relative mt-16 sm:mt-24 w-[90%] sm:w-[85%] h-[75%] sm:h-[70%] rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-slate-700 to-gray-800' 
          : 'bg-gradient-to-br from-amber-50 via-white to-pink-50'
      }`}>
        {/* Viền giấy vẽ tay */}
        

        {/* Pattern dots bên trái */}
        <div className="absolute left-4 sm:left-8 top-0 bottom-0 flex flex-col justify-start pt-12 sm:pt-20 gap-3 sm:gap-4 z-10">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              isDarkMode ? 'bg-gray-400/40' : 'bg-pink-300/40'
            }`}></div>
          ))}
        </div>

        {/* Nội dung note */}
        <div className="relative z-20 px-8 sm:px-16 py-8 sm:py-16 h-full flex flex-col">
          {/* Tiêu đề */}
          <div className="text-center mb-4 sm:mb-8">
            <h2 
              className={`text-xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent mb-1 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400' 
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500'
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {note.title}
            </h2>
            <div className={`flex items-center justify-center gap-2 text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span>{note.date}</span>
            </div>
          </div>

          {/* Nội dung chữ viết tay */}
          <div className="flex-1 overflow-auto">
            <ul className="space-y-3 sm:space-y-6">
              {note.lines.map((line: string, idx: number) => (
                <li key={idx} className="flex items-start group">
                  <div className="mt-1 mr-3 sm:mr-6 relative">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full group-hover:scale-150 transition-transform duration-300 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-gray-400 to-gray-500' 
                        : 'bg-gradient-to-br from-pink-400 to-rose-500'
                    }`}></div>
                    <div className={`absolute inset-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-ping opacity-75 ${
                      isDarkMode ? 'bg-gray-400' : 'bg-pink-400'
                    }`}></div>
                  </div>
                  <span 
                    className={`text-base sm:text-xl lg:text-2xl leading-relaxed transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 group-hover:text-gray-100' 
                        : 'text-gray-700 group-hover:text-pink-600'
                    }`}
                  style={{ fontFamily: 'sans-serif' }}

                  >
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          
        </div>

        {/* Floating hearts animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-hearts opacity-20"
              style={{
                left: `${15 + i * 25}%`,
                animationDelay: `${i * 0.7}s`,
                fontSize: `${10 + i * 3}px`
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      </div>
    </div>
  )
);
NotePageSingle.displayName = "NotePageSingle";

export default function NotePage() {
  const router = useRouter();
  const bookRef = useRef<HTMLDivElement>(null);
  const { playMusic, isPlaying, toggleMusic } = useAudio();
  const [currentPage, setCurrentPage] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 380, height: 500 });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [notes, setNotes] = useState(defaultNotes);
  const [isLoading, setIsLoading] = useState(true);
  const [albumData, setAlbumData] = useState<{ maleAvatar?: string; femaleAvatar?: string; music?: string; letterNotes?: Array<{ title: string; content: string[]; date: string; }> } | null>(null);

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

  // Load letter notes and album data from database
  useEffect(() => {
    const loadLetterNotes = async () => {
      try {
        // Get slug from URL
        const pathParts = window.location.pathname.split('/');
        const slug = pathParts[1]; // Assuming URL is /[slug]/Note
        
        if (slug) {
          const album = await fetchWithCache(`/api/albums/${slug}`, { cacheTime: 10 * 60 * 1000 }) as { maleAvatar?: string; femaleAvatar?: string; music?: string; letterNotes?: Array<{ title: string; content: string[]; date: string; }> };
          setAlbumData(album); // Store album data for avatars
          
          if (album.letterNotes && album.letterNotes.length > 0) {
            // Convert letter notes to the format expected by the component
            const formattedNotes = album.letterNotes.map((note: { title: string; content: string[]; date: string }) => ({
              title: note.title,
              lines: Array.isArray(note.content) ? note.content : (note.content as string).split('\n').filter((line: string) => line.trim()),
              date: note.date
            }));
            setNotes(formattedNotes);
          }
          
          // Play music if available
          if (album.music) {
            playMusic(album.music);
          }
        }
      } catch (error) {
        console.error('Error loading letter notes:', error);
        // Keep default notes if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      loadLetterNotes();
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 768;
        const newWidth = isMobile ? window.innerWidth - 32 : Math.min(window.innerWidth * 0.7, 800);
        const newHeight = isMobile ? window.innerHeight - 100 : Math.min(window.innerHeight * 0.8, 700);
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
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

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
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
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show loading until theme is loaded and letter notes are loaded
  if (!isThemeLoaded || isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-pink-200 via-rose-100 to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto mb-4 border-pink-500"></div>
          <div className="text-lg font-medium text-gray-700">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
        : 'bg-gradient-to-br from-pink-200 via-rose-100 to-purple-200'
    }`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isDarkMode ? (
          <>
            <div className="absolute top-20 left-20 w-64 h-64 bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-20 w-64 h-64 bg-gray-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-40 w-64 h-64 bg-gray-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </>
        ) : (
          <>
            <div className="absolute top-20 left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-40 w-64 h-64 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </>
        )}
      </div>

      {/* Audio Control Button */}
      {albumData?.music && (
        <button
          onClick={toggleMusic}
          className={`absolute top-4 left-4 backdrop-blur-sm shadow-lg rounded-full w-12 h-12 flex items-center justify-center z-50 hover:scale-110 transition-all duration-300 group ${
            isDarkMode 
              ? 'bg-gray-800/90 text-gray-200 border-2 border-gray-600 hover:border-gray-400' 
              : 'bg-white/90 text-gray-700 border-2 border-pink-200 hover:border-pink-400'
          }`}
          title={isPlaying ? "Tắt âm thanh" : "Bật âm thanh"}
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
      )}

      {/* Nút đóng */}
      <button
        onClick={() => router.back()}
        className={`absolute top-4 right-4 backdrop-blur-sm shadow-lg rounded-full w-12 h-12 flex items-center justify-center z-50 hover:scale-110 hover:rotate-90 transition-all duration-300 group ${
          isDarkMode 
            ? 'bg-gray-800/90 text-gray-200 border-2 border-gray-600 hover:border-gray-400' 
            : 'bg-white/90 text-gray-700 border-2 border-pink-200 hover:border-pink-400'
        }`}
        title="Đóng"
      >
        <span className={`text-xl transition-colors ${
          isDarkMode ? 'group-hover:text-gray-100' : 'group-hover:text-pink-500'
        }`}>✕</span>
      </button>

      {/* Page counter */}
      <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 ${
        isDarkMode 
          ? 'bg-gray-800/90' 
          : 'bg-white/90'
      }`}>
        <svg className={`w-4 h-4 ${
          isDarkMode ? 'text-gray-300' : 'text-pink-500'
        }`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
        </svg>
        <span className={`text-sm font-semibold ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>{currentPage + 1} / {notes.length}</span>
      </div>

      {/* FlipBook - Responsive sizing */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
        <HTMLFlipBook
          ref={bookRef}
          width={dimensions.width}
          height={dimensions.height}
          size="fixed"
          minWidth={300}
          maxWidth={800}
          minHeight={400}
          maxHeight={700}
          maxShadowOpacity={0.8}
          drawShadow={true}
          flippingTime={800}
          useMouseEvents={true}
          mobileScrollSupport={true}
          clickEventForward={false}
          className="shadow-2xl"
          style={{}}
          startPage={0}
          usePortrait={true}
          startZIndex={0}
          autoSize={false}
          showCover={false}
          disableFlipByClick={false}
          swipeDistance={30}
          showPageCorners={true}
          onFlip={(e) => setCurrentPage(e.data as number)}
        >
          {notes.map((note, index) => (
            <NotePageSingle 
              key={index} 
              note={note} 
              isDarkMode={isDarkMode} 
              maleAvatar={albumData?.maleAvatar}
              femaleAvatar={albumData?.femaleAvatar}
            />
          ))}
        </HTMLFlipBook>
      </div>

      {/* Fonts & Animations */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:wght@700&display=swap");
        
        @font-face {
          font-family: 'Bohemian Typewriter';
          src: url('/uploads/bohemian-typewriter-cdnfonts/Bohemian Typewriter.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        @keyframes float-hearts {
          0% {
            transform: translateY(100%) scale(0);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-800%) scale(1);
            opacity: 0;
          }
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-float-hearts {
          animation: float-hearts 4s infinite ease-in;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
